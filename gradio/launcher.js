/*
 * The Gradio launcher: a tab docked in the bottom-right corner of the page,
 * in place of the footer. It shows the session's running and queued events,
 * and after a run it offers the exact call as Python, JavaScript, cURL or an
 * MCP tool call, followed by the footer's links.
 *
 * Gradio serves this file at /gradio_api/launcher.js, after a line that sets
 * window.__GRADIO_LAUNCHER__ to { links, root, mode }, and adds its <script>
 * tag to the <head> of the Blocks page and of the HTML pages a gr.Server
 * serves from a StaticFiles mount at "/". It works on any page that talks to
 * the app through @gradio/client: it watches the client's requests to
 * /queue/join and the /queue/data event stream, so it has to load before the
 * page's own scripts.
 *
 * In a Blocks app, the API docs and settings are panels of the Blocks page:
 * the launcher opens them with a "gradio:launcher" window event.
 */
(() => {
  if (window.__gradio_launcher_loaded) return;
  window.__gradio_launcher_loaded = true;
  const OPTIONS = window.__GRADIO_LAUNCHER__ || {};
  const LINKS = OPTIONS.links || ["api", "gradio", "settings", "runs"];
  const BLOCKS = OPTIONS.mode === "blocks";

  const MAX_FINISHED = 5;
  const PEEK_MS = 7000;
  const state = {
    events: new Map(), // event_id -> event
    root: OPTIONS.root ? OPTIONS.root.replace(/\/?$/, "/") : null, // the app's root URL
    config: null,
    info: null,
    lastRun: null,
    unseen: null, // "done" | "err"
    offline: !navigator.onLine,
    open: false,
    view: "list", // "list" | "code"
    codeEvent: null,
    tab: "python",
    peekUntil: 0,
    runsUrl:
      LINKS.includes("runs") && OPTIONS.root
        ? OPTIONS.root.replace(/\/?$/, "/") + "gradio_api/runs"
        : "",
    copied: false,
    enter: false, // play the panel's opening animation on the next render
  };

  // ------------------------------------------------------------------
  // Watching the queue
  // ------------------------------------------------------------------
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input && input.url;
    const method = (
      (init && init.method) ||
      (input && input.method) ||
      "GET"
    ).toUpperCase();
    let join = null;
    if (
      url &&
      /\/queue\/join(\?|$)/.test(url) &&
      init &&
      typeof init.body === "string"
    ) {
      try {
        join = JSON.parse(init.body);
      } catch (e) {}
    }
    const res = await nativeFetch(input, init);
    try {
      if (join && res.ok) {
        res
          .clone()
          .json()
          .then(
            (body) =>
              body && body.event_id && on_join(url, join, body.event_id),
          )
          .catch(() => {});
      } else if (
        url &&
        method === "GET" &&
        /\/queue\/data(\?|$)/.test(url) &&
        res.ok &&
        res.body
      ) {
        read_stream(res.clone());
      }
    } catch (e) {}
    return res;
  };

  function root_from(url) {
    const u = new URL(url, location.href);
    const i = u.pathname.indexOf("/gradio_api/");
    const path =
      i >= 0
        ? u.pathname.slice(0, i + 1)
        : u.pathname.replace(/queue\/(join|data).*$/, "");
    return u.origin + path;
  }

  function event_for(id) {
    let ev = state.events.get(id);
    if (!ev) {
      ev = {
        id,
        fn: null,
        data: [],
        session: null,
        status: "queued",
        rank: null,
        size: null,
        queued_at: Date.now(),
        started_at: null,
        ended_at: null,
        progress: null,
        error: null,
      };
      state.events.set(id, ev);
    }
    return ev;
  }

  function on_join(url, body, event_id) {
    state.root = state.root || root_from(url);
    const ev = event_for(event_id);
    ev.fn = body.fn_index;
    ev.data = body.data || [];
    ev.session = body.session_hash;
    load_config();
    render();
  }

  async function read_stream(res) {
    state.root = state.root || root_from(res.url);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut;
        while ((cut = buffer.indexOf("\n\n")) >= 0) {
          const block = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          const data = block
            .split("\n")
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim())
            .join("\n");
          if (!data) continue;
          try {
            on_message(JSON.parse(data));
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  function on_message(msg) {
    if (!msg || !msg.event_id || !msg.msg) return;
    const ev = event_for(msg.event_id);
    switch (msg.msg) {
      case "estimation":
        if (ev.status === "queued") {
          ev.rank = msg.rank;
          ev.size = msg.queue_size;
        }
        break;
      case "process_starts":
        ev.status = "running";
        ev.started_at = Date.now();
        break;
      case "progress": {
        ev.status = "running";
        ev.started_at = ev.started_at || Date.now();
        const p = (msg.progress_data || []).find((p) => p) || null;
        ev.progress = p;
        break;
      }
      case "process_generating":
        ev.status = "running";
        ev.started_at = ev.started_at || Date.now();
        break;
      case "process_completed": {
        ev.ended_at = Date.now();
        const out = msg.output || {};
        if (msg.success === false || out.error) {
          ev.status = "failed";
          ev.error = (out.error && String(out.error)) || "Error";
          state.unseen = "err";
        } else {
          ev.status = "done";
          state.lastRun = ev;
          if (state.unseen !== "err") state.unseen = "done";
          if (!state.open) state.peekUntil = Date.now() + PEEK_MS;
          state.peekPending = true;
        }
        break;
      }
      case "unexpected_error":
        ev.status = "failed";
        ev.error = msg.message || "Unexpected error";
        ev.ended_at = Date.now();
        state.unseen = "err";
        break;
      default:
        return;
    }
    render();
  }

  addEventListener("online", () => ((state.offline = false), render()));
  addEventListener("offline", () => ((state.offline = true), render()));

  // ------------------------------------------------------------------
  // App config and API info
  // ------------------------------------------------------------------
  let config_promise = null;
  function load_config() {
    if (state.config || config_promise) return config_promise;
    if (window.gradio_config && window.gradio_config.dependencies) {
      state.config = window.gradio_config;
      return Promise.resolve();
    }
    if (!state.root) return null;
    config_promise = nativeFetch(state.root + "config")
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        state.config = c;
        render();
      })
      .catch(() => {});
    return config_promise;
  }
  let info_promise = null;
  function load_info() {
    if (state.info || info_promise || !state.root) return info_promise;
    info_promise = nativeFetch(state.root + "gradio_api/info")
      .then((r) => (r.ok ? r.json() : null))
      .then((i) => {
        state.info = i;
        render();
      })
      .catch(() => {});
    return info_promise;
  }
  function dependency(ev) {
    const deps = (state.config && state.config.dependencies) || [];
    return deps.find((d) => d.id === ev.fn) || deps[ev.fn] || null;
  }
  function api_name(ev) {
    const dep = dependency(ev);
    if (dep && typeof dep.api_name === "string" && dep.api_name)
      return dep.api_name;
    return null;
  }
  function label(ev) {
    const name = api_name(ev);
    return name ? "/" + name : ev.fn != null ? `fn ${ev.fn}` : "event";
  }

  // ------------------------------------------------------------------
  // Snippets for a run
  // ------------------------------------------------------------------
  const is_file = (v) =>
    v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    (v.meta?._type === "gradio.FileData" ||
      ("path" in v && ("url" in v || "orig_name" in v)));
  const file_url = (v) =>
    v.url || (state.root ? state.root + "gradio_api/file=" + v.path : v.path);
  const clip = (s) => (s.length > 160 ? s.slice(0, 157) + "…" : s);

  function py(v, indent = "") {
    if (v === null || v === undefined) return "None";
    if (v === true) return "True";
    if (v === false) return "False";
    if (typeof v === "string") return JSON.stringify(clip(v));
    if (typeof v === "number") return String(v);
    if (is_file(v)) return `handle_file(${JSON.stringify(file_url(v))})`;
    if (Array.isArray(v)) {
      const parts = v.map((x) => py(x, indent));
      const flat = `[${parts.join(", ")}]`;
      return flat.length < 60 ? flat : clip(flat);
    }
    const flat = `{${Object.entries(v)
      .map(([k, x]) => `${JSON.stringify(k)}: ${py(x)}`)
      .join(", ")}}`;
    return clip(flat);
  }
  function js(v) {
    if (v === undefined) return "null";
    if (typeof v === "string") return JSON.stringify(clip(v));
    if (is_file(v)) return `handle_file(${JSON.stringify(file_url(v))})`;
    if (Array.isArray(v)) return clip(`[${v.map(js).join(", ")}]`);
    if (v && typeof v === "object")
      return clip(
        `{ ${Object.entries(v)
          .map(([k, x]) => `${JSON.stringify(k)}: ${js(x)}`)
          .join(", ")} }`,
      );
    return JSON.stringify(v);
  }
  function plain(v) {
    if (typeof v === "string") return clip(v);
    if (is_file(v))
      return { path: file_url(v), meta: { _type: "gradio.FileData" } };
    if (Array.isArray(v)) return v.map(plain);
    return v;
  }

  function params(ev) {
    const name = api_name(ev);
    const ep =
      name &&
      state.info &&
      state.info.named_endpoints &&
      state.info.named_endpoints["/" + name];
    const values = ev.data || [];
    if (!ep) return values.map((v, i) => ({ name: null, value: v }));
    const p = ep.parameters || [];
    let vals = values;
    if (values.length !== p.length)
      vals = values.filter((v) => v !== null).slice(0, p.length);
    return p.map((param, i) => ({
      name: param.parameter_name || null,
      value: i < vals.length ? vals[i] : (param.example_input ?? null),
    }));
  }
  function target() {
    const sid = state.config && state.config.space_id;
    return sid || (state.root || location.origin + "/").replace(/\/$/, "");
  }
  function snippet(ev, tab) {
    const name = api_name(ev) || String(ev.fn);
    const ps = params(ev);
    const uses_file = ps.some(
      (p) =>
        JSON.stringify(p.value || "").includes("gradio.FileData") ||
        is_file(p.value),
    );
    const named = ps.every((p) => p.name);
    const root = (state.root || location.origin + "/").replace(/\/$/, "");
    if (tab === "python") {
      const args = ps.map(
        (p) => `    ${named ? p.name + "=" : ""}${py(p.value)},`,
      );
      return [
        `from gradio_client import Client${uses_file ? ", handle_file" : ""}`,
        "",
        `client = Client(${JSON.stringify(target())})`,
        `result = client.predict(`,
        ...args,
        `    api_name=${JSON.stringify("/" + name)},`,
        `)`,
        `print(result)`,
      ].join("\n");
    }
    if (tab === "js") {
      const body = named
        ? `{\n${ps.map((p) => `  ${p.name}: ${js(p.value)},`).join("\n")}\n}`
        : `[${ps.map((p) => js(p.value)).join(", ")}]`;
      return [
        `import { Client${uses_file ? ", handle_file" : ""} } from "@gradio/client";`,
        "",
        `const client = await Client.connect(${JSON.stringify(target())});`,
        `const result = await client.predict(${JSON.stringify("/" + name)}, ${body});`,
        `console.log(result.data);`,
      ].join("\n");
    }
    if (tab === "curl") {
      const data = JSON.stringify({ data: ps.map((p) => plain(p.value)) });
      return [
        `curl -X POST ${root}/gradio_api/call/${name} -s \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '${data.replace(/'/g, "'\\''")}' \\`,
        `  | awk -F'"' '{ print $4 }' \\`,
        `  | read EVENT_ID; curl -N ${root}/gradio_api/call/${name}/$EVENT_ID`,
      ].join("\n");
    }
    // MCP
    const args = {};
    ps.forEach((p, i) => (args[p.name || `arg_${i}`] = plain(p.value)));
    return [
      `// 1. Add this app to your agent's MCP servers`,
      JSON.stringify(
        {
          mcpServers: {
            [target().split("/").pop()]: { url: `${root}/gradio_api/mcp/` },
          },
        },
        null,
        2,
      ),
      "",
      `// 2. The tool call for this run`,
      `${name}(${JSON.stringify(args, null, 2)})`,
    ].join("\n");
  }

  function open_in_blocks(panel) {
    window.dispatchEvent(new CustomEvent("gradio:launcher", { detail: panel }));
  }

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  const I = {
    logo: `<svg class="logo" viewBox="0 0 576 576" fill="none"><defs><linearGradient id="la" x1="60" y1="341" x2="429.5" y2="344" gradientUnits="userSpaceOnUse"><stop stop-color="#F9D100"/><stop offset="1" stop-color="#F97700"/></linearGradient><linearGradient id="lb" x1="513.5" y1="231" x2="143.5" y2="231" gradientUnits="userSpaceOnUse"><stop stop-color="#F9D100"/><stop offset="1" stop-color="#F97700"/></linearGradient><linearGradient id="lc" x1="60" y1="344" x2="428.987" y2="341.811" gradientUnits="userSpaceOnUse"><stop stop-color="#F9D100"/><stop offset="1" stop-color="#F97700"/></linearGradient></defs><path d="M287.5 229L86 344.5L287.5 460L489 344.5L287.5 229Z" stroke="url(#la)" stroke-width="59" stroke-linejoin="round"/><path d="M287.5 116L86 231.5L287.5 347L489 231.5L287.5 116Z" stroke="url(#lb)" stroke-width="59" stroke-linejoin="round"/><path d="M86 344L288 229" stroke="url(#lc)" stroke-width="59" stroke-linejoin="bevel"/></svg>`,
    code: `<svg class="i" viewBox="0 0 24 24"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>`,
    history: `<svg class="i" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,
    gear: `<svg class="i" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    check: `<svg class="i" viewBox="0 0 24 24" style="stroke-width:2.5"><path d="M20 6 9 17l-5-5"/></svg>`,
    bang: `<svg class="i" viewBox="0 0 24 24" style="stroke-width:3"><path d="M12 6v7"/><path d="M12 18h.01"/></svg>`,
    alert: `<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    clock: `<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    x: `<svg class="i" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    back: `<svg class="i" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>`,
    copy: `<svg class="i" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    bot: `<svg class="i" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
    arrow: `<svg class="i" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  };

  const CSS = `
:host { all: initial; }
* { box-sizing: border-box; }
.root {
  --bg: #ffffff; --panel: #ffffff; --chip: #f4f4f5; --chip-hover: #e4e4e7; --hairline: #e4e4e7;
  --text: #27272a; --text-strong: #18181b; --subdued: #71717a; --faint: #a1a1aa;
  --accent: #f97316; --accent-strong: #ea580c; --accent-soft: #fff7ed; --accent-line: #ffddb3;
  --ok: #16a34a; --err: #dc2626; --code-bg: #fafafa; --code-text: #3f3f46;
  --shadow: 0 1px 2px rgba(0,0,0,.05), 0 10px 30px -8px rgba(24,24,27,.22);
  --scrim: rgba(24,24,27,.3);
  font: 14px/1.4 "Source Sans Pro", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--text); -webkit-font-smoothing: antialiased;
}
.root.dark {
  --bg: #0f0f11; --panel: #18181b; --chip: #27272a; --chip-hover: #3f3f46; --hairline: #2e2e33;
  --text: #e4e4e7; --text-strong: #fafafa; --subdued: #a1a1aa; --faint: #71717a;
  --accent-strong: #fb923c; --accent-soft: rgba(249,115,22,.12); --accent-line: rgba(249,115,22,.35);
  --ok: #4ade80; --err: #f87171; --code-bg: #0f0f11; --code-text: #d4d4d8;
  --shadow: 0 1px 2px rgba(0,0,0,.3), 0 14px 36px -8px rgba(0,0,0,.7); --scrim: rgba(0,0,0,.5);
}
code, pre { font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.i { width: 15px; height: 15px; flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.logo { width: 20px; height: 20px; flex: none; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
a { color: inherit; text-decoration: none; }

/* ---- the tab ---- */
.tab {
  position: fixed; right: 0; bottom: 0; z-index: 2147483000;
  height: 44px; min-width: 54px; padding: 0 16px 0 17px;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  background: var(--panel); color: var(--text);
  border: 1px solid var(--hairline); border-width: 1px 0 0 1px; border-radius: 12px 0 0 0;
  box-shadow: -6px -6px 18px -10px rgba(24,24,27,.28);
  transition: background .15s;
  white-space: nowrap; font-size: 13px;
}
.tab:hover { background: var(--chip); }
.tab.open { background: var(--chip); }
.tab.off .logo { filter: grayscale(1); opacity: .45; }
.tab.peek { background: var(--accent-soft); color: var(--accent-strong); font-weight: 600; border-color: var(--accent-line); }
.tab.peek code { font-size: 12px; font-weight: 400; }
.tab .sep { width: 1px; height: 18px; background: var(--accent-line); }
.tab .msg { display: inline-flex; align-items: center; gap: 6px; }
.bar { position: absolute; top: -1px; left: 11px; right: 0; height: 3px; border-radius: 0 0 2px 2px; background: var(--accent-line); overflow: hidden; }
.bar i { position: absolute; top: 0; bottom: 0; left: 0; background: var(--accent); transition: width .4s; }
.bar.indet i { width: 30%; animation: slide 1.3s ease-in-out infinite; }
.bar.off { background: var(--chip-hover); }
@keyframes slide { from { left: -30%; } to { left: 100%; } }
.badge {
  position: absolute; left: -8px; top: -8px; min-width: 19px; height: 19px; padding: 0 5px;
  border-radius: 10px; background: var(--accent); color: #fff;
  font: 700 11px/19px "Source Sans Pro", ui-sans-serif, system-ui, sans-serif; text-align: center;
  box-shadow: 0 0 0 2px var(--bg); display: flex; align-items: center; justify-content: center;
}
.badge .i { width: 11px; height: 11px; }
.badge.queued { background: var(--panel); color: var(--accent-strong); box-shadow: inset 0 0 0 1.5px var(--accent), 0 0 0 2px var(--bg); }
.badge.done { background: var(--ok); }
.root.dark .badge.done { color: #052e16; }
.badge.err { background: var(--err); }

/* ---- the panel ---- */
.scrim { position: fixed; inset: 0; background: var(--scrim); z-index: 2147482998; display: none; }
.pop {
  position: fixed; right: 10px; bottom: 54px; z-index: 2147482999;
  width: 316px; max-height: calc(100vh - 80px); overflow: auto;
  background: var(--panel); border: 1px solid var(--hairline); border-radius: 12px;
  box-shadow: var(--shadow); display: flex; flex-direction: column;
}
.pop.enter { animation: rise .16s ease-out; }
.pop.wide { width: 460px; }
@keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.sec { padding: 10px 12px 6px; border-bottom: 1px solid var(--hairline); }
.sec-h { display: flex; align-items: center; gap: 6px; font: 600 11px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--subdued); margin-bottom: 4px; }
.sec-h .n { font-family: "Source Sans Pro", ui-sans-serif, system-ui, sans-serif; letter-spacing: 0; min-width: 17px; height: 17px; border-radius: 9px; background: var(--accent); color: #fff; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
.sec-h .all { margin-left: auto; text-transform: none; letter-spacing: 0; font-family: "Source Sans Pro", ui-sans-serif, system-ui, sans-serif; font-size: 12px; color: var(--subdued); }
.sec-h .all:hover { color: var(--text-strong); }
.ev { display: flex; gap: 9px; align-items: flex-start; padding: 6px 0; }
.ev .st { width: 15px; height: 20px; display: flex; align-items: center; color: var(--faint); flex: none; }
.ev .st.ok { color: var(--ok); }
.ev .st.err { color: var(--err); }
.ev .body { flex: 1; min-width: 0; }
.ev .l1 { display: flex; gap: 8px; align-items: baseline; }
.ev code { font-size: 12.5px; color: var(--text-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ev .t { margin-left: auto; font-size: 12px; color: var(--faint); white-space: nowrap; }
.ev .l2 { font-size: 12.5px; color: var(--subdued); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ev.failed .l2 { color: var(--err); }
.ev .go { font-size: 12.5px; font-weight: 600; color: var(--accent-strong); white-space: nowrap; align-self: center; }
.prog { margin-top: 5px; height: 3px; border-radius: 2px; background: var(--chip); overflow: hidden; position: relative; }
.prog i { position: absolute; inset: 0 auto 0 0; background: var(--accent); border-radius: 2px; transition: width .4s; }
.prog.indet i { width: 30%; animation: slide 1.3s ease-in-out infinite; }
.spin { width: 13px; height: 13px; border-radius: 50%; background: conic-gradient(var(--accent) 0 30%, var(--accent-line) 0); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px)); mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px)); animation: turn 1s linear infinite; }
@keyframes turn { to { transform: rotate(360deg); } }
.last { margin: 10px 10px 4px; padding: 10px 11px; border-radius: 10px; background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent-line); }
.last .l1 { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--subdued); }
.last .l1 code { font-size: 12.5px; color: var(--text-strong); }
.last .ttl { margin: 5px 0 8px; font-weight: 700; color: var(--text-strong); }
.chips { display: flex; gap: 5px; flex-wrap: wrap; }
.chips button { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; background: var(--panel); color: var(--accent-strong); font-size: 12.5px; font-weight: 600; box-shadow: inset 0 0 0 1px var(--accent-line); }
.chips button:hover { background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent); }
.chips .i { width: 13px; height: 13px; }
.menu { padding: 4px 0; border-bottom: 1px solid var(--hairline); }
.mi { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 14px; text-align: left; color: var(--text); }
.mi:hover { background: var(--chip); }
.mi .i { color: var(--subdued); }
.mi .r { margin-left: auto; font-size: 12px; color: var(--faint); }
.foot { display: flex; align-items: center; gap: 7px; padding: 9px 14px; font-size: 12.5px; color: var(--subdued); background: var(--chip); }
.root.dark .foot { background: #141416; }
.foot .logo { width: 15px; height: 15px; }
.foot .r { margin-left: auto; }
.foot:hover { color: var(--text-strong); }
.empty { padding: 12px 14px 4px; font-size: 13px; color: var(--subdued); }

/* code view */
.head { display: flex; align-items: center; gap: 6px; padding: 12px 12px 0; font-weight: 700; color: var(--text-strong); }
.head .x, .head .back { color: var(--faint); display: flex; padding: 2px; border-radius: 5px; }
.head .x { margin-left: auto; }
.head .x:hover, .head .back:hover { color: var(--text-strong); background: var(--chip); }
.pad { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 10px; }
.meta { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--subdued); }
.meta .ok { color: var(--ok); display: flex; }
.meta code { font-size: 12px; color: var(--text-strong); background: var(--chip); padding: 1px 6px; border-radius: 5px; }
.tabs { display: flex; gap: 2px; padding: 3px; background: var(--chip); border-radius: 8px; }
.tabs button { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 4px 6px; border-radius: 6px; font-size: 13px; color: var(--subdued); }
.tabs button.on { background: var(--panel); color: var(--text-strong); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.tabs .i { width: 13px; height: 13px; }
.codebox { position: relative; }
pre { margin: 0; padding: 12px 14px; max-height: 300px; overflow: auto; background: var(--code-bg); border: 1px solid var(--hairline); border-radius: 8px; font-size: 12px; line-height: 1.6; color: var(--code-text); white-space: pre; }
.copy { position: absolute; top: 8px; right: 8px; display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; background: var(--panel); border: 1px solid var(--hairline); font-size: 12px; font-weight: 600; color: var(--subdued); }
.copy:hover { color: var(--text-strong); }
.copy.done { color: var(--ok); }
.copy .i { width: 13px; height: 13px; }
.pf { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: var(--subdued); }
.pf button { color: var(--accent-strong); font-weight: 600; }

@media (max-width: 640px) {
  .scrim.show { display: block; }
  .pop, .pop.wide { left: 0; right: 0; bottom: 0; width: auto; border-radius: 16px 16px 0 0; border-width: 1px 0 0; max-height: 80vh; }
  .tab.open { display: none; }
  .pop::before { content: ""; width: 36px; height: 4px; border-radius: 2px; background: var(--chip-hover); align-self: center; margin-top: 7px; flex: none; }
}
`;

  const host = document.createElement("gradio-launcher");
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${CSS}</style><div class="root"></div>`;
  const root_el = shadow.querySelector(".root");
  const mount = () => {
    if (!host.isConnected) document.body.appendChild(host);
    apply_theme();
  };
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  function apply_theme() {
    const dark = BLOCKS
      ? document.body.classList.contains("dark") ||
        document.documentElement.classList.contains("dark")
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root_el.classList.toggle("dark", dark);
  }
  new MutationObserver(apply_theme).observe(document.documentElement, {
    attributes: true,
    subtree: false,
  });
  document.addEventListener("DOMContentLoaded", () => {
    new MutationObserver(apply_theme).observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    apply_theme();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    apply_theme,
  );

  // ---- formatting ----
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  function dur(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return m < 60
      ? `${m}m ${String(s % 60).padStart(2, "0")}s`
      : `${Math.floor(m / 60)}h ${m % 60}m`;
  }
  function ago(t) {
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 10) return "just now";
    if (s < 60) return `${s}s ago`;
    const m = Math.round(s / 60);
    return m < 60 ? `${m} min ago` : `${Math.round(m / 60)}h ago`;
  }
  function progress_text(p) {
    if (!p) return null;
    if (p.length != null && p.index != null) {
      const unit = p.unit && p.unit !== "steps" ? ` ${p.unit}` : "";
      return `${p.desc ? p.desc + " · " : ""}${p.index} of ${p.length}${unit}`;
    }
    if (p.progress != null)
      return `${p.desc ? p.desc + " · " : ""}${Math.round(p.progress * 100)}%`;
    return p.desc || null;
  }
  function fraction(p) {
    if (!p) return null;
    if (p.length && p.index != null) return Math.min(1, p.index / p.length);
    if (p.progress != null) return Math.min(1, p.progress);
    return null;
  }

  const active = () =>
    [...state.events.values()].filter(
      (e) => e.status === "queued" || e.status === "running",
    );
  const finished = () =>
    [...state.events.values()]
      .filter((e) => e.status === "done" || e.status === "failed")
      .sort((a, b) => b.ended_at - a.ended_at)
      .slice(0, MAX_FINISHED);

  function ev_row(e) {
    if (e.status === "running") {
      const f = fraction(e.progress);
      const txt = progress_text(e.progress) || "Running";
      return `<div class="ev"><span class="st"><span class="spin"></span></span><div class="body">
        <div class="l1"><code>${esc(label(e))}</code><span class="t">${dur(Date.now() - (e.started_at || e.queued_at))}</span></div>
        <div class="l2">${esc(txt)}</div>
        <div class="prog${f == null ? " indet" : ""}"><i style="width:${f == null ? 30 : Math.round(f * 100)}%"></i></div></div></div>`;
    }
    if (e.status === "queued") {
      const pos =
        e.rank != null
          ? `In queue · ${e.rank + 1}${e.size ? ` of ${e.size}` : ""}`
          : "Waiting in queue";
      return `<div class="ev"><span class="st">${I.clock}</span><div class="body">
        <div class="l1"><code>${esc(label(e))}</code><span class="t">${dur(Date.now() - e.queued_at)}</span></div>
        <div class="l2">${pos}</div></div></div>`;
    }
    if (e.status === "failed") {
      return `<div class="ev failed"><span class="st err">${I.alert}</span><div class="body">
        <div class="l1"><code>${esc(label(e))}</code><span class="t">${ago(e.ended_at)}</span></div>
        <div class="l2" title="${esc(e.error)}">${esc(e.error)}</div></div></div>`;
    }
    return `<div class="ev"><span class="st ok">${I.check}</span><div class="body">
      <div class="l1"><code>${esc(label(e))}</code><span class="t">${ago(e.ended_at)} · ${dur(e.ended_at - (e.started_at || e.queued_at))}</span></div></div>
      ${api_name(e) ? `<button class="go" data-code="${esc(e.id)}">Code</button>` : ""}</div>`;
  }

  function list_view() {
    const run = active();
    const done = finished();
    const last =
      state.lastRun && api_name(state.lastRun) ? state.lastRun : null;
    let html = "";
    if (last) {
      html += `<div class="last"><div class="l1"><span style="color:var(--ok);display:flex">${I.check}</span><code>${esc(label(last))}</code>· ${dur(last.ended_at - (last.started_at || last.queued_at))} · ${ago(last.ended_at)}</div>
        <div class="ttl">Run this from code or an agent</div>
        <div class="chips"><button data-tab="python">Python</button><button data-tab="js">JS</button><button data-tab="curl">cURL</button>${mcp_on() ? `<button data-tab="mcp">${I.bot}MCP</button>` : ""}</div></div>`;
    }
    if (run.length) {
      html += `<div class="sec"><div class="sec-h">Running<span class="n">${run.length}</span></div>${run.map(ev_row).join("")}</div>`;
    }
    const shown = done.filter((e) => e !== last);
    if (shown.length || (last && run.length === 0)) {
      html += `<div class="sec"><div class="sec-h">Finished${state.runsUrl ? `<a class="all" href="${esc(state.runsUrl)}" target="_blank">All runs →</a>` : ""}</div>${(shown.length ? shown : [last]).map(ev_row).join("")}</div>`;
    }
    if (!html)
      html = `<div class="empty">Nothing running in this session.</div>`;
    const menu = [];
    if (LINKS.includes("api"))
      menu.push(
        `<button class="mi" data-act="api">${I.code}Use via API${mcp_on() ? " or MCP" : ""}</button>`,
      );
    if (state.runsUrl)
      menu.push(
        `<a class="mi" href="${esc(state.runsUrl)}" target="_blank">${I.history}Runs</a>`,
      );
    if (BLOCKS && LINKS.includes("settings"))
      menu.push(
        `<button class="mi" data-act="settings">${I.gear}Settings</button>`,
      );
    if (menu.length) html += `<div class="menu">${menu.join("")}</div>`;
    if (LINKS.includes("gradio"))
      html += `<a class="foot" href="https://gradio.app" target="_blank" rel="noreferrer">${I.logo}Built with Gradio<span class="r">gradio.app ↗</span></a>`;
    return `<div class="pop">${html}</div>`;
  }

  function mcp_on() {
    return !!(state.config && state.config.mcp_server);
  }

  function code_view() {
    const ev = state.codeEvent;
    load_info();
    const tabs = [
      ["python", "Python"],
      ["js", "JavaScript"],
      ["curl", "cURL"],
    ];
    if (mcp_on()) tabs.push(["mcp", `${I.bot}MCP`]);
    if (!tabs.some(([k]) => k === state.tab)) state.tab = "python";
    const text = snippet(ev, state.tab);
    const meta =
      ev.status === "done"
        ? `<span class="ok">${I.check}</span>Ran <code>${esc(label(ev))}</code>· ${dur(ev.ended_at - (ev.started_at || ev.queued_at))} · ${ago(ev.ended_at)}`
        : `<code>${esc(label(ev))}</code>`;
    return `<div class="pop wide"><div class="head"><button class="back" data-act="back" title="Back">${I.back}</button>Run this from code or an agent<button class="x" data-act="close" title="Close">${I.x}</button></div>
      <div class="pad"><div class="meta">${meta}</div>
      <div class="tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${k === state.tab ? "on" : ""}">${l}</button>`).join("")}</div>
      <div class="codebox"><pre>${esc(text)}</pre><button class="copy${state.copied ? " done" : ""}" data-act="copy">${state.copied ? I.check + "Copied" : I.copy + "Copy"}</button></div>
      <div class="pf"><span>Uses your inputs from this run</span>${BLOCKS && LINKS.includes("api") ? `<button data-act="docs">Full API docs →</button>` : ""}</div></div></div>`;
  }

  function tab_html() {
    const run = active();
    const running = run.filter((e) => e.status === "running");
    const cls = ["tab"];
    if (state.open) cls.push("open");
    if (state.offline) cls.push("off");
    // The peek waits until nothing else is in progress, and gives way to a failure.
    const peek =
      !state.open &&
      !run.length &&
      state.unseen !== "err" &&
      state.peekUntil > Date.now() &&
      state.lastRun &&
      api_name(state.lastRun);
    let inner = state.open ? I.x : I.logo;
    if (peek) {
      cls.push("peek");
      inner = `<span class="msg">Run <code>${esc(label(state.lastRun))}</code> from code ${I.arrow}</span><span class="sep"></span>${I.logo}`;
    }
    let extra = "";
    if (state.offline) extra += `<span class="bar off"></span>`;
    else if (running.length && !peek) {
      const fs = running
        .map((e) => fraction(e.progress))
        .filter((f) => f != null);
      extra += fs.length
        ? `<span class="bar"><i style="width:${Math.round(Math.min(...fs) * 100)}%"></i></span>`
        : `<span class="bar indet"><i></i></span>`;
    }
    if (state.unseen === "err" && !state.open)
      extra += `<span class="badge err">${I.bang}</span>`;
    else if (run.length)
      extra += `<span class="badge${running.length ? "" : " queued"}">${run.length}</span>`;
    else if (state.unseen === "done" && !state.open && !peek)
      extra += `<span class="badge done">${I.check}</span>`;
    const title = run.length
      ? `${run.length} event${run.length > 1 ? "s" : ""} in progress`
      : "Gradio";
    return `<button class="${cls.join(" ")}" data-act="${peek ? "peek" : "toggle"}" title="${title}" aria-label="${title}" aria-expanded="${state.open}">${inner}${extra}</button>`;
  }

  let scheduled = false;
  function render() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      let pop = state.open
        ? state.view === "code" && state.codeEvent
          ? code_view()
          : list_view()
        : "";
      if (state.enter)
        pop = pop.replace('<div class="pop', '<div class="pop enter');
      state.enter = false;
      root_el.innerHTML = `<div class="scrim${state.open ? " show" : ""}" data-act="close"></div>${pop}${tab_html()}`;
    });
  }

  function first_endpoint_event() {
    // "Use via API" before any run: the first named endpoint, with its example inputs.
    const names = Object.keys((state.info && state.info.named_endpoints) || {});
    if (!names.length) return null;
    const deps = (state.config && state.config.dependencies) || [];
    const dep = deps.find((d) => "/" + d.api_name === names[0]);
    return {
      id: "example",
      fn: dep ? (dep.id ?? deps.indexOf(dep)) : null,
      data: (state.info.named_endpoints[names[0]].parameters || []).map(
        (p) => p.example_input ?? null,
      ),
      status: "example",
    };
  }

  root_el.addEventListener("click", async (e) => {
    const el = e.target.closest("[data-act], [data-tab], [data-code]");
    if (!el) return;
    const act = el.dataset.act;
    if (el.dataset.code) {
      state.codeEvent = state.events.get(el.dataset.code);
      state.view = "code";
      state.copied = false;
    } else if (el.dataset.tab) {
      state.tab = el.dataset.tab;
      state.copied = false;
      if (state.view !== "code") {
        state.codeEvent = state.lastRun;
        state.view = "code";
      }
    } else if (act === "toggle") {
      state.open = !state.open;
      state.enter = state.open;
      state.view = "list";
      if (state.open) {
        state.unseen = null;
        load_config();
      }
    } else if (act === "peek") {
      state.open = true;
      state.enter = true;
      state.unseen = null;
      state.peekUntil = 0;
      state.codeEvent = state.lastRun;
      state.view = "code";
      state.copied = false;
    } else if (act === "close") {
      state.open = false;
    } else if (act === "back") {
      state.view = "list";
    } else if (act === "copy") {
      const text = snippet(state.codeEvent, state.tab);
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {}
      state.copied = true;
      setTimeout(() => ((state.copied = false), render()), 1600);
    } else if (act === "api" || act === "docs") {
      if (BLOCKS) {
        state.open = false;
        open_in_blocks("api");
      } else {
        await load_config();
        await load_info();
        const ev = state.lastRun || first_endpoint_event();
        if (ev) {
          state.codeEvent = ev;
          state.view = "code";
        }
      }
    } else if (act === "settings") {
      state.open = false;
      open_in_blocks("settings");
    }
    render();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.open) {
      state.open = false;
      render();
    }
  });
  document.addEventListener("click", (e) => {
    if (state.open && !e.composedPath().includes(host)) {
      state.open = false;
      render();
    }
  });

  // Keep the clocks and the peek moving. A run that finished while others
  // were still going peeks once they are all done.
  setInterval(() => {
    if (state.peekPending && !active().length) {
      state.peekPending = false;
      if (!state.open) state.peekUntil = Date.now() + PEEK_MS;
    }
    if (active().length || state.peekUntil || state.open) {
      if (state.peekUntil && state.peekUntil < Date.now()) state.peekUntil = 0;
      render();
    }
  }, 1000);

  render();
})();
