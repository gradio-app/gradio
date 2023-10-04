import { SvelteComponentDev, init, safe_not_equal as safe_not_equal$1, dispatch_dev, create_slot, validate_store, component_subscribe, validate_slots, element, space, attr_dev, add_location, toggle_class, set_style, insert_dev, append_dev, update_slot_base, get_all_dirty_from_scope, get_slot_changes, transition_in, transition_out, detach_dev, binding_callbacks, text, src_url_equal, set_data_dev, onMount, svg_element, noop as noop$1, onDestroy, tick, group_outros, check_outros, empty, ensure_array_like_dev, destroy_each, create_component, mount_component, destroy_component, bind, setContext, add_flush_callback, assign, get_spread_update, get_spread_object } from './svelte/svelte-internal.js';

true&&(function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(link) {
        const fetchOpts = {};
        if (link.integrity)
            fetchOpts.integrity = link.integrity;
        if (link.referrerPolicy)
            fetchOpts.referrerPolicy = link.referrerPolicy;
        if (link.crossOrigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (link.crossOrigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
}());

const reset = '';

const global$1 = '';

const pollen = '';

const typography = '';

const scriptRel = 'modulepreload';const assetsURL = function(dep, importerUrl) { return new URL(dep, importerUrl).href };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
    // @ts-expect-error true will be replaced with boolean later
    if (!true || !deps || deps.length === 0) {
        return baseModule();
    }
    const links = document.getElementsByTagName('link');
    return Promise.all(deps.map((dep) => {
        // @ts-expect-error assetsURL is declared before preload.toString()
        dep = assetsURL(dep, importerUrl);
        if (dep in seen)
            return;
        seen[dep] = true;
        const isCss = dep.endsWith('.css');
        const cssSelector = isCss ? '[rel="stylesheet"]' : '';
        const isBaseRelative = !!importerUrl;
        // check if the file is already preloaded by SSR markup
        if (isBaseRelative) {
            // When isBaseRelative is true then we have `importerUrl` and `dep` is
            // already converted to an absolute URL by the `assetsURL` function
            for (let i = links.length - 1; i >= 0; i--) {
                const link = links[i];
                // The `links[i].href` is an absolute URL thanks to browser doing the work
                // for us. See https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes:idl-domstring-5
                if (link.href === dep && (!isCss || link.rel === 'stylesheet')) {
                    return;
                }
            }
        }
        else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
            return;
        }
        const link = document.createElement('link');
        link.rel = isCss ? 'stylesheet' : scriptRel;
        if (!isCss) {
            link.as = 'script';
            link.crossOrigin = '';
        }
        link.href = dep;
        document.head.appendChild(link);
        if (isCss) {
            return new Promise((res, rej) => {
                link.addEventListener('load', res);
                link.addEventListener('error', () => rej(new Error(`Unable to preload CSS for ${dep}`)));
            });
        }
    })).then(() => baseModule());
};

var fn = new Intl.Collator(0, { numeric: 1 }).compare;
function semiver(a, b, bool) {
  a = a.split(".");
  b = b.split(".");
  return fn(a[0], b[0]) || fn(a[1], b[1]) || (b[2] = b.slice(2).join("."), bool = /[.-]/.test(a[2] = a.slice(2).join(".")), bool == /[.-]/.test(b[2]) ? fn(a[2], b[2]) : bool ? -1 : 1);
}
function determine_protocol(endpoint) {
  if (endpoint.startsWith("http")) {
    const { protocol, host } = new URL(endpoint);
    if (host.endsWith("hf.space")) {
      return {
        ws_protocol: "wss",
        host,
        http_protocol: protocol
      };
    }
    return {
      ws_protocol: protocol === "https:" ? "wss" : "ws",
      http_protocol: protocol,
      host
    };
  }
  return {
    ws_protocol: "wss",
    http_protocol: "https:",
    host: endpoint
  };
}
const RE_SPACE_NAME = /^[^\/]*\/[^\/]*$/;
const RE_SPACE_DOMAIN = /.*hf\.space\/{0,1}$/;
async function process_endpoint(app_reference, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const _app_reference = app_reference.trim();
  if (RE_SPACE_NAME.test(_app_reference)) {
    try {
      const res = await fetch(
        `https://huggingface.co/api/spaces/${_app_reference}/host`,
        { headers }
      );
      if (res.status !== 200)
        throw new Error("Space metadata could not be loaded.");
      const _host = (await res.json()).host;
      return {
        space_id: app_reference,
        ...determine_protocol(_host)
      };
    } catch (e) {
      throw new Error("Space metadata could not be loaded." + e.message);
    }
  }
  if (RE_SPACE_DOMAIN.test(_app_reference)) {
    const { ws_protocol, http_protocol, host } = determine_protocol(_app_reference);
    return {
      space_id: host.replace(".hf.space", ""),
      ws_protocol,
      http_protocol,
      host
    };
  }
  return {
    space_id: false,
    ...determine_protocol(_app_reference)
  };
}
function map_names_to_ids(fns) {
  let apis = {};
  fns.forEach(({ api_name }, i) => {
    if (api_name)
      apis[api_name] = i;
  });
  return apis;
}
const RE_DISABLED_DISCUSSION = /^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function discussions_enabled(space_id) {
  try {
    const r = await fetch(
      `https://huggingface.co/api/spaces/${space_id}/discussions`,
      {
        method: "HEAD"
      }
    );
    const error = r.headers.get("x-error-message");
    if (error && RE_DISABLED_DISCUSSION.test(error))
      return false;
    return true;
  } catch (e) {
    return false;
  }
}
const QUEUE_FULL_MSG = "This application is too busy. Keep trying!";
const BROKEN_CONNECTION_MSG = "Connection errored out.";
let NodeBlob;
function api_factory(fetch_implementation) {
  return { post_data: post_data2, upload_files: upload_files2, client: client2, handle_blob: handle_blob2 };
  async function post_data2(url, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    try {
      var response = await fetch_implementation(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers
      });
    } catch (e) {
      return [{ error: BROKEN_CONNECTION_MSG }, 500];
    }
    const output = await response.json();
    return [output, response.status];
  }
  async function upload_files2(root, files, token) {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const chunkSize = 1e3;
    const uploadResponses = [];
    for (let i = 0; i < files.length; i += chunkSize) {
      const chunk = files.slice(i, i + chunkSize);
      const formData = new FormData();
      chunk.forEach((file) => {
        formData.append("files", file);
      });
      try {
        var response = await fetch_implementation(`${root}/upload`, {
          method: "POST",
          body: formData,
          headers
        });
      } catch (e) {
        return { error: BROKEN_CONNECTION_MSG };
      }
      const output = await response.json();
      uploadResponses.push(...output);
    }
    return { files: uploadResponses };
  }
  async function client2(app_reference, options = { normalise_files: true }) {
    return new Promise(async (res) => {
      const { status_callback, hf_token, normalise_files } = options;
      const return_obj = {
        predict,
        submit,
        view_api
        // duplicate
      };
      const transform_files = normalise_files ?? true;
      if (typeof window === "undefined" || !("WebSocket" in window)) {
        const ws = await __vitePreload(() => import('./wrapper-6f348d45-78c8609e.js'),true?[]:void 0,import.meta.url);
        NodeBlob = (await __vitePreload(() => import('./__vite-browser-external_node_buffer-23035941.js'),true?[]:void 0,import.meta.url)).Blob;
        global.WebSocket = ws.WebSocket;
      }
      const { ws_protocol, http_protocol, host, space_id } = await process_endpoint(app_reference, hf_token);
      const session_hash = Math.random().toString(36).substring(2);
      const last_status = {};
      let config;
      let api_map = {};
      let jwt = false;
      if (hf_token && space_id) {
        jwt = await get_jwt(space_id, hf_token);
      }
      async function config_success(_config) {
        config = _config;
        api_map = map_names_to_ids((_config == null ? void 0 : _config.dependencies) || []);
        if (config.auth_required) {
          return {
            config,
            ...return_obj
          };
        }
        try {
          api = await view_api(config);
        } catch (e) {
          console.error(`Could not get api details: ${e.message}`);
        }
        return {
          config,
          ...return_obj
        };
      }
      let api;
      async function handle_space_sucess(status) {
        if (status_callback)
          status_callback(status);
        if (status.status === "running")
          try {
            config = await resolve_config(
              fetch_implementation,
              `${http_protocol}//${host}`,
              hf_token
            );
            const _config = await config_success(config);
            res(_config);
          } catch (e) {
            console.error(e);
            if (status_callback) {
              status_callback({
                status: "error",
                message: "Could not load this space.",
                load_status: "error",
                detail: "NOT_FOUND"
              });
            }
          }
      }
      try {
        config = await resolve_config(
          fetch_implementation,
          `${http_protocol}//${host}`,
          hf_token
        );
        const _config = await config_success(config);
        res(_config);
      } catch (e) {
        console.error(e);
        if (space_id) {
          check_space_status(
            space_id,
            RE_SPACE_NAME.test(space_id) ? "space_name" : "subdomain",
            handle_space_sucess
          );
        } else {
          if (status_callback)
            status_callback({
              status: "error",
              message: "Could not load this space.",
              load_status: "error",
              detail: "NOT_FOUND"
            });
        }
      }
      function predict(endpoint, data, event_data) {
        let data_returned = false;
        let status_complete = false;
        let dependency;
        if (typeof endpoint === "number") {
          dependency = config.dependencies[endpoint];
        } else {
          const trimmed_endpoint = endpoint.replace(/^\//, "");
          dependency = config.dependencies[api_map[trimmed_endpoint]];
        }
        if (dependency.types.continuous) {
          throw new Error(
            "Cannot call predict on this function as it may run forever. Use submit instead"
          );
        }
        return new Promise((res2, rej) => {
          const app = submit(endpoint, data, event_data);
          let result;
          app.on("data", (d) => {
            if (status_complete) {
              app.destroy();
              res2(d);
            }
            data_returned = true;
            result = d;
          }).on("status", (status) => {
            if (status.stage === "error")
              rej(status);
            if (status.stage === "complete") {
              status_complete = true;
              app.destroy();
              if (data_returned) {
                res2(result);
              }
            }
          });
        });
      }
      function submit(endpoint, data, event_data) {
        let fn_index;
        let api_info;
        if (typeof endpoint === "number") {
          fn_index = endpoint;
          api_info = api.unnamed_endpoints[fn_index];
        } else {
          const trimmed_endpoint = endpoint.replace(/^\//, "");
          fn_index = api_map[trimmed_endpoint];
          api_info = api.named_endpoints[endpoint.trim()];
        }
        if (typeof fn_index !== "number") {
          throw new Error(
            "There is no endpoint matching that name of fn_index matching that number."
          );
        }
        let websocket;
        const _endpoint = typeof endpoint === "number" ? "/predict" : endpoint;
        let payload;
        let complete = false;
        const listener_map = {};
        handle_blob2(
          `${http_protocol}//${host + config.path}`,
          data,
          api_info,
          hf_token
        ).then((_payload) => {
          payload = { data: _payload || [], event_data, fn_index };
          if (skip_queue(fn_index, config)) {
            fire_event({
              type: "status",
              endpoint: _endpoint,
              stage: "pending",
              queue: false,
              fn_index,
              time: /* @__PURE__ */ new Date()
            });
            post_data2(
              `${http_protocol}//${host + config.path}/run${_endpoint.startsWith("/") ? _endpoint : `/${_endpoint}`}`,
              {
                ...payload,
                session_hash
              },
              hf_token
            ).then(([output, status_code]) => {
              const data2 = transform_files ? transform_output(
                output.data,
                api_info,
                config.root,
                config.root_url
              ) : output.data;
              if (status_code == 200) {
                fire_event({
                  type: "data",
                  endpoint: _endpoint,
                  fn_index,
                  data: data2,
                  time: /* @__PURE__ */ new Date()
                });
                fire_event({
                  type: "status",
                  endpoint: _endpoint,
                  fn_index,
                  stage: "complete",
                  eta: output.average_duration,
                  queue: false,
                  time: /* @__PURE__ */ new Date()
                });
              } else {
                fire_event({
                  type: "status",
                  stage: "error",
                  endpoint: _endpoint,
                  fn_index,
                  message: output.error,
                  queue: false,
                  time: /* @__PURE__ */ new Date()
                });
              }
            }).catch((e) => {
              fire_event({
                type: "status",
                stage: "error",
                message: e.message,
                endpoint: _endpoint,
                fn_index,
                queue: false,
                time: /* @__PURE__ */ new Date()
              });
            });
          } else {
            fire_event({
              type: "status",
              stage: "pending",
              queue: true,
              endpoint: _endpoint,
              fn_index,
              time: /* @__PURE__ */ new Date()
            });
            let url = new URL(`${ws_protocol}://${host}${config.path}
							/queue/join`);
            if (jwt) {
              url.searchParams.set("__sign", jwt);
            }
            websocket = new WebSocket(url);
            websocket.onclose = (evt) => {
              if (!evt.wasClean) {
                fire_event({
                  type: "status",
                  stage: "error",
                  broken: true,
                  message: BROKEN_CONNECTION_MSG,
                  queue: true,
                  endpoint: _endpoint,
                  fn_index,
                  time: /* @__PURE__ */ new Date()
                });
              }
            };
            websocket.onmessage = function(event) {
              const _data = JSON.parse(event.data);
              const { type, status, data: data2 } = handle_message(
                _data,
                last_status[fn_index]
              );
              if (type === "update" && status && !complete) {
                fire_event({
                  type: "status",
                  endpoint: _endpoint,
                  fn_index,
                  time: /* @__PURE__ */ new Date(),
                  ...status
                });
                if (status.stage === "error") {
                  websocket.close();
                }
              } else if (type === "hash") {
                websocket.send(JSON.stringify({ fn_index, session_hash }));
                return;
              } else if (type === "data") {
                websocket.send(JSON.stringify({ ...payload, session_hash }));
              } else if (type === "complete") {
                complete = status;
              } else if (type === "log") {
                fire_event({
                  type: "log",
                  log: data2.log,
                  level: data2.level,
                  endpoint: _endpoint,
                  fn_index
                });
              } else if (type === "generating") {
                fire_event({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...status,
                  stage: status == null ? void 0 : status.stage,
                  queue: true,
                  endpoint: _endpoint,
                  fn_index
                });
              }
              if (data2) {
                fire_event({
                  type: "data",
                  time: /* @__PURE__ */ new Date(),
                  data: transform_files ? transform_output(
                    data2.data,
                    api_info,
                    config.root,
                    config.root_url
                  ) : data2.data,
                  endpoint: _endpoint,
                  fn_index
                });
                if (complete) {
                  fire_event({
                    type: "status",
                    time: /* @__PURE__ */ new Date(),
                    ...complete,
                    stage: status == null ? void 0 : status.stage,
                    queue: true,
                    endpoint: _endpoint,
                    fn_index
                  });
                  websocket.close();
                }
              }
            };
            if (semiver(config.version || "2.0.0", "3.6") < 0) {
              addEventListener(
                "open",
                () => websocket.send(JSON.stringify({ hash: session_hash }))
              );
            }
          }
        });
        function fire_event(event) {
          const narrowed_listener_map = listener_map;
          const listeners = narrowed_listener_map[event.type] || [];
          listeners == null ? void 0 : listeners.forEach((l) => l(event));
        }
        function on(eventType, listener) {
          const narrowed_listener_map = listener_map;
          const listeners = narrowed_listener_map[eventType] || [];
          narrowed_listener_map[eventType] = listeners;
          listeners == null ? void 0 : listeners.push(listener);
          return { on, off, cancel, destroy };
        }
        function off(eventType, listener) {
          const narrowed_listener_map = listener_map;
          let listeners = narrowed_listener_map[eventType] || [];
          listeners = listeners == null ? void 0 : listeners.filter((l) => l !== listener);
          narrowed_listener_map[eventType] = listeners;
          return { on, off, cancel, destroy };
        }
        async function cancel() {
          const _status = {
            stage: "complete",
            queue: false,
            time: /* @__PURE__ */ new Date()
          };
          complete = _status;
          fire_event({
            ..._status,
            type: "status",
            endpoint: _endpoint,
            fn_index
          });
          if (websocket && websocket.readyState === 0) {
            websocket.addEventListener("open", () => {
              websocket.close();
            });
          } else {
            websocket.close();
          }
          try {
            await fetch_implementation(
              `${http_protocol}//${host + config.path}/reset`,
              {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ fn_index, session_hash })
              }
            );
          } catch (e) {
            console.warn(
              "The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
            );
          }
        }
        function destroy() {
          for (const event_type in listener_map) {
            listener_map[event_type].forEach((fn2) => {
              off(event_type, fn2);
            });
          }
        }
        return {
          on,
          off,
          cancel,
          destroy
        };
      }
      async function view_api(config2) {
        if (api)
          return api;
        const headers = { "Content-Type": "application/json" };
        if (hf_token) {
          headers.Authorization = `Bearer ${hf_token}`;
        }
        let response;
        if (semiver(config2.version || "2.0.0", "3.30") < 0) {
          response = await fetch_implementation(
            "https://gradio-space-api-fetcher-v2.hf.space/api",
            {
              method: "POST",
              body: JSON.stringify({
                serialize: false,
                config: JSON.stringify(config2)
              }),
              headers
            }
          );
        } else {
          response = await fetch_implementation(`${config2.root}/info`, {
            headers
          });
        }
        if (!response.ok) {
          throw new Error(BROKEN_CONNECTION_MSG);
        }
        let api_info = await response.json();
        if ("api" in api_info) {
          api_info = api_info.api;
        }
        if (api_info.named_endpoints["/predict"] && !api_info.unnamed_endpoints["0"]) {
          api_info.unnamed_endpoints[0] = api_info.named_endpoints["/predict"];
        }
        const x = transform_api_info(api_info, config2, api_map);
        return x;
      }
    });
  }
  async function handle_blob2(endpoint, data, api_info, token) {
    const blob_refs = await walk_and_store_blobs(
      data,
      void 0,
      [],
      true,
      api_info
    );
    return Promise.all(
      blob_refs.map(async ({ path, blob, data: data2, type }) => {
        if (blob) {
          const file_url = (await upload_files2(endpoint, [blob], token)).files[0];
          return { path, file_url, type };
        }
        return { path, base64: data2, type };
      })
    ).then((r) => {
      r.forEach(({ path, file_url, base64, type }) => {
        if (base64) {
          update_object(data, base64, path);
        } else if (type === "Gallery") {
          update_object(data, file_url, path);
        } else if (file_url) {
          const o = {
            is_file: true,
            name: `${file_url}`,
            data: null
            // orig_name: "file.csv"
          };
          update_object(data, o, path);
        }
      });
      return data;
    });
  }
}
const { post_data, upload_files, client, handle_blob } = api_factory(fetch);
function transform_output(data, api_info, root_url, remote_url) {
  return data.map((d, i) => {
    var _a, _b, _c, _d;
    if (((_b = (_a = api_info == null ? void 0 : api_info.returns) == null ? void 0 : _a[i]) == null ? void 0 : _b.component) === "File") {
      return normalise_file(d, root_url, remote_url);
    } else if (((_d = (_c = api_info == null ? void 0 : api_info.returns) == null ? void 0 : _c[i]) == null ? void 0 : _d.component) === "Gallery") {
      return d.map((img) => {
        return Array.isArray(img) ? [normalise_file(img[0], root_url, remote_url), img[1]] : [normalise_file(img, root_url, remote_url), null];
      });
    } else if (typeof d === "object" && (d == null ? void 0 : d.is_file)) {
      return normalise_file(d, root_url, remote_url);
    }
    return d;
  });
}
function normalise_file(file, root, root_url) {
  if (file == null)
    return null;
  if (typeof file === "string") {
    return {
      name: "file_data",
      data: file
    };
  } else if (Array.isArray(file)) {
    const normalized_file = [];
    for (const x of file) {
      if (x === null) {
        normalized_file.push(null);
      } else {
        normalized_file.push(normalise_file(x, root, root_url));
      }
    }
    return normalized_file;
  } else if (file.is_file) {
    if (!root_url) {
      file.data = root + "/file=" + file.name;
    } else {
      file.data = "/proxy=" + root_url + "file=" + file.name;
    }
  }
  return file;
}
function get_type(type, component, serializer, signature_type) {
  switch (type.type) {
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "number":
      return "number";
  }
  if (serializer === "JSONSerializable" || serializer === "StringSerializable") {
    return "any";
  } else if (serializer === "ListStringSerializable") {
    return "string[]";
  } else if (component === "Image") {
    return signature_type === "parameter" ? "Blob | File | Buffer" : "string";
  } else if (serializer === "FileSerializable") {
    if ((type == null ? void 0 : type.type) === "array") {
      return signature_type === "parameter" ? "(Blob | File | Buffer)[]" : `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}[]`;
    }
    return signature_type === "parameter" ? "Blob | File | Buffer" : `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}`;
  } else if (serializer === "GallerySerializable") {
    return signature_type === "parameter" ? "[(Blob | File | Buffer), (string | null)][]" : `[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]`;
  }
}
function get_description(type, serializer) {
  if (serializer === "GallerySerializable") {
    return "array of [file, label] tuples";
  } else if (serializer === "ListStringSerializable") {
    return "array of strings";
  } else if (serializer === "FileSerializable") {
    return "array of files or single file";
  }
  return type.description;
}
function transform_api_info(api_info, config, api_map) {
  const new_data = {
    named_endpoints: {},
    unnamed_endpoints: {}
  };
  for (const key in api_info) {
    const cat = api_info[key];
    for (const endpoint in cat) {
      const dep_index = config.dependencies[endpoint] ? endpoint : api_map[endpoint.replace("/", "")];
      const info = cat[endpoint];
      new_data[key][endpoint] = {};
      new_data[key][endpoint].parameters = {};
      new_data[key][endpoint].returns = {};
      new_data[key][endpoint].type = config.dependencies[dep_index].types;
      new_data[key][endpoint].parameters = info.parameters.map(
        ({ label, component, type, serializer }) => ({
          label,
          component,
          type: get_type(type, component, serializer, "parameter"),
          description: get_description(type, serializer)
        })
      );
      new_data[key][endpoint].returns = info.returns.map(
        ({ label, component, type, serializer }) => ({
          label,
          component,
          type: get_type(type, component, serializer, "return"),
          description: get_description(type, serializer)
        })
      );
    }
  }
  return new_data;
}
async function get_jwt(space, token) {
  try {
    const r = await fetch(`https://huggingface.co/api/spaces/${space}/jwt`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const jwt = (await r.json()).token;
    return jwt || false;
  } catch (e) {
    console.error(e);
    return false;
  }
}
function update_object(object, newValue, stack) {
  while (stack.length > 1) {
    object = object[stack.shift()];
  }
  object[stack.shift()] = newValue;
}
async function walk_and_store_blobs(param, type = void 0, path = [], root = false, api_info = void 0) {
  if (Array.isArray(param)) {
    let blob_refs = [];
    await Promise.all(
      param.map(async (v, i) => {
        var _a;
        let new_path = path.slice();
        new_path.push(i);
        const array_refs = await walk_and_store_blobs(
          param[i],
          root ? ((_a = api_info == null ? void 0 : api_info.parameters[i]) == null ? void 0 : _a.component) || void 0 : type,
          new_path,
          false,
          api_info
        );
        blob_refs = blob_refs.concat(array_refs);
      })
    );
    return blob_refs;
  } else if (globalThis.Buffer && param instanceof globalThis.Buffer) {
    const is_image = type === "Image";
    return [
      {
        path,
        blob: is_image ? false : new NodeBlob([param]),
        data: is_image ? `${param.toString("base64")}` : false,
        type
      }
    ];
  } else if (param instanceof Blob || typeof window !== "undefined" && param instanceof File) {
    if (type === "Image") {
      let data;
      if (typeof window !== "undefined") {
        data = await image_to_data_uri(param);
      } else {
        const buffer = await param.arrayBuffer();
        data = Buffer.from(buffer).toString("base64");
      }
      return [{ path, data, type, blob: false }];
    }
    return [{ path, blob: param, type, data: false }];
  } else if (typeof param === "object") {
    let blob_refs = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        let new_path = path.slice();
        new_path.push(key);
        blob_refs = blob_refs.concat(
          await walk_and_store_blobs(
            param[key],
            void 0,
            new_path,
            false,
            api_info
          )
        );
      }
    }
    return blob_refs;
  }
  return [];
}
function image_to_data_uri(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
function skip_queue(id, config) {
  var _a, _b, _c, _d;
  return !(((_b = (_a = config == null ? void 0 : config.dependencies) == null ? void 0 : _a[id]) == null ? void 0 : _b.queue) === null ? config.enable_queue : (_d = (_c = config == null ? void 0 : config.dependencies) == null ? void 0 : _c[id]) == null ? void 0 : _d.queue) || false;
}
async function resolve_config(fetch_implementation, endpoint, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (typeof window !== "undefined" && window.gradio_config && location.origin !== "http://localhost:9876" && !window.gradio_config.dev_mode) {
    const path = window.gradio_config.root;
    const config = window.gradio_config;
    config.root = endpoint + config.root;
    return { ...config, path };
  } else if (endpoint) {
    let response = await fetch_implementation(`${endpoint}/config`, {
      headers
    });
    if (response.status === 200) {
      const config = await response.json();
      config.path = config.path ?? "";
      config.root = endpoint;
      return config;
    }
    throw new Error("Could not get config.");
  }
  throw new Error("No config or app endpoint found");
}
async function check_space_status(id, type, status_callback) {
  let endpoint = type === "subdomain" ? `https://huggingface.co/api/spaces/by-subdomain/${id}` : `https://huggingface.co/api/spaces/${id}`;
  let response;
  let _status;
  try {
    response = await fetch(endpoint);
    _status = response.status;
    if (_status !== 200) {
      throw new Error();
    }
    response = await response.json();
  } catch (e) {
    status_callback({
      status: "error",
      load_status: "error",
      message: "Could not get space status",
      detail: "NOT_FOUND"
    });
    return;
  }
  if (!response || _status !== 200)
    return;
  const {
    runtime: { stage },
    id: space_name
  } = response;
  switch (stage) {
    case "STOPPED":
    case "SLEEPING":
      status_callback({
        status: "sleeping",
        load_status: "pending",
        message: "Space is asleep. Waking it up...",
        detail: stage
      });
      setTimeout(() => {
        check_space_status(id, type, status_callback);
      }, 1e3);
      break;
    case "PAUSED":
      status_callback({
        status: "paused",
        load_status: "error",
        message: "This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
        detail: stage,
        discussions_enabled: await discussions_enabled(space_name)
      });
      break;
    case "RUNNING":
    case "RUNNING_BUILDING":
      status_callback({
        status: "running",
        load_status: "complete",
        message: "",
        detail: stage
      });
      break;
    case "BUILDING":
      status_callback({
        status: "building",
        load_status: "pending",
        message: "Space is building...",
        detail: stage
      });
      setTimeout(() => {
        check_space_status(id, type, status_callback);
      }, 1e3);
      break;
    default:
      status_callback({
        status: "space_error",
        load_status: "error",
        message: "This space is experiencing an issue.",
        detail: stage,
        discussions_enabled: await discussions_enabled(space_name)
      });
      break;
  }
}
function handle_message(data, last_status) {
  const queue = true;
  switch (data.msg) {
    case "send_data":
      return { type: "data" };
    case "send_hash":
      return { type: "hash" };
    case "queue_full":
      return {
        type: "update",
        status: {
          queue,
          message: QUEUE_FULL_MSG,
          stage: "error",
          code: data.code,
          success: data.success
        }
      };
    case "estimation":
      return {
        type: "update",
        status: {
          queue,
          stage: last_status || "pending",
          code: data.code,
          size: data.queue_size,
          position: data.rank,
          eta: data.rank_eta,
          success: data.success
        }
      };
    case "progress":
      return {
        type: "update",
        status: {
          queue,
          stage: "pending",
          code: data.code,
          progress_data: data.progress_data,
          success: data.success
        }
      };
    case "log":
      return { type: "log", data };
    case "process_generating":
      return {
        type: "generating",
        status: {
          queue,
          message: !data.success ? data.output.error : null,
          stage: data.success ? "generating" : "error",
          code: data.code,
          progress_data: data.progress_data,
          eta: data.average_duration
        },
        data: data.success ? data.output : null
      };
    case "process_completed":
      if ("error" in data.output) {
        return {
          type: "update",
          status: {
            queue,
            message: data.output.error,
            stage: "error",
            code: data.code,
            success: data.success
          }
        };
      }
      return {
        type: "complete",
        status: {
          queue,
          message: !data.success ? data.output.error : void 0,
          stage: data.success ? "complete" : "error",
          code: data.code,
          progress_data: data.progress_data,
          eta: data.output.average_duration
        },
        data: data.success ? data.output : null
      };
    case "process_starts":
      return {
        type: "update",
        status: {
          queue,
          stage: "pending",
          code: data.code,
          size: data.rank,
          position: 0,
          success: data.success
        }
      };
  }
  return { type: "none", status: { stage: "error", queue } };
}

function mount_css(url, target) {
  const existing_link = document.querySelector(`link[href='${url}']`);
  if (existing_link)
    return Promise.resolve();
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  return new Promise((res, rej) => {
    link.addEventListener("load", () => res());
    link.addEventListener("error", () => {
      console.error(`Unable to preload CSS for ${url}`);
      res();
    });
    target.appendChild(link);
  });
}

/** @returns {void} */
function noop() {}

const identity = (x) => x;

function run(fn) {
	return fn();
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

function subscribe(store, ...callbacks) {
	if (store == null) {
		for (const callback of callbacks) {
			callback(undefined);
		}
		return noop;
	}
	const unsub = store.subscribe(...callbacks);
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

/**
 * Get the current value from a store by subscribing and immediately unsubscribing.
 *
 * https://svelte.dev/docs/svelte-store#get
 * @template T
 * @param {import('../store/public.js').Readable<T>} store
 * @returns {T}
 */
function get_store_value(store) {
	let value;
	subscribe(store, (_) => (value = _))();
	return value;
}

/** @param {number | string} value
 * @returns {[number, string]}
 */
function split_css_unit(value) {
	const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
	return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px'];
}

const is_client = typeof window !== 'undefined';

/** @type {() => number} */
let now = is_client ? () => window.performance.now() : () => Date.now();

let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

const tasks = new Set();

/**
 * @param {number} now
 * @returns {void}
 */
function run_tasks(now) {
	tasks.forEach((task) => {
		if (!task.c(now)) {
			tasks.delete(task);
			task.f();
		}
	});
	if (tasks.size !== 0) raf(run_tasks);
}

/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 * @param {import('./private.js').TaskCallback} callback
 * @returns {import('./private.js').Task}
 */
function loop(callback) {
	/** @type {import('./private.js').TaskEntry} */
	let task;
	if (tasks.size === 0) raf(run_tasks);
	return {
		promise: new Promise((fulfill) => {
			tasks.add((task = { c: callback, f: fulfill }));
		}),
		abort() {
			tasks.delete(task);
		}
	};
}

const subscriber_queue = [];

/**
 * Creates a `Readable` store that allows reading by subscription.
 *
 * https://svelte.dev/docs/svelte-store#readable
 * @template T
 * @param {T} [value] initial value
 * @param {import('./public.js').StartStopNotifier<T>} [start]
 * @returns {import('./public.js').Readable<T>}
 */
function readable(value, start) {
	return {
		subscribe: writable(value, start).subscribe
	};
}

/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 *
 * https://svelte.dev/docs/svelte-store#writable
 * @template T
 * @param {T} [value] initial value
 * @param {import('./public.js').StartStopNotifier<T>} [start]
 * @returns {import('./public.js').Writable<T>}
 */
function writable(value, start = noop) {
	/** @type {import('./public.js').Unsubscriber} */
	let stop;
	/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
	const subscribers = new Set();
	/** @param {T} new_value
	 * @returns {void}
	 */
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				// store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1]);
					}
					subscriber_queue.length = 0;
				}
			}
		}
	}

	/**
	 * @param {import('./public.js').Updater<T>} fn
	 * @returns {void}
	 */
	function update(fn) {
		set(fn(value));
	}

	/**
	 * @param {import('./public.js').Subscriber<T>} run
	 * @param {import('./private.js').Invalidator<T>} [invalidate]
	 * @returns {import('./public.js').Unsubscriber}
	 */
	function subscribe(run, invalidate = noop) {
		/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set, update) || noop;
		}
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return { set, update, subscribe };
}

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * https://svelte.dev/docs/svelte-store#derived
 * @template {import('./private.js').Stores} S
 * @template T
 * @overload
 * @param {S} stores - input stores
 * @param {(values: import('./private.js').StoresValues<S>, set: (value: T) => void, update: (fn: import('./public.js').Updater<T>) => void) => import('./public.js').Unsubscriber | void} fn - function callback that aggregates the values
 * @param {T} [initial_value] - initial value
 * @returns {import('./public.js').Readable<T>}
 */

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * https://svelte.dev/docs/svelte-store#derived
 * @template {import('./private.js').Stores} S
 * @template T
 * @overload
 * @param {S} stores - input stores
 * @param {(values: import('./private.js').StoresValues<S>) => T} fn - function callback that aggregates the values
 * @param {T} [initial_value] - initial value
 * @returns {import('./public.js').Readable<T>}
 */

/**
 * @template {import('./private.js').Stores} S
 * @template T
 * @param {S} stores
 * @param {Function} fn
 * @param {T} [initial_value]
 * @returns {import('./public.js').Readable<T>}
 */
function derived(stores, fn, initial_value) {
	const single = !Array.isArray(stores);
	/** @type {Array<import('./public.js').Readable<any>>} */
	const stores_array = single ? [stores] : stores;
	if (!stores_array.every(Boolean)) {
		throw new Error('derived() expects stores as input, got a falsy value');
	}
	const auto = fn.length < 2;
	return readable(initial_value, (set, update) => {
		let started = false;
		const values = [];
		let pending = 0;
		let cleanup = noop;
		const sync = () => {
			if (pending) {
				return;
			}
			cleanup();
			const result = fn(single ? values[0] : values, set, update);
			if (auto) {
				set(result);
			} else {
				cleanup = is_function(result) ? result : noop;
			}
		};
		const unsubscribers = stores_array.map((store, i) =>
			subscribe(
				store,
				(value) => {
					values[i] = value;
					pending &= ~(1 << i);
					if (started) {
						sync();
					}
				},
				() => {
					pending |= 1 << i;
				}
			)
		);
		started = true;
		sync();
		return function stop() {
			run_all(unsubscribers);
			cleanup();
			// We need to set this to false because callbacks can still happen despite having unsubscribed:
			// Callbacks might already be placed in the queue which doesn't know it should no longer
			// invoke this derived store.
			started = false;
		};
	});
}

const space_logo = ""+new URL('spaces-a79177ad.svg', import.meta.url).href+"";

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

var cjs = deepmerge_1;

const t = /*@__PURE__*/getDefaultExportFromCjs(cjs);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  };
  return __assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var ErrorKind;
(function (ErrorKind) {
    /** Argument is unclosed (e.g. `{0`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
    /** Argument is empty (e.g. `{}`). */
    ErrorKind[ErrorKind["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
    /** Argument is malformed (e.g. `{foo!}``) */
    ErrorKind[ErrorKind["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
    /** Expect an argument type (e.g. `{foo,}`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
    /** Unsupported argument type (e.g. `{foo,foo}`) */
    ErrorKind[ErrorKind["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
    /** Expect an argument style (e.g. `{foo, number, }`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
    /** The number skeleton is invalid. */
    ErrorKind[ErrorKind["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
    /** The date time skeleton is invalid. */
    ErrorKind[ErrorKind["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
    /** Exepct a number skeleton following the `::` (e.g. `{foo, number, ::}`) */
    ErrorKind[ErrorKind["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
    /** Exepct a date time skeleton following the `::` (e.g. `{foo, date, ::}`) */
    ErrorKind[ErrorKind["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
    /** Unmatched apostrophes in the argument style (e.g. `{foo, number, 'test`) */
    ErrorKind[ErrorKind["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
    /** Missing select argument options (e.g. `{foo, select}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
    /** Expecting an offset value in `plural` or `selectordinal` argument (e.g `{foo, plural, offset}`) */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
    /** Offset value in `plural` or `selectordinal` is invalid (e.g. `{foo, plural, offset: x}`) */
    ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
    /** Expecting a selector in `select` argument (e.g `{foo, select}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
    /** Expecting a selector in `plural` or `selectordinal` argument (e.g `{foo, plural}`) */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
    /** Expecting a message fragment after the `select` selector (e.g. `{foo, select, apple}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
    /**
     * Expecting a message fragment after the `plural` or `selectordinal` selector
     * (e.g. `{foo, plural, one}`)
     */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
    /** Selector in `plural` or `selectordinal` is malformed (e.g. `{foo, plural, =x {#}}`) */
    ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
    /**
     * Duplicate selectors in `plural` or `selectordinal` argument.
     * (e.g. {foo, plural, one {#} one {#}})
     */
    ErrorKind[ErrorKind["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
    /** Duplicate selectors in `select` argument.
     * (e.g. {foo, select, apple {apple} apple {apple}})
     */
    ErrorKind[ErrorKind["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
    /** Plural or select argument option must have `other` clause. */
    ErrorKind[ErrorKind["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
    /** The tag is malformed. (e.g. `<bold!>foo</bold!>) */
    ErrorKind[ErrorKind["INVALID_TAG"] = 23] = "INVALID_TAG";
    /** The tag name is invalid. (e.g. `<123>foo</123>`) */
    ErrorKind[ErrorKind["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
    /** The closing tag does not match the opening tag. (e.g. `<bold>foo</italic>`) */
    ErrorKind[ErrorKind["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
    /** The opening tag has unmatched closing tag. (e.g. `<bold>foo`) */
    ErrorKind[ErrorKind["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
})(ErrorKind || (ErrorKind = {}));

var TYPE;
(function (TYPE) {
    /**
     * Raw text
     */
    TYPE[TYPE["literal"] = 0] = "literal";
    /**
     * Variable w/o any format, e.g `var` in `this is a {var}`
     */
    TYPE[TYPE["argument"] = 1] = "argument";
    /**
     * Variable w/ number format
     */
    TYPE[TYPE["number"] = 2] = "number";
    /**
     * Variable w/ date format
     */
    TYPE[TYPE["date"] = 3] = "date";
    /**
     * Variable w/ time format
     */
    TYPE[TYPE["time"] = 4] = "time";
    /**
     * Variable w/ select format
     */
    TYPE[TYPE["select"] = 5] = "select";
    /**
     * Variable w/ plural format
     */
    TYPE[TYPE["plural"] = 6] = "plural";
    /**
     * Only possible within plural argument.
     * This is the `#` symbol that will be substituted with the count.
     */
    TYPE[TYPE["pound"] = 7] = "pound";
    /**
     * XML-like tag
     */
    TYPE[TYPE["tag"] = 8] = "tag";
})(TYPE || (TYPE = {}));
var SKELETON_TYPE;
(function (SKELETON_TYPE) {
    SKELETON_TYPE[SKELETON_TYPE["number"] = 0] = "number";
    SKELETON_TYPE[SKELETON_TYPE["dateTime"] = 1] = "dateTime";
})(SKELETON_TYPE || (SKELETON_TYPE = {}));
/**
 * Type Guards
 */
function isLiteralElement(el) {
    return el.type === TYPE.literal;
}
function isArgumentElement(el) {
    return el.type === TYPE.argument;
}
function isNumberElement(el) {
    return el.type === TYPE.number;
}
function isDateElement(el) {
    return el.type === TYPE.date;
}
function isTimeElement(el) {
    return el.type === TYPE.time;
}
function isSelectElement(el) {
    return el.type === TYPE.select;
}
function isPluralElement(el) {
    return el.type === TYPE.plural;
}
function isPoundElement(el) {
    return el.type === TYPE.pound;
}
function isTagElement(el) {
    return el.type === TYPE.tag;
}
function isNumberSkeleton(el) {
    return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.number);
}
function isDateTimeSkeleton(el) {
    return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.dateTime);
}

// @generated from regex-gen.ts
var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;

/**
 * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
 * with some tweaks
 */
var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
/**
 * Parse Date time skeleton into Intl.DateTimeFormatOptions
 * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * @public
 * @param skeleton skeleton string
 */
function parseDateTimeSkeleton(skeleton) {
    var result = {};
    skeleton.replace(DATE_TIME_REGEX, function (match) {
        var len = match.length;
        switch (match[0]) {
            // Era
            case 'G':
                result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
                break;
            // Year
            case 'y':
                result.year = len === 2 ? '2-digit' : 'numeric';
                break;
            case 'Y':
            case 'u':
            case 'U':
            case 'r':
                throw new RangeError('`Y/u/U/r` (year) patterns are not supported, use `y` instead');
            // Quarter
            case 'q':
            case 'Q':
                throw new RangeError('`q/Q` (quarter) patterns are not supported');
            // Month
            case 'M':
            case 'L':
                result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
                break;
            // Week
            case 'w':
            case 'W':
                throw new RangeError('`w/W` (week) patterns are not supported');
            case 'd':
                result.day = ['numeric', '2-digit'][len - 1];
                break;
            case 'D':
            case 'F':
            case 'g':
                throw new RangeError('`D/F/g` (day) patterns are not supported, use `d` instead');
            // Weekday
            case 'E':
                result.weekday = len === 4 ? 'short' : len === 5 ? 'narrow' : 'short';
                break;
            case 'e':
                if (len < 4) {
                    throw new RangeError('`e..eee` (weekday) patterns are not supported');
                }
                result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                break;
            case 'c':
                if (len < 4) {
                    throw new RangeError('`c..ccc` (weekday) patterns are not supported');
                }
                result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                break;
            // Period
            case 'a': // AM, PM
                result.hour12 = true;
                break;
            case 'b': // am, pm, noon, midnight
            case 'B': // flexible day periods
                throw new RangeError('`b/B` (period) patterns are not supported, use `a` instead');
            // Hour
            case 'h':
                result.hourCycle = 'h12';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'H':
                result.hourCycle = 'h23';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'K':
                result.hourCycle = 'h11';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'k':
                result.hourCycle = 'h24';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'j':
            case 'J':
            case 'C':
                throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
            // Minute
            case 'm':
                result.minute = ['numeric', '2-digit'][len - 1];
                break;
            // Second
            case 's':
                result.second = ['numeric', '2-digit'][len - 1];
                break;
            case 'S':
            case 'A':
                throw new RangeError('`S/A` (second) patterns are not supported, use `s` instead');
            // Zone
            case 'z': // 1..3, 4: specific non-location format
                result.timeZoneName = len < 4 ? 'short' : 'long';
                break;
            case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
            case 'O': // 1, 4: miliseconds in day short, long
            case 'v': // 1, 4: generic non-location format
            case 'V': // 1, 2, 3, 4: time zone ID or city
            case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
            case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
                throw new RangeError('`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead');
        }
        return '';
    });
    return result;
}

// @generated from regex-gen.ts
var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;

function parseNumberSkeletonFromString(skeleton) {
    if (skeleton.length === 0) {
        throw new Error('Number skeleton cannot be empty');
    }
    // Parse the skeleton
    var stringTokens = skeleton
        .split(WHITE_SPACE_REGEX)
        .filter(function (x) { return x.length > 0; });
    var tokens = [];
    for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
        var stringToken = stringTokens_1[_i];
        var stemAndOptions = stringToken.split('/');
        if (stemAndOptions.length === 0) {
            throw new Error('Invalid number skeleton');
        }
        var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
        for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
            var option = options_1[_a];
            if (option.length === 0) {
                throw new Error('Invalid number skeleton');
            }
        }
        tokens.push({ stem: stem, options: options });
    }
    return tokens;
}
function icuUnitToEcma(unit) {
    return unit.replace(/^(.*?)-/, '');
}
var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
function parseSignificantPrecision(str) {
    var result = {};
    if (str[str.length - 1] === 'r') {
        result.roundingPriority = 'morePrecision';
    }
    else if (str[str.length - 1] === 's') {
        result.roundingPriority = 'lessPrecision';
    }
    str.replace(SIGNIFICANT_PRECISION_REGEX, function (_, g1, g2) {
        // @@@ case
        if (typeof g2 !== 'string') {
            result.minimumSignificantDigits = g1.length;
            result.maximumSignificantDigits = g1.length;
        }
        // @@@+ case
        else if (g2 === '+') {
            result.minimumSignificantDigits = g1.length;
        }
        // .### case
        else if (g1[0] === '#') {
            result.maximumSignificantDigits = g1.length;
        }
        // .@@## or .@@@ case
        else {
            result.minimumSignificantDigits = g1.length;
            result.maximumSignificantDigits =
                g1.length + (typeof g2 === 'string' ? g2.length : 0);
        }
        return '';
    });
    return result;
}
function parseSign(str) {
    switch (str) {
        case 'sign-auto':
            return {
                signDisplay: 'auto',
            };
        case 'sign-accounting':
        case '()':
            return {
                currencySign: 'accounting',
            };
        case 'sign-always':
        case '+!':
            return {
                signDisplay: 'always',
            };
        case 'sign-accounting-always':
        case '()!':
            return {
                signDisplay: 'always',
                currencySign: 'accounting',
            };
        case 'sign-except-zero':
        case '+?':
            return {
                signDisplay: 'exceptZero',
            };
        case 'sign-accounting-except-zero':
        case '()?':
            return {
                signDisplay: 'exceptZero',
                currencySign: 'accounting',
            };
        case 'sign-never':
        case '+_':
            return {
                signDisplay: 'never',
            };
    }
}
function parseConciseScientificAndEngineeringStem(stem) {
    // Engineering
    var result;
    if (stem[0] === 'E' && stem[1] === 'E') {
        result = {
            notation: 'engineering',
        };
        stem = stem.slice(2);
    }
    else if (stem[0] === 'E') {
        result = {
            notation: 'scientific',
        };
        stem = stem.slice(1);
    }
    if (result) {
        var signDisplay = stem.slice(0, 2);
        if (signDisplay === '+!') {
            result.signDisplay = 'always';
            stem = stem.slice(2);
        }
        else if (signDisplay === '+?') {
            result.signDisplay = 'exceptZero';
            stem = stem.slice(2);
        }
        if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
            throw new Error('Malformed concise eng/scientific notation');
        }
        result.minimumIntegerDigits = stem.length;
    }
    return result;
}
function parseNotationOptions(opt) {
    var result = {};
    var signOpts = parseSign(opt);
    if (signOpts) {
        return signOpts;
    }
    return result;
}
/**
 * https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md#skeleton-stems-and-options
 */
function parseNumberSkeleton(tokens) {
    var result = {};
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        switch (token.stem) {
            case 'percent':
            case '%':
                result.style = 'percent';
                continue;
            case '%x100':
                result.style = 'percent';
                result.scale = 100;
                continue;
            case 'currency':
                result.style = 'currency';
                result.currency = token.options[0];
                continue;
            case 'group-off':
            case ',_':
                result.useGrouping = false;
                continue;
            case 'precision-integer':
            case '.':
                result.maximumFractionDigits = 0;
                continue;
            case 'measure-unit':
            case 'unit':
                result.style = 'unit';
                result.unit = icuUnitToEcma(token.options[0]);
                continue;
            case 'compact-short':
            case 'K':
                result.notation = 'compact';
                result.compactDisplay = 'short';
                continue;
            case 'compact-long':
            case 'KK':
                result.notation = 'compact';
                result.compactDisplay = 'long';
                continue;
            case 'scientific':
                result = __assign(__assign(__assign({}, result), { notation: 'scientific' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                continue;
            case 'engineering':
                result = __assign(__assign(__assign({}, result), { notation: 'engineering' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                continue;
            case 'notation-simple':
                result.notation = 'standard';
                continue;
            // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h
            case 'unit-width-narrow':
                result.currencyDisplay = 'narrowSymbol';
                result.unitDisplay = 'narrow';
                continue;
            case 'unit-width-short':
                result.currencyDisplay = 'code';
                result.unitDisplay = 'short';
                continue;
            case 'unit-width-full-name':
                result.currencyDisplay = 'name';
                result.unitDisplay = 'long';
                continue;
            case 'unit-width-iso-code':
                result.currencyDisplay = 'symbol';
                continue;
            case 'scale':
                result.scale = parseFloat(token.options[0]);
                continue;
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
            case 'integer-width':
                if (token.options.length > 1) {
                    throw new RangeError('integer-width stems only accept a single optional option');
                }
                token.options[0].replace(INTEGER_WIDTH_REGEX, function (_, g1, g2, g3, g4, g5) {
                    if (g1) {
                        result.minimumIntegerDigits = g2.length;
                    }
                    else if (g3 && g4) {
                        throw new Error('We currently do not support maximum integer digits');
                    }
                    else if (g5) {
                        throw new Error('We currently do not support exact integer digits');
                    }
                    return '';
                });
                continue;
        }
        // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
        if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
            result.minimumIntegerDigits = token.stem.length;
            continue;
        }
        if (FRACTION_PRECISION_REGEX.test(token.stem)) {
            // Precision
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#fraction-precision
            // precision-integer case
            if (token.options.length > 1) {
                throw new RangeError('Fraction-precision stems only accept a single optional option');
            }
            token.stem.replace(FRACTION_PRECISION_REGEX, function (_, g1, g2, g3, g4, g5) {
                // .000* case (before ICU67 it was .000+)
                if (g2 === '*') {
                    result.minimumFractionDigits = g1.length;
                }
                // .### case
                else if (g3 && g3[0] === '#') {
                    result.maximumFractionDigits = g3.length;
                }
                // .00## case
                else if (g4 && g5) {
                    result.minimumFractionDigits = g4.length;
                    result.maximumFractionDigits = g4.length + g5.length;
                }
                else {
                    result.minimumFractionDigits = g1.length;
                    result.maximumFractionDigits = g1.length;
                }
                return '';
            });
            var opt = token.options[0];
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#trailing-zero-display
            if (opt === 'w') {
                result = __assign(__assign({}, result), { trailingZeroDisplay: 'stripIfInteger' });
            }
            else if (opt) {
                result = __assign(__assign({}, result), parseSignificantPrecision(opt));
            }
            continue;
        }
        // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#significant-digits-precision
        if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
            result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
            continue;
        }
        var signOpts = parseSign(token.stem);
        if (signOpts) {
            result = __assign(__assign({}, result), signOpts);
        }
        var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
        if (conciseScientificAndEngineeringOpts) {
            result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
        }
    }
    return result;
}

// @generated from time-data-gen.ts
// prettier-ignore  
var timeData = {
    "AX": [
        "H"
    ],
    "BQ": [
        "H"
    ],
    "CP": [
        "H"
    ],
    "CZ": [
        "H"
    ],
    "DK": [
        "H"
    ],
    "FI": [
        "H"
    ],
    "ID": [
        "H"
    ],
    "IS": [
        "H"
    ],
    "ML": [
        "H"
    ],
    "NE": [
        "H"
    ],
    "RU": [
        "H"
    ],
    "SE": [
        "H"
    ],
    "SJ": [
        "H"
    ],
    "SK": [
        "H"
    ],
    "AS": [
        "h",
        "H"
    ],
    "BT": [
        "h",
        "H"
    ],
    "DJ": [
        "h",
        "H"
    ],
    "ER": [
        "h",
        "H"
    ],
    "GH": [
        "h",
        "H"
    ],
    "IN": [
        "h",
        "H"
    ],
    "LS": [
        "h",
        "H"
    ],
    "PG": [
        "h",
        "H"
    ],
    "PW": [
        "h",
        "H"
    ],
    "SO": [
        "h",
        "H"
    ],
    "TO": [
        "h",
        "H"
    ],
    "VU": [
        "h",
        "H"
    ],
    "WS": [
        "h",
        "H"
    ],
    "001": [
        "H",
        "h"
    ],
    "AL": [
        "h",
        "H",
        "hB"
    ],
    "TD": [
        "h",
        "H",
        "hB"
    ],
    "ca-ES": [
        "H",
        "h",
        "hB"
    ],
    "CF": [
        "H",
        "h",
        "hB"
    ],
    "CM": [
        "H",
        "h",
        "hB"
    ],
    "fr-CA": [
        "H",
        "h",
        "hB"
    ],
    "gl-ES": [
        "H",
        "h",
        "hB"
    ],
    "it-CH": [
        "H",
        "h",
        "hB"
    ],
    "it-IT": [
        "H",
        "h",
        "hB"
    ],
    "LU": [
        "H",
        "h",
        "hB"
    ],
    "NP": [
        "H",
        "h",
        "hB"
    ],
    "PF": [
        "H",
        "h",
        "hB"
    ],
    "SC": [
        "H",
        "h",
        "hB"
    ],
    "SM": [
        "H",
        "h",
        "hB"
    ],
    "SN": [
        "H",
        "h",
        "hB"
    ],
    "TF": [
        "H",
        "h",
        "hB"
    ],
    "VA": [
        "H",
        "h",
        "hB"
    ],
    "CY": [
        "h",
        "H",
        "hb",
        "hB"
    ],
    "GR": [
        "h",
        "H",
        "hb",
        "hB"
    ],
    "CO": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "DO": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "KP": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "KR": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "NA": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "PA": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "PR": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "VE": [
        "h",
        "H",
        "hB",
        "hb"
    ],
    "AC": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "AI": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "BW": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "BZ": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "CC": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "CK": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "CX": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "DG": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "FK": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "GB": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "GG": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "GI": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "IE": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "IM": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "IO": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "JE": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "LT": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "MK": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "MN": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "MS": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "NF": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "NG": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "NR": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "NU": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "PN": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "SH": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "SX": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "TA": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "ZA": [
        "H",
        "h",
        "hb",
        "hB"
    ],
    "af-ZA": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "AR": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "CL": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "CR": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "CU": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "EA": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "es-BO": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "es-BR": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "es-EC": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "es-ES": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "es-GQ": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "es-PE": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "GT": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "HN": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "IC": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "KG": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "KM": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "LK": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "MA": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "MX": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "NI": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "PY": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "SV": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "UY": [
        "H",
        "h",
        "hB",
        "hb"
    ],
    "JP": [
        "H",
        "h",
        "K"
    ],
    "AD": [
        "H",
        "hB"
    ],
    "AM": [
        "H",
        "hB"
    ],
    "AO": [
        "H",
        "hB"
    ],
    "AT": [
        "H",
        "hB"
    ],
    "AW": [
        "H",
        "hB"
    ],
    "BE": [
        "H",
        "hB"
    ],
    "BF": [
        "H",
        "hB"
    ],
    "BJ": [
        "H",
        "hB"
    ],
    "BL": [
        "H",
        "hB"
    ],
    "BR": [
        "H",
        "hB"
    ],
    "CG": [
        "H",
        "hB"
    ],
    "CI": [
        "H",
        "hB"
    ],
    "CV": [
        "H",
        "hB"
    ],
    "DE": [
        "H",
        "hB"
    ],
    "EE": [
        "H",
        "hB"
    ],
    "FR": [
        "H",
        "hB"
    ],
    "GA": [
        "H",
        "hB"
    ],
    "GF": [
        "H",
        "hB"
    ],
    "GN": [
        "H",
        "hB"
    ],
    "GP": [
        "H",
        "hB"
    ],
    "GW": [
        "H",
        "hB"
    ],
    "HR": [
        "H",
        "hB"
    ],
    "IL": [
        "H",
        "hB"
    ],
    "IT": [
        "H",
        "hB"
    ],
    "KZ": [
        "H",
        "hB"
    ],
    "MC": [
        "H",
        "hB"
    ],
    "MD": [
        "H",
        "hB"
    ],
    "MF": [
        "H",
        "hB"
    ],
    "MQ": [
        "H",
        "hB"
    ],
    "MZ": [
        "H",
        "hB"
    ],
    "NC": [
        "H",
        "hB"
    ],
    "NL": [
        "H",
        "hB"
    ],
    "PM": [
        "H",
        "hB"
    ],
    "PT": [
        "H",
        "hB"
    ],
    "RE": [
        "H",
        "hB"
    ],
    "RO": [
        "H",
        "hB"
    ],
    "SI": [
        "H",
        "hB"
    ],
    "SR": [
        "H",
        "hB"
    ],
    "ST": [
        "H",
        "hB"
    ],
    "TG": [
        "H",
        "hB"
    ],
    "TR": [
        "H",
        "hB"
    ],
    "WF": [
        "H",
        "hB"
    ],
    "YT": [
        "H",
        "hB"
    ],
    "BD": [
        "h",
        "hB",
        "H"
    ],
    "PK": [
        "h",
        "hB",
        "H"
    ],
    "AZ": [
        "H",
        "hB",
        "h"
    ],
    "BA": [
        "H",
        "hB",
        "h"
    ],
    "BG": [
        "H",
        "hB",
        "h"
    ],
    "CH": [
        "H",
        "hB",
        "h"
    ],
    "GE": [
        "H",
        "hB",
        "h"
    ],
    "LI": [
        "H",
        "hB",
        "h"
    ],
    "ME": [
        "H",
        "hB",
        "h"
    ],
    "RS": [
        "H",
        "hB",
        "h"
    ],
    "UA": [
        "H",
        "hB",
        "h"
    ],
    "UZ": [
        "H",
        "hB",
        "h"
    ],
    "XK": [
        "H",
        "hB",
        "h"
    ],
    "AG": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "AU": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "BB": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "BM": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "BS": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "CA": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "DM": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "en-001": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "FJ": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "FM": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "GD": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "GM": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "GU": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "GY": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "JM": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "KI": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "KN": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "KY": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "LC": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "LR": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "MH": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "MP": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "MW": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "NZ": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "SB": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "SG": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "SL": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "SS": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "SZ": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "TC": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "TT": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "UM": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "US": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "VC": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "VG": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "VI": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "ZM": [
        "h",
        "hb",
        "H",
        "hB"
    ],
    "BO": [
        "H",
        "hB",
        "h",
        "hb"
    ],
    "EC": [
        "H",
        "hB",
        "h",
        "hb"
    ],
    "ES": [
        "H",
        "hB",
        "h",
        "hb"
    ],
    "GQ": [
        "H",
        "hB",
        "h",
        "hb"
    ],
    "PE": [
        "H",
        "hB",
        "h",
        "hb"
    ],
    "AE": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "ar-001": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "BH": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "DZ": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "EG": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "EH": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "HK": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "IQ": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "JO": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "KW": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "LB": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "LY": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "MO": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "MR": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "OM": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "PH": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "PS": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "QA": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "SA": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "SD": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "SY": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "TN": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "YE": [
        "h",
        "hB",
        "hb",
        "H"
    ],
    "AF": [
        "H",
        "hb",
        "hB",
        "h"
    ],
    "LA": [
        "H",
        "hb",
        "hB",
        "h"
    ],
    "CN": [
        "H",
        "hB",
        "hb",
        "h"
    ],
    "LV": [
        "H",
        "hB",
        "hb",
        "h"
    ],
    "TL": [
        "H",
        "hB",
        "hb",
        "h"
    ],
    "zu-ZA": [
        "H",
        "hB",
        "hb",
        "h"
    ],
    "CD": [
        "hB",
        "H"
    ],
    "IR": [
        "hB",
        "H"
    ],
    "hi-IN": [
        "hB",
        "h",
        "H"
    ],
    "kn-IN": [
        "hB",
        "h",
        "H"
    ],
    "ml-IN": [
        "hB",
        "h",
        "H"
    ],
    "te-IN": [
        "hB",
        "h",
        "H"
    ],
    "KH": [
        "hB",
        "h",
        "H",
        "hb"
    ],
    "ta-IN": [
        "hB",
        "h",
        "hb",
        "H"
    ],
    "BN": [
        "hb",
        "hB",
        "h",
        "H"
    ],
    "MY": [
        "hb",
        "hB",
        "h",
        "H"
    ],
    "ET": [
        "hB",
        "hb",
        "h",
        "H"
    ],
    "gu-IN": [
        "hB",
        "hb",
        "h",
        "H"
    ],
    "mr-IN": [
        "hB",
        "hb",
        "h",
        "H"
    ],
    "pa-IN": [
        "hB",
        "hb",
        "h",
        "H"
    ],
    "TW": [
        "hB",
        "hb",
        "h",
        "H"
    ],
    "KE": [
        "hB",
        "hb",
        "H",
        "h"
    ],
    "MM": [
        "hB",
        "hb",
        "H",
        "h"
    ],
    "TZ": [
        "hB",
        "hb",
        "H",
        "h"
    ],
    "UG": [
        "hB",
        "hb",
        "H",
        "h"
    ]
};

/**
 * Returns the best matching date time pattern if a date time skeleton
 * pattern is provided with a locale. Follows the Unicode specification:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#table-mapping-requested-time-skeletons-to-patterns
 * @param skeleton date time skeleton pattern that possibly includes j, J or C
 * @param locale
 */
function getBestPattern(skeleton, locale) {
    var skeletonCopy = '';
    for (var patternPos = 0; patternPos < skeleton.length; patternPos++) {
        var patternChar = skeleton.charAt(patternPos);
        if (patternChar === 'j') {
            var extraLength = 0;
            while (patternPos + 1 < skeleton.length &&
                skeleton.charAt(patternPos + 1) === patternChar) {
                extraLength++;
                patternPos++;
            }
            var hourLen = 1 + (extraLength & 1);
            var dayPeriodLen = extraLength < 2 ? 1 : 3 + (extraLength >> 1);
            var dayPeriodChar = 'a';
            var hourChar = getDefaultHourSymbolFromLocale(locale);
            if (hourChar == 'H' || hourChar == 'k') {
                dayPeriodLen = 0;
            }
            while (dayPeriodLen-- > 0) {
                skeletonCopy += dayPeriodChar;
            }
            while (hourLen-- > 0) {
                skeletonCopy = hourChar + skeletonCopy;
            }
        }
        else if (patternChar === 'J') {
            skeletonCopy += 'H';
        }
        else {
            skeletonCopy += patternChar;
        }
    }
    return skeletonCopy;
}
/**
 * Maps the [hour cycle type](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/hourCycle)
 * of the given `locale` to the corresponding time pattern.
 * @param locale
 */
function getDefaultHourSymbolFromLocale(locale) {
    var hourCycle = locale.hourCycle;
    if (hourCycle === undefined &&
        // @ts-ignore hourCycle(s) is not identified yet
        locale.hourCycles &&
        // @ts-ignore
        locale.hourCycles.length) {
        // @ts-ignore
        hourCycle = locale.hourCycles[0];
    }
    if (hourCycle) {
        switch (hourCycle) {
            case 'h24':
                return 'k';
            case 'h23':
                return 'H';
            case 'h12':
                return 'h';
            case 'h11':
                return 'K';
            default:
                throw new Error('Invalid hourCycle');
        }
    }
    // TODO: Once hourCycle is fully supported remove the following with data generation
    var languageTag = locale.language;
    var regionTag;
    if (languageTag !== 'root') {
        regionTag = locale.maximize().region;
    }
    var hourCycles = timeData[regionTag || ''] ||
        timeData[languageTag || ''] ||
        timeData["".concat(languageTag, "-001")] ||
        timeData['001'];
    return hourCycles[0];
}

var _a;
var SPACE_SEPARATOR_START_REGEX = new RegExp("^".concat(SPACE_SEPARATOR_REGEX.source, "*"));
var SPACE_SEPARATOR_END_REGEX = new RegExp("".concat(SPACE_SEPARATOR_REGEX.source, "*$"));
function createLocation(start, end) {
    return { start: start, end: end };
}
// #region Ponyfills
// Consolidate these variables up top for easier toggling during debugging
var hasNativeStartsWith = !!String.prototype.startsWith;
var hasNativeFromCodePoint = !!String.fromCodePoint;
var hasNativeFromEntries = !!Object.fromEntries;
var hasNativeCodePointAt = !!String.prototype.codePointAt;
var hasTrimStart = !!String.prototype.trimStart;
var hasTrimEnd = !!String.prototype.trimEnd;
var hasNativeIsSafeInteger = !!Number.isSafeInteger;
var isSafeInteger = hasNativeIsSafeInteger
    ? Number.isSafeInteger
    : function (n) {
        return (typeof n === 'number' &&
            isFinite(n) &&
            Math.floor(n) === n &&
            Math.abs(n) <= 0x1fffffffffffff);
    };
// IE11 does not support y and u.
var REGEX_SUPPORTS_U_AND_Y = true;
try {
    var re = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
    /**
     * legacy Edge or Xbox One browser
     * Unicode flag support: supported
     * Pattern_Syntax support: not supported
     * See https://github.com/formatjs/formatjs/issues/2822
     */
    REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec('a')) === null || _a === void 0 ? void 0 : _a[0]) === 'a';
}
catch (_) {
    REGEX_SUPPORTS_U_AND_Y = false;
}
var startsWith = hasNativeStartsWith
    ? // Native
        function startsWith(s, search, position) {
            return s.startsWith(search, position);
        }
    : // For IE11
        function startsWith(s, search, position) {
            return s.slice(position, position + search.length) === search;
        };
var fromCodePoint = hasNativeFromCodePoint
    ? String.fromCodePoint
    : // IE11
        function fromCodePoint() {
            var codePoints = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                codePoints[_i] = arguments[_i];
            }
            var elements = '';
            var length = codePoints.length;
            var i = 0;
            var code;
            while (length > i) {
                code = codePoints[i++];
                if (code > 0x10ffff)
                    throw RangeError(code + ' is not a valid code point');
                elements +=
                    code < 0x10000
                        ? String.fromCharCode(code)
                        : String.fromCharCode(((code -= 0x10000) >> 10) + 0xd800, (code % 0x400) + 0xdc00);
            }
            return elements;
        };
var fromEntries = 
// native
hasNativeFromEntries
    ? Object.fromEntries
    : // Ponyfill
        function fromEntries(entries) {
            var obj = {};
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var _a = entries_1[_i], k = _a[0], v = _a[1];
                obj[k] = v;
            }
            return obj;
        };
var codePointAt = hasNativeCodePointAt
    ? // Native
        function codePointAt(s, index) {
            return s.codePointAt(index);
        }
    : // IE 11
        function codePointAt(s, index) {
            var size = s.length;
            if (index < 0 || index >= size) {
                return undefined;
            }
            var first = s.charCodeAt(index);
            var second;
            return first < 0xd800 ||
                first > 0xdbff ||
                index + 1 === size ||
                (second = s.charCodeAt(index + 1)) < 0xdc00 ||
                second > 0xdfff
                ? first
                : ((first - 0xd800) << 10) + (second - 0xdc00) + 0x10000;
        };
var trimStart = hasTrimStart
    ? // Native
        function trimStart(s) {
            return s.trimStart();
        }
    : // Ponyfill
        function trimStart(s) {
            return s.replace(SPACE_SEPARATOR_START_REGEX, '');
        };
var trimEnd = hasTrimEnd
    ? // Native
        function trimEnd(s) {
            return s.trimEnd();
        }
    : // Ponyfill
        function trimEnd(s) {
            return s.replace(SPACE_SEPARATOR_END_REGEX, '');
        };
// Prevent minifier to translate new RegExp to literal form that might cause syntax error on IE11.
function RE(s, flag) {
    return new RegExp(s, flag);
}
// #endregion
var matchIdentifierAtIndex;
if (REGEX_SUPPORTS_U_AND_Y) {
    // Native
    var IDENTIFIER_PREFIX_RE_1 = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
    matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
        var _a;
        IDENTIFIER_PREFIX_RE_1.lastIndex = index;
        var match = IDENTIFIER_PREFIX_RE_1.exec(s);
        return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
    };
}
else {
    // IE11
    matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
        var match = [];
        while (true) {
            var c = codePointAt(s, index);
            if (c === undefined || _isWhiteSpace(c) || _isPatternSyntax(c)) {
                break;
            }
            match.push(c);
            index += c >= 0x10000 ? 2 : 1;
        }
        return fromCodePoint.apply(void 0, match);
    };
}
var Parser = /** @class */ (function () {
    function Parser(message, options) {
        if (options === void 0) { options = {}; }
        this.message = message;
        this.position = { offset: 0, line: 1, column: 1 };
        this.ignoreTag = !!options.ignoreTag;
        this.locale = options.locale;
        this.requiresOtherClause = !!options.requiresOtherClause;
        this.shouldParseSkeletons = !!options.shouldParseSkeletons;
    }
    Parser.prototype.parse = function () {
        if (this.offset() !== 0) {
            throw Error('parser can only be used once');
        }
        return this.parseMessage(0, '', false);
    };
    Parser.prototype.parseMessage = function (nestingLevel, parentArgType, expectingCloseTag) {
        var elements = [];
        while (!this.isEOF()) {
            var char = this.char();
            if (char === 123 /* `{` */) {
                var result = this.parseArgument(nestingLevel, expectingCloseTag);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
            else if (char === 125 /* `}` */ && nestingLevel > 0) {
                break;
            }
            else if (char === 35 /* `#` */ &&
                (parentArgType === 'plural' || parentArgType === 'selectordinal')) {
                var position = this.clonePosition();
                this.bump();
                elements.push({
                    type: TYPE.pound,
                    location: createLocation(position, this.clonePosition()),
                });
            }
            else if (char === 60 /* `<` */ &&
                !this.ignoreTag &&
                this.peek() === 47 // char code for '/'
            ) {
                if (expectingCloseTag) {
                    break;
                }
                else {
                    return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
                }
            }
            else if (char === 60 /* `<` */ &&
                !this.ignoreTag &&
                _isAlpha(this.peek() || 0)) {
                var result = this.parseTag(nestingLevel, parentArgType);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
            else {
                var result = this.parseLiteral(nestingLevel, parentArgType);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
        }
        return { val: elements, err: null };
    };
    /**
     * A tag name must start with an ASCII lower/upper case letter. The grammar is based on the
     * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
     * are accepted:
     *
     * ```
     * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
     * tagName ::= [a-z] (PENChar)*
     * PENChar ::=
     *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
     *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
     *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
     * ```
     *
     * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
     * NOTE: We're a bit more lax here since HTML technically does not allow uppercase HTML element but we do
     * since other tag-based engines like React allow it
     */
    Parser.prototype.parseTag = function (nestingLevel, parentArgType) {
        var startPosition = this.clonePosition();
        this.bump(); // `<`
        var tagName = this.parseTagName();
        this.bumpSpace();
        if (this.bumpIf('/>')) {
            // Self closing tag
            return {
                val: {
                    type: TYPE.literal,
                    value: "<".concat(tagName, "/>"),
                    location: createLocation(startPosition, this.clonePosition()),
                },
                err: null,
            };
        }
        else if (this.bumpIf('>')) {
            var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
            if (childrenResult.err) {
                return childrenResult;
            }
            var children = childrenResult.val;
            // Expecting a close tag
            var endTagStartPosition = this.clonePosition();
            if (this.bumpIf('</')) {
                if (this.isEOF() || !_isAlpha(this.char())) {
                    return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                }
                var closingTagNameStartPosition = this.clonePosition();
                var closingTagName = this.parseTagName();
                if (tagName !== closingTagName) {
                    return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
                }
                this.bumpSpace();
                if (!this.bumpIf('>')) {
                    return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                }
                return {
                    val: {
                        type: TYPE.tag,
                        value: tagName,
                        children: children,
                        location: createLocation(startPosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            else {
                return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
            }
        }
        else {
            return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
        }
    };
    /**
     * This method assumes that the caller has peeked ahead for the first tag character.
     */
    Parser.prototype.parseTagName = function () {
        var startOffset = this.offset();
        this.bump(); // the first tag name character
        while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
            this.bump();
        }
        return this.message.slice(startOffset, this.offset());
    };
    Parser.prototype.parseLiteral = function (nestingLevel, parentArgType) {
        var start = this.clonePosition();
        var value = '';
        while (true) {
            var parseQuoteResult = this.tryParseQuote(parentArgType);
            if (parseQuoteResult) {
                value += parseQuoteResult;
                continue;
            }
            var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
            if (parseUnquotedResult) {
                value += parseUnquotedResult;
                continue;
            }
            var parseLeftAngleResult = this.tryParseLeftAngleBracket();
            if (parseLeftAngleResult) {
                value += parseLeftAngleResult;
                continue;
            }
            break;
        }
        var location = createLocation(start, this.clonePosition());
        return {
            val: { type: TYPE.literal, value: value, location: location },
            err: null,
        };
    };
    Parser.prototype.tryParseLeftAngleBracket = function () {
        if (!this.isEOF() &&
            this.char() === 60 /* `<` */ &&
            (this.ignoreTag ||
                // If at the opening tag or closing tag position, bail.
                !_isAlphaOrSlash(this.peek() || 0))) {
            this.bump(); // `<`
            return '<';
        }
        return null;
    };
    /**
     * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
     * a character that requires quoting (that is, "only where needed"), and works the same in
     * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
     */
    Parser.prototype.tryParseQuote = function (parentArgType) {
        if (this.isEOF() || this.char() !== 39 /* `'` */) {
            return null;
        }
        // Parse escaped char following the apostrophe, or early return if there is no escaped char.
        // Check if is valid escaped character
        switch (this.peek()) {
            case 39 /* `'` */:
                // double quote, should return as a single quote.
                this.bump();
                this.bump();
                return "'";
            // '{', '<', '>', '}'
            case 123:
            case 60:
            case 62:
            case 125:
                break;
            case 35: // '#'
                if (parentArgType === 'plural' || parentArgType === 'selectordinal') {
                    break;
                }
                return null;
            default:
                return null;
        }
        this.bump(); // apostrophe
        var codePoints = [this.char()]; // escaped char
        this.bump();
        // read chars until the optional closing apostrophe is found
        while (!this.isEOF()) {
            var ch = this.char();
            if (ch === 39 /* `'` */) {
                if (this.peek() === 39 /* `'` */) {
                    codePoints.push(39);
                    // Bump one more time because we need to skip 2 characters.
                    this.bump();
                }
                else {
                    // Optional closing apostrophe.
                    this.bump();
                    break;
                }
            }
            else {
                codePoints.push(ch);
            }
            this.bump();
        }
        return fromCodePoint.apply(void 0, codePoints);
    };
    Parser.prototype.tryParseUnquoted = function (nestingLevel, parentArgType) {
        if (this.isEOF()) {
            return null;
        }
        var ch = this.char();
        if (ch === 60 /* `<` */ ||
            ch === 123 /* `{` */ ||
            (ch === 35 /* `#` */ &&
                (parentArgType === 'plural' || parentArgType === 'selectordinal')) ||
            (ch === 125 /* `}` */ && nestingLevel > 0)) {
            return null;
        }
        else {
            this.bump();
            return fromCodePoint(ch);
        }
    };
    Parser.prototype.parseArgument = function (nestingLevel, expectingCloseTag) {
        var openingBracePosition = this.clonePosition();
        this.bump(); // `{`
        this.bumpSpace();
        if (this.isEOF()) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        if (this.char() === 125 /* `}` */) {
            this.bump();
            return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        // argument name
        var value = this.parseIdentifierIfPossible().value;
        if (!value) {
            return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bumpSpace();
        if (this.isEOF()) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        switch (this.char()) {
            // Simple argument: `{name}`
            case 125 /* `}` */: {
                this.bump(); // `}`
                return {
                    val: {
                        type: TYPE.argument,
                        // value does not include the opening and closing braces.
                        value: value,
                        location: createLocation(openingBracePosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            // Argument with options: `{name, format, ...}`
            case 44 /* `,` */: {
                this.bump(); // `,`
                this.bumpSpace();
                if (this.isEOF()) {
                    return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
                }
                return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
            }
            default:
                return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
    };
    /**
     * Advance the parser until the end of the identifier, if it is currently on
     * an identifier character. Return an empty string otherwise.
     */
    Parser.prototype.parseIdentifierIfPossible = function () {
        var startingPosition = this.clonePosition();
        var startOffset = this.offset();
        var value = matchIdentifierAtIndex(this.message, startOffset);
        var endOffset = startOffset + value.length;
        this.bumpTo(endOffset);
        var endPosition = this.clonePosition();
        var location = createLocation(startingPosition, endPosition);
        return { value: value, location: location };
    };
    Parser.prototype.parseArgumentOptions = function (nestingLevel, expectingCloseTag, value, openingBracePosition) {
        var _a;
        // Parse this range:
        // {name, type, style}
        //        ^---^
        var typeStartPosition = this.clonePosition();
        var argType = this.parseIdentifierIfPossible().value;
        var typeEndPosition = this.clonePosition();
        switch (argType) {
            case '':
                // Expecting a style string number, date, time, plural, selectordinal, or select.
                return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
            case 'number':
            case 'date':
            case 'time': {
                // Parse this range:
                // {name, number, style}
                //              ^-------^
                this.bumpSpace();
                var styleAndLocation = null;
                if (this.bumpIf(',')) {
                    this.bumpSpace();
                    var styleStartPosition = this.clonePosition();
                    var result = this.parseSimpleArgStyleIfPossible();
                    if (result.err) {
                        return result;
                    }
                    var style = trimEnd(result.val);
                    if (style.length === 0) {
                        return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                    var styleLocation = createLocation(styleStartPosition, this.clonePosition());
                    styleAndLocation = { style: style, styleLocation: styleLocation };
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                var location_1 = createLocation(openingBracePosition, this.clonePosition());
                // Extract style or skeleton
                if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, '::', 0)) {
                    // Skeleton starts with `::`.
                    var skeleton = trimStart(styleAndLocation.style.slice(2));
                    if (argType === 'number') {
                        var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
                        if (result.err) {
                            return result;
                        }
                        return {
                            val: { type: TYPE.number, value: value, location: location_1, style: result.val },
                            err: null,
                        };
                    }
                    else {
                        if (skeleton.length === 0) {
                            return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
                        }
                        var dateTimePattern = skeleton;
                        // Get "best match" pattern only if locale is passed, if not, let it
                        // pass as-is where `parseDateTimeSkeleton()` will throw an error
                        // for unsupported patterns.
                        if (this.locale) {
                            dateTimePattern = getBestPattern(skeleton, this.locale);
                        }
                        var style = {
                            type: SKELETON_TYPE.dateTime,
                            pattern: dateTimePattern,
                            location: styleAndLocation.styleLocation,
                            parsedOptions: this.shouldParseSkeletons
                                ? parseDateTimeSkeleton(dateTimePattern)
                                : {},
                        };
                        var type = argType === 'date' ? TYPE.date : TYPE.time;
                        return {
                            val: { type: type, value: value, location: location_1, style: style },
                            err: null,
                        };
                    }
                }
                // Regular style or no style.
                return {
                    val: {
                        type: argType === 'number'
                            ? TYPE.number
                            : argType === 'date'
                                ? TYPE.date
                                : TYPE.time,
                        value: value,
                        location: location_1,
                        style: (_a = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a !== void 0 ? _a : null,
                    },
                    err: null,
                };
            }
            case 'plural':
            case 'selectordinal':
            case 'select': {
                // Parse this range:
                // {name, plural, options}
                //              ^---------^
                var typeEndPosition_1 = this.clonePosition();
                this.bumpSpace();
                if (!this.bumpIf(',')) {
                    return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign({}, typeEndPosition_1)));
                }
                this.bumpSpace();
                // Parse offset:
                // {name, plural, offset:1, options}
                //                ^-----^
                //
                // or the first option:
                //
                // {name, plural, one {...} other {...}}
                //                ^--^
                var identifierAndLocation = this.parseIdentifierIfPossible();
                var pluralOffset = 0;
                if (argType !== 'select' && identifierAndLocation.value === 'offset') {
                    if (!this.bumpIf(':')) {
                        return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                    this.bumpSpace();
                    var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
                    if (result.err) {
                        return result;
                    }
                    // Parse another identifier for option parsing
                    this.bumpSpace();
                    identifierAndLocation = this.parseIdentifierIfPossible();
                    pluralOffset = result.val;
                }
                var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
                if (optionsResult.err) {
                    return optionsResult;
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                var location_2 = createLocation(openingBracePosition, this.clonePosition());
                if (argType === 'select') {
                    return {
                        val: {
                            type: TYPE.select,
                            value: value,
                            options: fromEntries(optionsResult.val),
                            location: location_2,
                        },
                        err: null,
                    };
                }
                else {
                    return {
                        val: {
                            type: TYPE.plural,
                            value: value,
                            options: fromEntries(optionsResult.val),
                            offset: pluralOffset,
                            pluralType: argType === 'plural' ? 'cardinal' : 'ordinal',
                            location: location_2,
                        },
                        err: null,
                    };
                }
            }
            default:
                return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
        }
    };
    Parser.prototype.tryParseArgumentClose = function (openingBracePosition) {
        // Parse: {value, number, ::currency/GBP }
        //
        if (this.isEOF() || this.char() !== 125 /* `}` */) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bump(); // `}`
        return { val: true, err: null };
    };
    /**
     * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
     */
    Parser.prototype.parseSimpleArgStyleIfPossible = function () {
        var nestedBraces = 0;
        var startPosition = this.clonePosition();
        while (!this.isEOF()) {
            var ch = this.char();
            switch (ch) {
                case 39 /* `'` */: {
                    // Treat apostrophe as quoting but include it in the style part.
                    // Find the end of the quoted literal text.
                    this.bump();
                    var apostrophePosition = this.clonePosition();
                    if (!this.bumpUntil("'")) {
                        return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
                    }
                    this.bump();
                    break;
                }
                case 123 /* `{` */: {
                    nestedBraces += 1;
                    this.bump();
                    break;
                }
                case 125 /* `}` */: {
                    if (nestedBraces > 0) {
                        nestedBraces -= 1;
                    }
                    else {
                        return {
                            val: this.message.slice(startPosition.offset, this.offset()),
                            err: null,
                        };
                    }
                    break;
                }
                default:
                    this.bump();
                    break;
            }
        }
        return {
            val: this.message.slice(startPosition.offset, this.offset()),
            err: null,
        };
    };
    Parser.prototype.parseNumberSkeletonFromString = function (skeleton, location) {
        var tokens = [];
        try {
            tokens = parseNumberSkeletonFromString(skeleton);
        }
        catch (e) {
            return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
        }
        return {
            val: {
                type: SKELETON_TYPE.number,
                tokens: tokens,
                location: location,
                parsedOptions: this.shouldParseSkeletons
                    ? parseNumberSkeleton(tokens)
                    : {},
            },
            err: null,
        };
    };
    /**
     * @param nesting_level The current nesting level of messages.
     *     This can be positive when parsing message fragment in select or plural argument options.
     * @param parent_arg_type The parent argument's type.
     * @param parsed_first_identifier If provided, this is the first identifier-like selector of
     *     the argument. It is a by-product of a previous parsing attempt.
     * @param expecting_close_tag If true, this message is directly or indirectly nested inside
     *     between a pair of opening and closing tags. The nested message will not parse beyond
     *     the closing tag boundary.
     */
    Parser.prototype.tryParsePluralOrSelectOptions = function (nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
        var _a;
        var hasOtherClause = false;
        var options = [];
        var parsedSelectors = new Set();
        var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
        // Parse:
        // one {one apple}
        // ^--^
        while (true) {
            if (selector.length === 0) {
                var startPosition = this.clonePosition();
                if (parentArgType !== 'select' && this.bumpIf('=')) {
                    // Try parse `={number}` selector
                    var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
                    if (result.err) {
                        return result;
                    }
                    selectorLocation = createLocation(startPosition, this.clonePosition());
                    selector = this.message.slice(startPosition.offset, this.offset());
                }
                else {
                    break;
                }
            }
            // Duplicate selector clauses
            if (parsedSelectors.has(selector)) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR
                    : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
            }
            if (selector === 'other') {
                hasOtherClause = true;
            }
            // Parse:
            // one {one apple}
            //     ^----------^
            this.bumpSpace();
            var openingBracePosition = this.clonePosition();
            if (!this.bumpIf('{')) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
                    : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
            }
            var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
            if (fragmentResult.err) {
                return fragmentResult;
            }
            var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
            if (argCloseResult.err) {
                return argCloseResult;
            }
            options.push([
                selector,
                {
                    value: fragmentResult.val,
                    location: createLocation(openingBracePosition, this.clonePosition()),
                },
            ]);
            // Keep track of the existing selectors
            parsedSelectors.add(selector);
            // Prep next selector clause.
            this.bumpSpace();
            (_a = this.parseIdentifierIfPossible(), selector = _a.value, selectorLocation = _a.location);
        }
        if (options.length === 0) {
            return this.error(parentArgType === 'select'
                ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR
                : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
        }
        if (this.requiresOtherClause && !hasOtherClause) {
            return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
        }
        return { val: options, err: null };
    };
    Parser.prototype.tryParseDecimalInteger = function (expectNumberError, invalidNumberError) {
        var sign = 1;
        var startingPosition = this.clonePosition();
        if (this.bumpIf('+')) ;
        else if (this.bumpIf('-')) {
            sign = -1;
        }
        var hasDigits = false;
        var decimal = 0;
        while (!this.isEOF()) {
            var ch = this.char();
            if (ch >= 48 /* `0` */ && ch <= 57 /* `9` */) {
                hasDigits = true;
                decimal = decimal * 10 + (ch - 48);
                this.bump();
            }
            else {
                break;
            }
        }
        var location = createLocation(startingPosition, this.clonePosition());
        if (!hasDigits) {
            return this.error(expectNumberError, location);
        }
        decimal *= sign;
        if (!isSafeInteger(decimal)) {
            return this.error(invalidNumberError, location);
        }
        return { val: decimal, err: null };
    };
    Parser.prototype.offset = function () {
        return this.position.offset;
    };
    Parser.prototype.isEOF = function () {
        return this.offset() === this.message.length;
    };
    Parser.prototype.clonePosition = function () {
        // This is much faster than `Object.assign` or spread.
        return {
            offset: this.position.offset,
            line: this.position.line,
            column: this.position.column,
        };
    };
    /**
     * Return the code point at the current position of the parser.
     * Throws if the index is out of bound.
     */
    Parser.prototype.char = function () {
        var offset = this.position.offset;
        if (offset >= this.message.length) {
            throw Error('out of bound');
        }
        var code = codePointAt(this.message, offset);
        if (code === undefined) {
            throw Error("Offset ".concat(offset, " is at invalid UTF-16 code unit boundary"));
        }
        return code;
    };
    Parser.prototype.error = function (kind, location) {
        return {
            val: null,
            err: {
                kind: kind,
                message: this.message,
                location: location,
            },
        };
    };
    /** Bump the parser to the next UTF-16 code unit. */
    Parser.prototype.bump = function () {
        if (this.isEOF()) {
            return;
        }
        var code = this.char();
        if (code === 10 /* '\n' */) {
            this.position.line += 1;
            this.position.column = 1;
            this.position.offset += 1;
        }
        else {
            this.position.column += 1;
            // 0 ~ 0x10000 -> unicode BMP, otherwise skip the surrogate pair.
            this.position.offset += code < 0x10000 ? 1 : 2;
        }
    };
    /**
     * If the substring starting at the current position of the parser has
     * the given prefix, then bump the parser to the character immediately
     * following the prefix and return true. Otherwise, don't bump the parser
     * and return false.
     */
    Parser.prototype.bumpIf = function (prefix) {
        if (startsWith(this.message, prefix, this.offset())) {
            for (var i = 0; i < prefix.length; i++) {
                this.bump();
            }
            return true;
        }
        return false;
    };
    /**
     * Bump the parser until the pattern character is found and return `true`.
     * Otherwise bump to the end of the file and return `false`.
     */
    Parser.prototype.bumpUntil = function (pattern) {
        var currentOffset = this.offset();
        var index = this.message.indexOf(pattern, currentOffset);
        if (index >= 0) {
            this.bumpTo(index);
            return true;
        }
        else {
            this.bumpTo(this.message.length);
            return false;
        }
    };
    /**
     * Bump the parser to the target offset.
     * If target offset is beyond the end of the input, bump the parser to the end of the input.
     */
    Parser.prototype.bumpTo = function (targetOffset) {
        if (this.offset() > targetOffset) {
            throw Error("targetOffset ".concat(targetOffset, " must be greater than or equal to the current offset ").concat(this.offset()));
        }
        targetOffset = Math.min(targetOffset, this.message.length);
        while (true) {
            var offset = this.offset();
            if (offset === targetOffset) {
                break;
            }
            if (offset > targetOffset) {
                throw Error("targetOffset ".concat(targetOffset, " is at invalid UTF-16 code unit boundary"));
            }
            this.bump();
            if (this.isEOF()) {
                break;
            }
        }
    };
    /** advance the parser through all whitespace to the next non-whitespace code unit. */
    Parser.prototype.bumpSpace = function () {
        while (!this.isEOF() && _isWhiteSpace(this.char())) {
            this.bump();
        }
    };
    /**
     * Peek at the *next* Unicode codepoint in the input without advancing the parser.
     * If the input has been exhausted, then this returns null.
     */
    Parser.prototype.peek = function () {
        if (this.isEOF()) {
            return null;
        }
        var code = this.char();
        var offset = this.offset();
        var nextCode = this.message.charCodeAt(offset + (code >= 0x10000 ? 2 : 1));
        return nextCode !== null && nextCode !== void 0 ? nextCode : null;
    };
    return Parser;
}());
/**
 * This check if codepoint is alphabet (lower & uppercase)
 * @param codepoint
 * @returns
 */
function _isAlpha(codepoint) {
    return ((codepoint >= 97 && codepoint <= 122) ||
        (codepoint >= 65 && codepoint <= 90));
}
function _isAlphaOrSlash(codepoint) {
    return _isAlpha(codepoint) || codepoint === 47; /* '/' */
}
/** See `parseTag` function docs. */
function _isPotentialElementNameChar(c) {
    return (c === 45 /* '-' */ ||
        c === 46 /* '.' */ ||
        (c >= 48 && c <= 57) /* 0..9 */ ||
        c === 95 /* '_' */ ||
        (c >= 97 && c <= 122) /** a..z */ ||
        (c >= 65 && c <= 90) /* A..Z */ ||
        c == 0xb7 ||
        (c >= 0xc0 && c <= 0xd6) ||
        (c >= 0xd8 && c <= 0xf6) ||
        (c >= 0xf8 && c <= 0x37d) ||
        (c >= 0x37f && c <= 0x1fff) ||
        (c >= 0x200c && c <= 0x200d) ||
        (c >= 0x203f && c <= 0x2040) ||
        (c >= 0x2070 && c <= 0x218f) ||
        (c >= 0x2c00 && c <= 0x2fef) ||
        (c >= 0x3001 && c <= 0xd7ff) ||
        (c >= 0xf900 && c <= 0xfdcf) ||
        (c >= 0xfdf0 && c <= 0xfffd) ||
        (c >= 0x10000 && c <= 0xeffff));
}
/**
 * Code point equivalent of regex `\p{White_Space}`.
 * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
function _isWhiteSpace(c) {
    return ((c >= 0x0009 && c <= 0x000d) ||
        c === 0x0020 ||
        c === 0x0085 ||
        (c >= 0x200e && c <= 0x200f) ||
        c === 0x2028 ||
        c === 0x2029);
}
/**
 * Code point equivalent of regex `\p{Pattern_Syntax}`.
 * See https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
function _isPatternSyntax(c) {
    return ((c >= 0x0021 && c <= 0x0023) ||
        c === 0x0024 ||
        (c >= 0x0025 && c <= 0x0027) ||
        c === 0x0028 ||
        c === 0x0029 ||
        c === 0x002a ||
        c === 0x002b ||
        c === 0x002c ||
        c === 0x002d ||
        (c >= 0x002e && c <= 0x002f) ||
        (c >= 0x003a && c <= 0x003b) ||
        (c >= 0x003c && c <= 0x003e) ||
        (c >= 0x003f && c <= 0x0040) ||
        c === 0x005b ||
        c === 0x005c ||
        c === 0x005d ||
        c === 0x005e ||
        c === 0x0060 ||
        c === 0x007b ||
        c === 0x007c ||
        c === 0x007d ||
        c === 0x007e ||
        c === 0x00a1 ||
        (c >= 0x00a2 && c <= 0x00a5) ||
        c === 0x00a6 ||
        c === 0x00a7 ||
        c === 0x00a9 ||
        c === 0x00ab ||
        c === 0x00ac ||
        c === 0x00ae ||
        c === 0x00b0 ||
        c === 0x00b1 ||
        c === 0x00b6 ||
        c === 0x00bb ||
        c === 0x00bf ||
        c === 0x00d7 ||
        c === 0x00f7 ||
        (c >= 0x2010 && c <= 0x2015) ||
        (c >= 0x2016 && c <= 0x2017) ||
        c === 0x2018 ||
        c === 0x2019 ||
        c === 0x201a ||
        (c >= 0x201b && c <= 0x201c) ||
        c === 0x201d ||
        c === 0x201e ||
        c === 0x201f ||
        (c >= 0x2020 && c <= 0x2027) ||
        (c >= 0x2030 && c <= 0x2038) ||
        c === 0x2039 ||
        c === 0x203a ||
        (c >= 0x203b && c <= 0x203e) ||
        (c >= 0x2041 && c <= 0x2043) ||
        c === 0x2044 ||
        c === 0x2045 ||
        c === 0x2046 ||
        (c >= 0x2047 && c <= 0x2051) ||
        c === 0x2052 ||
        c === 0x2053 ||
        (c >= 0x2055 && c <= 0x205e) ||
        (c >= 0x2190 && c <= 0x2194) ||
        (c >= 0x2195 && c <= 0x2199) ||
        (c >= 0x219a && c <= 0x219b) ||
        (c >= 0x219c && c <= 0x219f) ||
        c === 0x21a0 ||
        (c >= 0x21a1 && c <= 0x21a2) ||
        c === 0x21a3 ||
        (c >= 0x21a4 && c <= 0x21a5) ||
        c === 0x21a6 ||
        (c >= 0x21a7 && c <= 0x21ad) ||
        c === 0x21ae ||
        (c >= 0x21af && c <= 0x21cd) ||
        (c >= 0x21ce && c <= 0x21cf) ||
        (c >= 0x21d0 && c <= 0x21d1) ||
        c === 0x21d2 ||
        c === 0x21d3 ||
        c === 0x21d4 ||
        (c >= 0x21d5 && c <= 0x21f3) ||
        (c >= 0x21f4 && c <= 0x22ff) ||
        (c >= 0x2300 && c <= 0x2307) ||
        c === 0x2308 ||
        c === 0x2309 ||
        c === 0x230a ||
        c === 0x230b ||
        (c >= 0x230c && c <= 0x231f) ||
        (c >= 0x2320 && c <= 0x2321) ||
        (c >= 0x2322 && c <= 0x2328) ||
        c === 0x2329 ||
        c === 0x232a ||
        (c >= 0x232b && c <= 0x237b) ||
        c === 0x237c ||
        (c >= 0x237d && c <= 0x239a) ||
        (c >= 0x239b && c <= 0x23b3) ||
        (c >= 0x23b4 && c <= 0x23db) ||
        (c >= 0x23dc && c <= 0x23e1) ||
        (c >= 0x23e2 && c <= 0x2426) ||
        (c >= 0x2427 && c <= 0x243f) ||
        (c >= 0x2440 && c <= 0x244a) ||
        (c >= 0x244b && c <= 0x245f) ||
        (c >= 0x2500 && c <= 0x25b6) ||
        c === 0x25b7 ||
        (c >= 0x25b8 && c <= 0x25c0) ||
        c === 0x25c1 ||
        (c >= 0x25c2 && c <= 0x25f7) ||
        (c >= 0x25f8 && c <= 0x25ff) ||
        (c >= 0x2600 && c <= 0x266e) ||
        c === 0x266f ||
        (c >= 0x2670 && c <= 0x2767) ||
        c === 0x2768 ||
        c === 0x2769 ||
        c === 0x276a ||
        c === 0x276b ||
        c === 0x276c ||
        c === 0x276d ||
        c === 0x276e ||
        c === 0x276f ||
        c === 0x2770 ||
        c === 0x2771 ||
        c === 0x2772 ||
        c === 0x2773 ||
        c === 0x2774 ||
        c === 0x2775 ||
        (c >= 0x2794 && c <= 0x27bf) ||
        (c >= 0x27c0 && c <= 0x27c4) ||
        c === 0x27c5 ||
        c === 0x27c6 ||
        (c >= 0x27c7 && c <= 0x27e5) ||
        c === 0x27e6 ||
        c === 0x27e7 ||
        c === 0x27e8 ||
        c === 0x27e9 ||
        c === 0x27ea ||
        c === 0x27eb ||
        c === 0x27ec ||
        c === 0x27ed ||
        c === 0x27ee ||
        c === 0x27ef ||
        (c >= 0x27f0 && c <= 0x27ff) ||
        (c >= 0x2800 && c <= 0x28ff) ||
        (c >= 0x2900 && c <= 0x2982) ||
        c === 0x2983 ||
        c === 0x2984 ||
        c === 0x2985 ||
        c === 0x2986 ||
        c === 0x2987 ||
        c === 0x2988 ||
        c === 0x2989 ||
        c === 0x298a ||
        c === 0x298b ||
        c === 0x298c ||
        c === 0x298d ||
        c === 0x298e ||
        c === 0x298f ||
        c === 0x2990 ||
        c === 0x2991 ||
        c === 0x2992 ||
        c === 0x2993 ||
        c === 0x2994 ||
        c === 0x2995 ||
        c === 0x2996 ||
        c === 0x2997 ||
        c === 0x2998 ||
        (c >= 0x2999 && c <= 0x29d7) ||
        c === 0x29d8 ||
        c === 0x29d9 ||
        c === 0x29da ||
        c === 0x29db ||
        (c >= 0x29dc && c <= 0x29fb) ||
        c === 0x29fc ||
        c === 0x29fd ||
        (c >= 0x29fe && c <= 0x2aff) ||
        (c >= 0x2b00 && c <= 0x2b2f) ||
        (c >= 0x2b30 && c <= 0x2b44) ||
        (c >= 0x2b45 && c <= 0x2b46) ||
        (c >= 0x2b47 && c <= 0x2b4c) ||
        (c >= 0x2b4d && c <= 0x2b73) ||
        (c >= 0x2b74 && c <= 0x2b75) ||
        (c >= 0x2b76 && c <= 0x2b95) ||
        c === 0x2b96 ||
        (c >= 0x2b97 && c <= 0x2bff) ||
        (c >= 0x2e00 && c <= 0x2e01) ||
        c === 0x2e02 ||
        c === 0x2e03 ||
        c === 0x2e04 ||
        c === 0x2e05 ||
        (c >= 0x2e06 && c <= 0x2e08) ||
        c === 0x2e09 ||
        c === 0x2e0a ||
        c === 0x2e0b ||
        c === 0x2e0c ||
        c === 0x2e0d ||
        (c >= 0x2e0e && c <= 0x2e16) ||
        c === 0x2e17 ||
        (c >= 0x2e18 && c <= 0x2e19) ||
        c === 0x2e1a ||
        c === 0x2e1b ||
        c === 0x2e1c ||
        c === 0x2e1d ||
        (c >= 0x2e1e && c <= 0x2e1f) ||
        c === 0x2e20 ||
        c === 0x2e21 ||
        c === 0x2e22 ||
        c === 0x2e23 ||
        c === 0x2e24 ||
        c === 0x2e25 ||
        c === 0x2e26 ||
        c === 0x2e27 ||
        c === 0x2e28 ||
        c === 0x2e29 ||
        (c >= 0x2e2a && c <= 0x2e2e) ||
        c === 0x2e2f ||
        (c >= 0x2e30 && c <= 0x2e39) ||
        (c >= 0x2e3a && c <= 0x2e3b) ||
        (c >= 0x2e3c && c <= 0x2e3f) ||
        c === 0x2e40 ||
        c === 0x2e41 ||
        c === 0x2e42 ||
        (c >= 0x2e43 && c <= 0x2e4f) ||
        (c >= 0x2e50 && c <= 0x2e51) ||
        c === 0x2e52 ||
        (c >= 0x2e53 && c <= 0x2e7f) ||
        (c >= 0x3001 && c <= 0x3003) ||
        c === 0x3008 ||
        c === 0x3009 ||
        c === 0x300a ||
        c === 0x300b ||
        c === 0x300c ||
        c === 0x300d ||
        c === 0x300e ||
        c === 0x300f ||
        c === 0x3010 ||
        c === 0x3011 ||
        (c >= 0x3012 && c <= 0x3013) ||
        c === 0x3014 ||
        c === 0x3015 ||
        c === 0x3016 ||
        c === 0x3017 ||
        c === 0x3018 ||
        c === 0x3019 ||
        c === 0x301a ||
        c === 0x301b ||
        c === 0x301c ||
        c === 0x301d ||
        (c >= 0x301e && c <= 0x301f) ||
        c === 0x3020 ||
        c === 0x3030 ||
        c === 0xfd3e ||
        c === 0xfd3f ||
        (c >= 0xfe45 && c <= 0xfe46));
}

function pruneLocation(els) {
    els.forEach(function (el) {
        delete el.location;
        if (isSelectElement(el) || isPluralElement(el)) {
            for (var k in el.options) {
                delete el.options[k].location;
                pruneLocation(el.options[k].value);
            }
        }
        else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
            delete el.style.location;
        }
        else if ((isDateElement(el) || isTimeElement(el)) &&
            isDateTimeSkeleton(el.style)) {
            delete el.style.location;
        }
        else if (isTagElement(el)) {
            pruneLocation(el.children);
        }
    });
}
function parse(message, opts) {
    if (opts === void 0) { opts = {}; }
    opts = __assign({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
    var result = new Parser(message, opts).parse();
    if (result.err) {
        var error = SyntaxError(ErrorKind[result.err.kind]);
        // @ts-expect-error Assign to error object
        error.location = result.err.location;
        // @ts-expect-error Assign to error object
        error.originalMessage = result.err.message;
        throw error;
    }
    if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
        pruneLocation(result.val);
    }
    return result.val;
}

//
// Main
//
function memoize(fn, options) {
    var cache = options && options.cache ? options.cache : cacheDefault;
    var serializer = options && options.serializer ? options.serializer : serializerDefault;
    var strategy = options && options.strategy ? options.strategy : strategyDefault;
    return strategy(fn, {
        cache: cache,
        serializer: serializer,
    });
}
//
// Strategy
//
function isPrimitive(value) {
    return (value == null || typeof value === 'number' || typeof value === 'boolean'); // || typeof value === "string" 'unsafe' primitive for our needs
}
function monadic(fn, cache, serializer, arg) {
    var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.call(this, arg);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function variadic(fn, cache, serializer) {
    var args = Array.prototype.slice.call(arguments, 3);
    var cacheKey = serializer(args);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.apply(this, args);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
    return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
    var strategy = fn.length === 1 ? monadic : variadic;
    return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
    return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
function strategyMonadic(fn, options) {
    return assemble(fn, this, monadic, options.cache.create(), options.serializer);
}
//
// Serializer
//
var serializerDefault = function () {
    return JSON.stringify(arguments);
};
//
// Cache
//
function ObjectWithoutPrototypeCache() {
    this.cache = Object.create(null);
}
ObjectWithoutPrototypeCache.prototype.get = function (key) {
    return this.cache[key];
};
ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
    this.cache[key] = value;
};
var cacheDefault = {
    create: function create() {
        // @ts-ignore
        return new ObjectWithoutPrototypeCache();
    },
};
var strategies = {
    variadic: strategyVariadic,
    monadic: strategyMonadic,
};

var ErrorCode;
(function (ErrorCode) {
    // When we have a placeholder but no value to format
    ErrorCode["MISSING_VALUE"] = "MISSING_VALUE";
    // When value supplied is invalid
    ErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
    // When we need specific Intl API but it's not available
    ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
})(ErrorCode || (ErrorCode = {}));
var FormatError = /** @class */ (function (_super) {
    __extends(FormatError, _super);
    function FormatError(msg, code, originalMessage) {
        var _this = _super.call(this, msg) || this;
        _this.code = code;
        _this.originalMessage = originalMessage;
        return _this;
    }
    FormatError.prototype.toString = function () {
        return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
    };
    return FormatError;
}(Error));
var InvalidValueError = /** @class */ (function (_super) {
    __extends(InvalidValueError, _super);
    function InvalidValueError(variableId, value, options, originalMessage) {
        return _super.call(this, "Invalid values for \"".concat(variableId, "\": \"").concat(value, "\". Options are \"").concat(Object.keys(options).join('", "'), "\""), ErrorCode.INVALID_VALUE, originalMessage) || this;
    }
    return InvalidValueError;
}(FormatError));
var InvalidValueTypeError = /** @class */ (function (_super) {
    __extends(InvalidValueTypeError, _super);
    function InvalidValueTypeError(value, type, originalMessage) {
        return _super.call(this, "Value for \"".concat(value, "\" must be of type ").concat(type), ErrorCode.INVALID_VALUE, originalMessage) || this;
    }
    return InvalidValueTypeError;
}(FormatError));
var MissingValueError = /** @class */ (function (_super) {
    __extends(MissingValueError, _super);
    function MissingValueError(variableId, originalMessage) {
        return _super.call(this, "The intl string context variable \"".concat(variableId, "\" was not provided to the string \"").concat(originalMessage, "\""), ErrorCode.MISSING_VALUE, originalMessage) || this;
    }
    return MissingValueError;
}(FormatError));

var PART_TYPE;
(function (PART_TYPE) {
    PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
    PART_TYPE[PART_TYPE["object"] = 1] = "object";
})(PART_TYPE || (PART_TYPE = {}));
function mergeLiteral(parts) {
    if (parts.length < 2) {
        return parts;
    }
    return parts.reduce(function (all, part) {
        var lastPart = all[all.length - 1];
        if (!lastPart ||
            lastPart.type !== PART_TYPE.literal ||
            part.type !== PART_TYPE.literal) {
            all.push(part);
        }
        else {
            lastPart.value += part.value;
        }
        return all;
    }, []);
}
function isFormatXMLElementFn(el) {
    return typeof el === 'function';
}
// TODO(skeleton): add skeleton support
function formatToParts(els, locales, formatters, formats, values, currentPluralValue, 
// For debugging
originalMessage) {
    // Hot path for straight simple msg translations
    if (els.length === 1 && isLiteralElement(els[0])) {
        return [
            {
                type: PART_TYPE.literal,
                value: els[0].value,
            },
        ];
    }
    var result = [];
    for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
        var el = els_1[_i];
        // Exit early for string parts.
        if (isLiteralElement(el)) {
            result.push({
                type: PART_TYPE.literal,
                value: el.value,
            });
            continue;
        }
        // TODO: should this part be literal type?
        // Replace `#` in plural rules with the actual numeric value.
        if (isPoundElement(el)) {
            if (typeof currentPluralValue === 'number') {
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters.getNumberFormat(locales).format(currentPluralValue),
                });
            }
            continue;
        }
        var varName = el.value;
        // Enforce that all required values are provided by the caller.
        if (!(values && varName in values)) {
            throw new MissingValueError(varName, originalMessage);
        }
        var value = values[varName];
        if (isArgumentElement(el)) {
            if (!value || typeof value === 'string' || typeof value === 'number') {
                value =
                    typeof value === 'string' || typeof value === 'number'
                        ? String(value)
                        : '';
            }
            result.push({
                type: typeof value === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                value: value,
            });
            continue;
        }
        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (isDateElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.date[el.style]
                : isDateTimeSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getDateTimeFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isTimeElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.time[el.style]
                : isDateTimeSkeleton(el.style)
                    ? el.style.parsedOptions
                    : formats.time.medium;
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getDateTimeFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isNumberElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.number[el.style]
                : isNumberSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            if (style && style.scale) {
                value =
                    value *
                        (style.scale || 1);
            }
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getNumberFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isTagElement(el)) {
            var children = el.children, value_1 = el.value;
            var formatFn = values[value_1];
            if (!isFormatXMLElementFn(formatFn)) {
                throw new InvalidValueTypeError(value_1, 'function', originalMessage);
            }
            var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
            var chunks = formatFn(parts.map(function (p) { return p.value; }));
            if (!Array.isArray(chunks)) {
                chunks = [chunks];
            }
            result.push.apply(result, chunks.map(function (c) {
                return {
                    type: typeof c === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                    value: c,
                };
            }));
        }
        if (isSelectElement(el)) {
            var opt = el.options[value] || el.options.other;
            if (!opt) {
                throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
            }
            result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
            continue;
        }
        if (isPluralElement(el)) {
            var opt = el.options["=".concat(value)];
            if (!opt) {
                if (!Intl.PluralRules) {
                    throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
                }
                var rule = formatters
                    .getPluralRules(locales, { type: el.pluralType })
                    .select(value - (el.offset || 0));
                opt = el.options[rule] || el.options.other;
            }
            if (!opt) {
                throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
            }
            result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
            continue;
        }
    }
    return mergeLiteral(result);
}

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
// -- MessageFormat --------------------------------------------------------
function mergeConfig(c1, c2) {
    if (!c2) {
        return c1;
    }
    return __assign(__assign(__assign({}, (c1 || {})), (c2 || {})), Object.keys(c1).reduce(function (all, k) {
        all[k] = __assign(__assign({}, c1[k]), (c2[k] || {}));
        return all;
    }, {}));
}
function mergeConfigs(defaultConfig, configs) {
    if (!configs) {
        return defaultConfig;
    }
    return Object.keys(defaultConfig).reduce(function (all, k) {
        all[k] = mergeConfig(defaultConfig[k], configs[k]);
        return all;
    }, __assign({}, defaultConfig));
}
function createFastMemoizeCache(store) {
    return {
        create: function () {
            return {
                get: function (key) {
                    return store[key];
                },
                set: function (key, value) {
                    store[key] = value;
                },
            };
        },
    };
}
function createDefaultFormatters(cache) {
    if (cache === void 0) { cache = {
        number: {},
        dateTime: {},
        pluralRules: {},
    }; }
    return {
        getNumberFormat: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
        }, {
            cache: createFastMemoizeCache(cache.number),
            strategy: strategies.variadic,
        }),
        getDateTimeFormat: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
        }, {
            cache: createFastMemoizeCache(cache.dateTime),
            strategy: strategies.variadic,
        }),
        getPluralRules: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args, false)))();
        }, {
            cache: createFastMemoizeCache(cache.pluralRules),
            strategy: strategies.variadic,
        }),
    };
}
var IntlMessageFormat = /** @class */ (function () {
    function IntlMessageFormat(message, locales, overrideFormats, opts) {
        var _this = this;
        if (locales === void 0) { locales = IntlMessageFormat.defaultLocale; }
        this.formatterCache = {
            number: {},
            dateTime: {},
            pluralRules: {},
        };
        this.format = function (values) {
            var parts = _this.formatToParts(values);
            // Hot path for straight simple msg translations
            if (parts.length === 1) {
                return parts[0].value;
            }
            var result = parts.reduce(function (all, part) {
                if (!all.length ||
                    part.type !== PART_TYPE.literal ||
                    typeof all[all.length - 1] !== 'string') {
                    all.push(part.value);
                }
                else {
                    all[all.length - 1] += part.value;
                }
                return all;
            }, []);
            if (result.length <= 1) {
                return result[0] || '';
            }
            return result;
        };
        this.formatToParts = function (values) {
            return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, undefined, _this.message);
        };
        this.resolvedOptions = function () { return ({
            locale: _this.resolvedLocale.toString(),
        }); };
        this.getAst = function () { return _this.ast; };
        // Defined first because it's used to build the format pattern.
        this.locales = locales;
        this.resolvedLocale = IntlMessageFormat.resolveLocale(locales);
        if (typeof message === 'string') {
            this.message = message;
            if (!IntlMessageFormat.__parse) {
                throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
            }
            // Parse string messages into an AST.
            this.ast = IntlMessageFormat.__parse(message, {
                ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag,
                locale: this.resolvedLocale,
            });
        }
        else {
            this.ast = message;
        }
        if (!Array.isArray(this.ast)) {
            throw new TypeError('A message must be provided as a String or AST.');
        }
        // Creates a new object with the specified `formats` merged with the default
        // formats.
        this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
        this.formatters =
            (opts && opts.formatters) || createDefaultFormatters(this.formatterCache);
    }
    Object.defineProperty(IntlMessageFormat, "defaultLocale", {
        get: function () {
            if (!IntlMessageFormat.memoizedDefaultLocale) {
                IntlMessageFormat.memoizedDefaultLocale =
                    new Intl.NumberFormat().resolvedOptions().locale;
            }
            return IntlMessageFormat.memoizedDefaultLocale;
        },
        enumerable: false,
        configurable: true
    });
    IntlMessageFormat.memoizedDefaultLocale = null;
    IntlMessageFormat.resolveLocale = function (locales) {
        var supportedLocales = Intl.NumberFormat.supportedLocalesOf(locales);
        if (supportedLocales.length > 0) {
            return new Intl.Locale(supportedLocales[0]);
        }
        return new Intl.Locale(typeof locales === 'string' ? locales : locales[0]);
    };
    IntlMessageFormat.__parse = parse;
    // Default format options used as the prototype of the `formats` provided to the
    // constructor. These are used when constructing the internal Intl.NumberFormat
    // and Intl.DateTimeFormat instances.
    IntlMessageFormat.formats = {
        number: {
            integer: {
                maximumFractionDigits: 0,
            },
            currency: {
                style: 'currency',
            },
            percent: {
                style: 'percent',
            },
        },
        date: {
            short: {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
            },
            medium: {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
            long: {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            },
            full: {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            },
        },
        time: {
            short: {
                hour: 'numeric',
                minute: 'numeric',
            },
            medium: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            },
            long: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short',
            },
            full: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short',
            },
        },
    };
    return IntlMessageFormat;
}());

const i={},r=(e,n,t)=>t?(n in i||(i[n]={}),e in i[n]||(i[n][e]=t),t):t,s=(e,n)=>{if(null==n)return;if(n in i&&e in i[n])return i[n][e];const t=E(n);for(let o=0;o<t.length;o++){const i=c(t[o],e);if(i)return r(e,n,i)}};let l;const a=writable({});function u(e){return e in l}function c(e,n){if(!u(e))return null;const t=function(e){return l[e]||null}(e);return function(e,n){if(null==n)return;if(n in e)return e[n];const t=n.split(".");let o=e;for(let e=0;e<t.length;e++)if("object"==typeof o){if(e>0){const n=t.slice(e,t.length).join(".");if(n in o){o=o[n];break}}o=o[t[e]];}else o=void 0;return o}(t,n)}function m(e,...n){delete i[e],a.update((o=>(o[e]=t.all([o[e]||{},...n]),o)));}derived([a],(([e])=>Object.keys(e)));a.subscribe((e=>l=e));const d={};function g(e){return d[e]}function h(e){return null!=e&&E(e).some((e=>{var n;return null===(n=g(e))||void 0===n?void 0:n.size}))}function w(e,n){const t=Promise.all(n.map((n=>(function(e,n){d[e].delete(n),0===d[e].size&&delete d[e];}(e,n),n().then((e=>e.default||e))))));return t.then((n=>m(e,...n)))}const p={};function b(e){if(!h(e))return e in p?p[e]:Promise.resolve();const n=function(e){return E(e).map((e=>{const n=g(e);return [e,n?[...n]:[]]})).filter((([,e])=>e.length>0))}(e);return p[e]=Promise.all(n.map((([e,n])=>w(e,n)))).then((()=>{if(h(e))return b(e);delete p[e];})),p[e]}function v({locale:e,id:n}){console.warn(`[svelte-i18n] The message "${n}" was not found in "${E(e).join('", "')}".${h(D())?"\n\nNote: there are at least one loader still registered to this locale that wasn't executed.":""}`);}const M={fallbackLocale:null,loadingDelay:200,formats:{number:{scientific:{notation:"scientific"},engineering:{notation:"engineering"},compactLong:{notation:"compact",compactDisplay:"long"},compactShort:{notation:"compact",compactDisplay:"short"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},warnOnMissingMessages:!0,handleMissingMessage:void 0,ignoreTag:!0};function j(){return M}function O(e){const{formats:n,...t}=e,o=e.initialLocale||e.fallbackLocale;return t.warnOnMissingMessages&&(delete t.warnOnMissingMessages,null==t.handleMissingMessage?t.handleMissingMessage=v:console.warn('[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.')),Object.assign(M,t,{initialLocale:o}),n&&("number"in n&&Object.assign(M.formats.number,n.number),"date"in n&&Object.assign(M.formats.date,n.date),"time"in n&&Object.assign(M.formats.time,n.time)),x.set(o)}const $=writable(!1);let k;const T=writable(null);function L(e){return e.split("-").map(((e,n,t)=>t.slice(0,n+1).join("-"))).reverse()}function E(e,n=j().fallbackLocale){const t=L(e);return n?[...new Set([...t,...L(n)])]:t}function D(){return null!=k?k:void 0}T.subscribe((e=>{k=null!=e?e:void 0,"undefined"!=typeof window&&null!=e&&document.documentElement.setAttribute("lang",e);}));const x={...T,set:e=>{if(e&&function(e){if(null==e)return;const n=E(e);for(let e=0;e<n.length;e++){const t=n[e];if(u(t))return t}}(e)&&h(e)){const{loadingDelay:n}=j();let t;return "undefined"!=typeof window&&null!=D()&&n?t=window.setTimeout((()=>$.set(!0)),n):$.set(!0),b(e).then((()=>{T.set(e);})).finally((()=>{clearTimeout(t),$.set(!1);}))}return T.set(e)}},z=()=>"undefined"==typeof window?null:window.navigator.language||window.navigator.languages[0],Z=e=>{const n=Object.create(null);return t=>{const o=JSON.stringify(t);return o in n?n[o]:n[o]=e(t)}},C=(e,n)=>{const{formats:t}=j();if(e in t&&n in t[e])return t[e][n];throw new Error(`[svelte-i18n] Unknown "${n}" ${e} format.`)},G=Z((({locale:e,format:n,...t})=>{if(null==e)throw new Error('[svelte-i18n] A "locale" must be set to format numbers');return n&&(t=C("number",n)),new Intl.NumberFormat(e,t)})),J=Z((({locale:e,format:n,...t})=>{if(null==e)throw new Error('[svelte-i18n] A "locale" must be set to format dates');return n?t=C("date",n):0===Object.keys(t).length&&(t=C("date","short")),new Intl.DateTimeFormat(e,t)})),U=Z((({locale:e,format:n,...t})=>{if(null==e)throw new Error('[svelte-i18n] A "locale" must be set to format time values');return n?t=C("time",n):0===Object.keys(t).length&&(t=C("time","short")),new Intl.DateTimeFormat(e,t)})),V=({locale:e=D(),...n}={})=>G({locale:e,...n}),_=({locale:e=D(),...n}={})=>J({locale:e,...n}),q=({locale:e=D(),...n}={})=>U({locale:e,...n}),B=Z(((e,n=D())=>new IntlMessageFormat(e,n,j().formats,{ignoreTag:j().ignoreTag}))),H=(e,n={})=>{var t,o,i,r;let l=n;"object"==typeof e&&(l=e,e=l.id);const{values:a,locale:u=D(),default:c}=l;if(null==u)throw new Error("[svelte-i18n] Cannot format a message without first setting the initial locale.");let m=s(e,u);if(m){if("string"!=typeof m)return console.warn(`[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof m}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`),m}else m=null!==(r=null!==(i=null===(o=(t=j()).handleMissingMessage)||void 0===o?void 0:o.call(t,{locale:u,id:e,defaultValue:c}))&&void 0!==i?i:c)&&void 0!==r?r:e;if(!a)return m;let f=m;try{f=B(m,u).format(a);}catch(n){n instanceof Error&&console.warn(`[svelte-i18n] Message "${e}" has syntax error:`,n.message);}return f},K=(e,n)=>q(n).format(e),Q=(e,n)=>_(n).format(e),R=(e,n)=>V(n).format(e),W=(e,n=D())=>s(e,n),X=derived([x,a],(()=>H));derived([x],(()=>K));derived([x],(()=>Q));const ne=derived([x],(()=>R));derived([x,a],(()=>W));

const Embed_svelte_svelte_type_style_lang = '';

/* src/Embed.svelte generated by Svelte v4.0.0 */
const file$5 = "src/Embed.svelte";

// (26:1) {#if display && space && info}
function create_if_block$2(ctx) {
	let div;
	let span0;
	let a0;
	let t0;
	let a0_href_value;
	let t1;
	let span1;
	let t2_value = /*$_*/ ctx[8]("common.built_with") + "";
	let t2;
	let t3;
	let a1;
	let t5;
	let t6;
	let span3;
	let t7_value = /*$_*/ ctx[8]("common.hosted_on") + "";
	let t7;
	let t8;
	let a2;
	let span2;
	let img;
	let img_src_value;
	let t9;

	const block = {
		c: function create() {
			div = element("div");
			span0 = element("span");
			a0 = element("a");
			t0 = text(/*space*/ ctx[4]);
			t1 = space();
			span1 = element("span");
			t2 = text(t2_value);
			t3 = space();
			a1 = element("a");
			a1.textContent = "Gradio";
			t5 = text(".");
			t6 = space();
			span3 = element("span");
			t7 = text(t7_value);
			t8 = space();
			a2 = element("a");
			span2 = element("span");
			img = element("img");
			t9 = text(" Spaces");
			attr_dev(a0, "href", a0_href_value = "https://huggingface.co/spaces/" + /*space*/ ctx[4]);
			attr_dev(a0, "class", "title s-9-x1SmbJ51CM");
			add_location(a0, file$5, 30, 4, 668);
			attr_dev(span0, "class", "s-9-x1SmbJ51CM");
			add_location(span0, file$5, 29, 3, 657);
			attr_dev(a1, "class", "gradio s-9-x1SmbJ51CM");
			attr_dev(a1, "href", "https://gradio.app");
			add_location(a1, file$5, 35, 4, 802);
			attr_dev(span1, "class", "s-9-x1SmbJ51CM");
			add_location(span1, file$5, 33, 3, 761);
			if (!src_url_equal(img.src, img_src_value = space_logo)) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", `Hugging Face Space }`);
			attr_dev(img, "class", "s-9-x1SmbJ51CM");
			add_location(img, file$5, 41, 6, 1001);
			attr_dev(span2, "class", "space-logo s-9-x1SmbJ51CM");
			add_location(span2, file$5, 40, 6, 969);
			attr_dev(a2, "class", "hf s-9-x1SmbJ51CM");
			attr_dev(a2, "href", "https://huggingface.co/spaces");
			add_location(a2, file$5, 39, 4, 912);
			attr_dev(span3, "class", "s-9-x1SmbJ51CM");
			add_location(span3, file$5, 37, 3, 872);
			attr_dev(div, "class", "info s-9-x1SmbJ51CM");
			add_location(div, file$5, 28, 2, 635);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, span0);
			append_dev(span0, a0);
			append_dev(a0, t0);
			append_dev(div, t1);
			append_dev(div, span1);
			append_dev(span1, t2);
			append_dev(span1, t3);
			append_dev(span1, a1);
			append_dev(span1, t5);
			append_dev(div, t6);
			append_dev(div, span3);
			append_dev(span3, t7);
			append_dev(span3, t8);
			append_dev(span3, a2);
			append_dev(a2, span2);
			append_dev(span2, img);
			append_dev(a2, t9);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*space*/ 16) set_data_dev(t0, /*space*/ ctx[4]);

			if (dirty & /*space*/ 16 && a0_href_value !== (a0_href_value = "https://huggingface.co/spaces/" + /*space*/ ctx[4])) {
				attr_dev(a0, "href", a0_href_value);
			}

			if (dirty & /*$_*/ 256 && t2_value !== (t2_value = /*$_*/ ctx[8]("common.built_with") + "")) set_data_dev(t2, t2_value);
			if (dirty & /*$_*/ 256 && t7_value !== (t7_value = /*$_*/ ctx[8]("common.hosted_on") + "")) set_data_dev(t7, t7_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(26:1) {#if display && space && info}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let div1;
	let div0;
	let t;
	let div1_class_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[10].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
	let if_block = /*display*/ ctx[5] && /*space*/ ctx[4] && /*info*/ ctx[6] && create_if_block$2(ctx);

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			if (default_slot) default_slot.c();
			t = space();
			if (if_block) if_block.c();
			attr_dev(div0, "class", "main s-9-x1SmbJ51CM");
			add_location(div0, file$5, 24, 1, 563);
			attr_dev(div1, "class", div1_class_value = "gradio-container gradio-container-" + /*version*/ ctx[1] + " s-9-x1SmbJ51CM");
			attr_dev(div1, "data-iframe-height", "");
			toggle_class(div1, "app", !/*display*/ ctx[5] && !/*is_embed*/ ctx[3]);
			toggle_class(div1, "embed-container", /*display*/ ctx[5]);
			toggle_class(div1, "with-info", /*info*/ ctx[6]);

			set_style(div1, "min-height", /*loaded*/ ctx[7]
			? "initial"
			: /*initial_height*/ ctx[2]);

			set_style(div1, "flex-grow", !/*display*/ ctx[5] ? "1" : "auto");
			add_location(div1, file$5, 14, 0, 270);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			append_dev(div1, t);
			if (if_block) if_block.m(div1, null);
			/*div1_binding*/ ctx[11](div1);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[9],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
						null
					);
				}
			}

			if (/*display*/ ctx[5] && /*space*/ ctx[4] && /*info*/ ctx[6]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (!current || dirty & /*version*/ 2 && div1_class_value !== (div1_class_value = "gradio-container gradio-container-" + /*version*/ ctx[1] + " s-9-x1SmbJ51CM")) {
				attr_dev(div1, "class", div1_class_value);
			}

			if (!current || dirty & /*version, display, is_embed*/ 42) {
				toggle_class(div1, "app", !/*display*/ ctx[5] && !/*is_embed*/ ctx[3]);
			}

			if (!current || dirty & /*version, display*/ 34) {
				toggle_class(div1, "embed-container", /*display*/ ctx[5]);
			}

			if (!current || dirty & /*version, info*/ 66) {
				toggle_class(div1, "with-info", /*info*/ ctx[6]);
			}

			if (dirty & /*loaded, initial_height*/ 132) {
				set_style(div1, "min-height", /*loaded*/ ctx[7]
				? "initial"
				: /*initial_height*/ ctx[2]);
			}

			if (dirty & /*display*/ 32) {
				set_style(div1, "flex-grow", !/*display*/ ctx[5] ? "1" : "auto");
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div1);
			}

			if (default_slot) default_slot.d(detaching);
			if (if_block) if_block.d();
			/*div1_binding*/ ctx[11](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let $_;
	validate_store(X, '_');
	component_subscribe($$self, X, $$value => $$invalidate(8, $_ = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Embed', slots, ['default']);
	let { wrapper } = $$props;
	let { version } = $$props;
	let { initial_height } = $$props;
	let { is_embed } = $$props;
	let { space } = $$props;
	let { display } = $$props;
	let { info } = $$props;
	let { loaded } = $$props;

	$$self.$$.on_mount.push(function () {
		if (wrapper === undefined && !('wrapper' in $$props || $$self.$$.bound[$$self.$$.props['wrapper']])) {
			console.warn("<Embed> was created without expected prop 'wrapper'");
		}

		if (version === undefined && !('version' in $$props || $$self.$$.bound[$$self.$$.props['version']])) {
			console.warn("<Embed> was created without expected prop 'version'");
		}

		if (initial_height === undefined && !('initial_height' in $$props || $$self.$$.bound[$$self.$$.props['initial_height']])) {
			console.warn("<Embed> was created without expected prop 'initial_height'");
		}

		if (is_embed === undefined && !('is_embed' in $$props || $$self.$$.bound[$$self.$$.props['is_embed']])) {
			console.warn("<Embed> was created without expected prop 'is_embed'");
		}

		if (space === undefined && !('space' in $$props || $$self.$$.bound[$$self.$$.props['space']])) {
			console.warn("<Embed> was created without expected prop 'space'");
		}

		if (display === undefined && !('display' in $$props || $$self.$$.bound[$$self.$$.props['display']])) {
			console.warn("<Embed> was created without expected prop 'display'");
		}

		if (info === undefined && !('info' in $$props || $$self.$$.bound[$$self.$$.props['info']])) {
			console.warn("<Embed> was created without expected prop 'info'");
		}

		if (loaded === undefined && !('loaded' in $$props || $$self.$$.bound[$$self.$$.props['loaded']])) {
			console.warn("<Embed> was created without expected prop 'loaded'");
		}
	});

	const writable_props = [
		'wrapper',
		'version',
		'initial_height',
		'is_embed',
		'space',
		'display',
		'info',
		'loaded'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Embed> was created with unknown prop '${key}'`);
	});

	function div1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			wrapper = $$value;
			$$invalidate(0, wrapper);
		});
	}

	$$self.$$set = $$props => {
		if ('wrapper' in $$props) $$invalidate(0, wrapper = $$props.wrapper);
		if ('version' in $$props) $$invalidate(1, version = $$props.version);
		if ('initial_height' in $$props) $$invalidate(2, initial_height = $$props.initial_height);
		if ('is_embed' in $$props) $$invalidate(3, is_embed = $$props.is_embed);
		if ('space' in $$props) $$invalidate(4, space = $$props.space);
		if ('display' in $$props) $$invalidate(5, display = $$props.display);
		if ('info' in $$props) $$invalidate(6, info = $$props.info);
		if ('loaded' in $$props) $$invalidate(7, loaded = $$props.loaded);
		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		space_logo,
		_: X,
		wrapper,
		version,
		initial_height,
		is_embed,
		space,
		display,
		info,
		loaded,
		$_
	});

	$$self.$inject_state = $$props => {
		if ('wrapper' in $$props) $$invalidate(0, wrapper = $$props.wrapper);
		if ('version' in $$props) $$invalidate(1, version = $$props.version);
		if ('initial_height' in $$props) $$invalidate(2, initial_height = $$props.initial_height);
		if ('is_embed' in $$props) $$invalidate(3, is_embed = $$props.is_embed);
		if ('space' in $$props) $$invalidate(4, space = $$props.space);
		if ('display' in $$props) $$invalidate(5, display = $$props.display);
		if ('info' in $$props) $$invalidate(6, info = $$props.info);
		if ('loaded' in $$props) $$invalidate(7, loaded = $$props.loaded);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		wrapper,
		version,
		initial_height,
		is_embed,
		space,
		display,
		info,
		loaded,
		$_,
		$$scope,
		slots,
		div1_binding
	];
}

class Embed extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$3, create_fragment$3, safe_not_equal$1, {
			wrapper: 0,
			version: 1,
			initial_height: 2,
			is_embed: 3,
			space: 4,
			display: 5,
			info: 6,
			loaded: 7
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Embed",
			options,
			id: create_fragment$3.name
		});
	}

	get wrapper() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set wrapper(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get version() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set version(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get initial_height() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set initial_height(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get is_embed() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set is_embed(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get space() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set space(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get display() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set display(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get info() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set info(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get loaded() {
		throw new Error("<Embed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set loaded(value) {
		throw new Error("<Embed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function pretty_si(num) {
  let units = ["", "k", "M", "G", "T", "P", "E", "Z"];
  let i = 0;
  while (num > 1e3 && i < units.length - 1) {
    num /= 1e3;
    i++;
  }
  let unit = units[i];
  return (Number.isInteger(num) ? num : num.toFixed(1)) + unit;
}

/**
 * @param {any} obj
 * @returns {boolean}
 */
function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}

/**
 * @template T
 * @param {import('./private.js').TickContext<T>} ctx
 * @param {T} last_value
 * @param {T} current_value
 * @param {T} target_value
 * @returns {T}
 */
function tick_spring(ctx, last_value, current_value, target_value) {
	if (typeof current_value === 'number' || is_date(current_value)) {
		// @ts-ignore
		const delta = target_value - current_value;
		// @ts-ignore
		const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
		const spring = ctx.opts.stiffness * delta;
		const damper = ctx.opts.damping * velocity;
		const acceleration = (spring - damper) * ctx.inv_mass;
		const d = (velocity + acceleration) * ctx.dt;
		if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
			return target_value; // settled
		} else {
			ctx.settled = false; // signal loop to keep ticking
			// @ts-ignore
			return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
		}
	} else if (Array.isArray(current_value)) {
		// @ts-ignore
		return current_value.map((_, i) =>
			tick_spring(ctx, last_value[i], current_value[i], target_value[i])
		);
	} else if (typeof current_value === 'object') {
		const next_value = {};
		for (const k in current_value) {
			// @ts-ignore
			next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
		}
		// @ts-ignore
		return next_value;
	} else {
		throw new Error(`Cannot spring ${typeof current_value} values`);
	}
}

/**
 * The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
 *
 * https://svelte.dev/docs/svelte-motion#spring
 * @template [T=any]
 * @param {T} [value]
 * @param {import('./private.js').SpringOpts} [opts]
 * @returns {import('./public.js').Spring<T>}
 */
function spring(value, opts = {}) {
	const store = writable(value);
	const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
	/** @type {number} */
	let last_time;
	/** @type {import('../internal/private.js').Task} */
	let task;
	/** @type {object} */
	let current_token;
	/** @type {T} */
	let last_value = value;
	/** @type {T} */
	let target_value = value;
	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;
	/**
	 * @param {T} new_value
	 * @param {import('./private.js').SpringUpdateOpts} opts
	 * @returns {Promise<void>}
	 */
	function set(new_value, opts = {}) {
		target_value = new_value;
		const token = (current_token = {});
		if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
			cancel_task = true; // cancel any running animation
			last_time = now();
			last_value = new_value;
			store.set((value = target_value));
			return Promise.resolve();
		} else if (opts.soft) {
			const rate = opts.soft === true ? 0.5 : +opts.soft;
			inv_mass_recovery_rate = 1 / (rate * 60);
			inv_mass = 0; // infinite mass, unaffected by spring forces
		}
		if (!task) {
			last_time = now();
			cancel_task = false;
			task = loop((now) => {
				if (cancel_task) {
					cancel_task = false;
					task = null;
					return false;
				}
				inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
				const ctx = {
					inv_mass,
					opts: spring,
					settled: true,
					dt: ((now - last_time) * 60) / 1000
				};
				const next_value = tick_spring(ctx, last_value, value, target_value);
				last_time = now;
				last_value = value;
				store.set((value = next_value));
				if (ctx.settled) {
					task = null;
				}
				return !ctx.settled;
			});
		}
		return new Promise((fulfil) => {
			task.promise.then(() => {
				if (token === current_token) fulfil();
			});
		});
	}
	/** @type {import('./public.js').Spring<T>} */
	const spring = {
		set,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe,
		stiffness,
		damping,
		precision
	};
	return spring;
}

const Loader_svelte_svelte_type_style_lang = '';

/* Users/peterallen/Projects/gradio/js/statustracker/static/Loader.svelte generated by Svelte v4.0.0 */
const file$4 = "Users/peterallen/Projects/gradio/js/statustracker/static/Loader.svelte";

function create_fragment$2(ctx) {
	let div;
	let svg;
	let g0;
	let path0;
	let path1;
	let path2;
	let path3;
	let g1;
	let path4;
	let path5;
	let path6;
	let path7;

	const block = {
		c: function create() {
			div = element("div");
			svg = svg_element("svg");
			g0 = svg_element("g");
			path0 = svg_element("path");
			path1 = svg_element("path");
			path2 = svg_element("path");
			path3 = svg_element("path");
			g1 = svg_element("g");
			path4 = svg_element("path");
			path5 = svg_element("path");
			path6 = svg_element("path");
			path7 = svg_element("path");
			attr_dev(path0, "d", "M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z");
			attr_dev(path0, "fill", "#FF7C00");
			attr_dev(path0, "fill-opacity", "0.4");
			attr_dev(path0, "class", "s-EYosdrwtfsnR");
			add_location(path0, file$4, 42, 3, 952);
			attr_dev(path1, "d", "M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z");
			attr_dev(path1, "fill", "#FF7C00");
			attr_dev(path1, "class", "s-EYosdrwtfsnR");
			add_location(path1, file$4, 47, 3, 1085);
			attr_dev(path2, "d", "M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z");
			attr_dev(path2, "fill", "#FF7C00");
			attr_dev(path2, "fill-opacity", "0.4");
			attr_dev(path2, "class", "s-EYosdrwtfsnR");
			add_location(path2, file$4, 51, 3, 1190);
			attr_dev(path3, "d", "M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z");
			attr_dev(path3, "fill", "#FF7C00");
			attr_dev(path3, "class", "s-EYosdrwtfsnR");
			add_location(path3, file$4, 56, 3, 1322);
			set_style(g0, "transform", "translate(" + /*$top*/ ctx[1][0] + "px, " + /*$top*/ ctx[1][1] + "px)");
			add_location(g0, file$4, 41, 2, 889);
			attr_dev(path4, "d", "M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z");
			attr_dev(path4, "fill", "#FF7C00");
			attr_dev(path4, "fill-opacity", "0.4");
			attr_dev(path4, "class", "s-EYosdrwtfsnR");
			add_location(path4, file$4, 62, 3, 1507);
			attr_dev(path5, "d", "M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z");
			attr_dev(path5, "fill", "#FF7C00");
			attr_dev(path5, "class", "s-EYosdrwtfsnR");
			add_location(path5, file$4, 67, 3, 1634);
			attr_dev(path6, "d", "M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z");
			attr_dev(path6, "fill", "#FF7C00");
			attr_dev(path6, "fill-opacity", "0.4");
			attr_dev(path6, "class", "s-EYosdrwtfsnR");
			add_location(path6, file$4, 71, 3, 1740);
			attr_dev(path7, "d", "M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z");
			attr_dev(path7, "fill", "#FF7C00");
			attr_dev(path7, "class", "s-EYosdrwtfsnR");
			add_location(path7, file$4, 76, 3, 1869);
			set_style(g1, "transform", "translate(" + /*$bottom*/ ctx[2][0] + "px, " + /*$bottom*/ ctx[2][1] + "px)");
			add_location(g1, file$4, 61, 2, 1438);
			attr_dev(svg, "viewBox", "-1200 -1200 3000 3000");
			attr_dev(svg, "fill", "none");
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "class", "s-EYosdrwtfsnR");
			add_location(svg, file$4, 36, 1, 794);
			attr_dev(div, "class", "s-EYosdrwtfsnR");
			toggle_class(div, "margin", /*margin*/ ctx[0]);
			add_location(div, file$4, 35, 0, 774);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, svg);
			append_dev(svg, g0);
			append_dev(g0, path0);
			append_dev(g0, path1);
			append_dev(g0, path2);
			append_dev(g0, path3);
			append_dev(svg, g1);
			append_dev(g1, path4);
			append_dev(g1, path5);
			append_dev(g1, path6);
			append_dev(g1, path7);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*$top*/ 2) {
				set_style(g0, "transform", "translate(" + /*$top*/ ctx[1][0] + "px, " + /*$top*/ ctx[1][1] + "px)");
			}

			if (dirty & /*$bottom*/ 4) {
				set_style(g1, "transform", "translate(" + /*$bottom*/ ctx[2][0] + "px, " + /*$bottom*/ ctx[2][1] + "px)");
			}

			if (dirty & /*margin*/ 1) {
				toggle_class(div, "margin", /*margin*/ ctx[0]);
			}
		},
		i: noop$1,
		o: noop$1,
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let $top;
	let $bottom;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Loader', slots, []);
	let { margin = true } = $$props;
	const top = spring([0, 0]);
	validate_store(top, 'top');
	component_subscribe($$self, top, value => $$invalidate(1, $top = value));
	const bottom = spring([0, 0]);
	validate_store(bottom, 'bottom');
	component_subscribe($$self, bottom, value => $$invalidate(2, $bottom = value));
	let dismounted;

	async function animate() {
		await Promise.all([top.set([125, 140]), bottom.set([-125, -140])]);
		await Promise.all([top.set([-125, 140]), bottom.set([125, -140])]);
		await Promise.all([top.set([-125, 0]), bottom.set([125, -0])]);
		await Promise.all([top.set([125, 0]), bottom.set([-125, 0])]);
	}

	async function run() {
		await animate();
		if (!dismounted) run();
	}

	async function loading() {
		await Promise.all([top.set([125, 0]), bottom.set([-125, 0])]);
		run();
	}

	onMount(() => {
		loading();
		return () => dismounted = true;
	});

	const writable_props = ['margin'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('margin' in $$props) $$invalidate(0, margin = $$props.margin);
	};

	$$self.$capture_state = () => ({
		onMount,
		spring,
		margin,
		top,
		bottom,
		dismounted,
		animate,
		run,
		loading,
		$top,
		$bottom
	});

	$$self.$inject_state = $$props => {
		if ('margin' in $$props) $$invalidate(0, margin = $$props.margin);
		if ('dismounted' in $$props) dismounted = $$props.dismounted;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [margin, $top, $bottom, top, bottom];
}

class Loader extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal$1, { margin: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Loader",
			options,
			id: create_fragment$2.name
		});
	}

	get margin() {
		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set margin(value) {
		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const index_svelte_svelte_type_style_lang = '';

/* Users/peterallen/Projects/gradio/js/statustracker/static/index.svelte generated by Svelte v4.0.0 */
const file$3 = "Users/peterallen/Projects/gradio/js/statustracker/static/index.svelte";
const get_error_slot_changes = dirty => ({});
const get_error_slot_context = ctx => ({});

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[39] = list[i];
	child_ctx[41] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[39] = list[i];
	return child_ctx;
}

// (249:30) 
function create_if_block_17(ctx) {
	let span;
	let t0_value = /*i18n*/ ctx[1]("common.error") + "";
	let t0;
	let t1;
	let current;
	const error_slot_template = /*#slots*/ ctx[29].error;
	const error_slot = create_slot(error_slot_template, ctx, /*$$scope*/ ctx[28], get_error_slot_context);

	const block = {
		c: function create() {
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			if (error_slot) error_slot.c();
			attr_dev(span, "class", "error s-sk0WkR14YHPf");
			add_location(span, file$3, 272, 2, 6302);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t0);
			insert_dev(target, t1, anchor);

			if (error_slot) {
				error_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if ((!current || dirty[0] & /*i18n*/ 2) && t0_value !== (t0_value = /*i18n*/ ctx[1]("common.error") + "")) set_data_dev(t0, t0_value);

			if (error_slot) {
				if (error_slot.p && (!current || dirty[0] & /*$$scope*/ 268435456)) {
					update_slot_base(
						error_slot,
						error_slot_template,
						ctx,
						/*$$scope*/ ctx[28],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[28])
						: get_slot_changes(error_slot_template, /*$$scope*/ ctx[28], dirty, get_error_slot_changes),
						get_error_slot_context
					);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(error_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(error_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(span);
				detach_dev(t1);
			}

			if (error_slot) error_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_17.name,
		type: "if",
		source: "(249:30) ",
		ctx
	});

	return block;
}

// (177:1) {#if status === "pending"}
function create_if_block$1(ctx) {
	let t0;
	let div;
	let t1;
	let t2;
	let current_block_type_index;
	let if_block3;
	let t3;
	let if_block4_anchor;
	let current;
	let if_block0 = /*variant*/ ctx[8] === "default" && /*show_eta_bar*/ ctx[18] && /*show_progress*/ ctx[6] === "full" && create_if_block_16(ctx);

	function select_block_type_1(ctx, dirty) {
		if (/*progress*/ ctx[7]) return create_if_block_11;
		if (/*queue_position*/ ctx[2] !== null && /*queue_size*/ ctx[3] !== undefined && /*queue_position*/ ctx[2] >= 0) return create_if_block_14;
		if (/*queue_position*/ ctx[2] === 0) return create_if_block_15;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block1 = current_block_type && current_block_type(ctx);
	let if_block2 = /*timer*/ ctx[5] && create_if_block_10(ctx);
	const if_block_creators = [create_if_block_2$1, create_if_block_9];
	const if_blocks = [];

	function select_block_type_3(ctx, dirty) {
		if (/*last_progress_level*/ ctx[15] != null) return 0;
		if (/*show_progress*/ ctx[6] === "full") return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type_3(ctx))) {
		if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	let if_block4 = !/*timer*/ ctx[5] && create_if_block_1$1(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t0 = space();
			div = element("div");
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			t3 = space();
			if (if_block4) if_block4.c();
			if_block4_anchor = empty();
			attr_dev(div, "class", "progress-text s-sk0WkR14YHPf");
			toggle_class(div, "meta-text-center", /*variant*/ ctx[8] === "center");
			toggle_class(div, "meta-text", /*variant*/ ctx[8] === "default");
			add_location(div, file$3, 206, 2, 4643);
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t0, anchor);
			insert_dev(target, div, anchor);
			if (if_block1) if_block1.m(div, null);
			append_dev(div, t1);
			if (if_block2) if_block2.m(div, null);
			insert_dev(target, t2, anchor);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert_dev(target, t3, anchor);
			if (if_block4) if_block4.m(target, anchor);
			insert_dev(target, if_block4_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*variant*/ ctx[8] === "default" && /*show_eta_bar*/ ctx[18] && /*show_progress*/ ctx[6] === "full") {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_16(ctx);
					if_block0.c();
					if_block0.m(t0.parentNode, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if (if_block1) if_block1.d(1);
				if_block1 = current_block_type && current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div, t1);
				}
			}

			if (/*timer*/ ctx[5]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_10(ctx);
					if_block2.c();
					if_block2.m(div, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (!current || dirty[0] & /*variant*/ 256) {
				toggle_class(div, "meta-text-center", /*variant*/ ctx[8] === "center");
			}

			if (!current || dirty[0] & /*variant*/ 256) {
				toggle_class(div, "meta-text", /*variant*/ ctx[8] === "default");
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_3(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block3) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block3 = if_blocks[current_block_type_index];

					if (!if_block3) {
						if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block3.c();
					} else {
						if_block3.p(ctx, dirty);
					}

					transition_in(if_block3, 1);
					if_block3.m(t3.parentNode, t3);
				} else {
					if_block3 = null;
				}
			}

			if (!/*timer*/ ctx[5]) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_1$1(ctx);
					if_block4.c();
					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block3);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block3);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(div);
				detach_dev(t2);
				detach_dev(t3);
				detach_dev(if_block4_anchor);
			}

			if (if_block0) if_block0.d(detaching);

			if (if_block1) {
				if_block1.d();
			}

			if (if_block2) if_block2.d();

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (if_block4) if_block4.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(177:1) {#if status === \\\"pending\\\"}",
		ctx
	});

	return block;
}

// (178:2) {#if variant === "default" && show_eta_bar && show_progress === "full"}
function create_if_block_16(ctx) {
	let div;
	let style_transform = `translateX(${(/*eta_level*/ ctx[17] || 0) * 100 - 100}%)`;

	const block = {
		c: function create() {
			div = element("div");
			attr_dev(div, "class", "eta-bar s-sk0WkR14YHPf");
			set_style(div, "transform", style_transform);
			add_location(div, file$3, 201, 3, 4536);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*eta_level*/ 131072 && style_transform !== (style_transform = `translateX(${(/*eta_level*/ ctx[17] || 0) * 100 - 100}%)`)) {
				set_style(div, "transform", style_transform);
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_16.name,
		type: "if",
		source: "(178:2) {#if variant === \\\"default\\\" && show_eta_bar && show_progress === \\\"full\\\"}",
		ctx
	});

	return block;
}

// (202:34) 
function create_if_block_15(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("processing |");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: noop$1,
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_15.name,
		type: "if",
		source: "(202:34) ",
		ctx
	});

	return block;
}

// (200:88) 
function create_if_block_14(ctx) {
	let t0;
	let t1_value = /*queue_position*/ ctx[2] + 1 + "";
	let t1;
	let t2;
	let t3;
	let t4;

	const block = {
		c: function create() {
			t0 = text("queue: ");
			t1 = text(t1_value);
			t2 = text("/");
			t3 = text(/*queue_size*/ ctx[3]);
			t4 = text(" |");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, t2, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, t4, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*queue_position*/ 4 && t1_value !== (t1_value = /*queue_position*/ ctx[2] + 1 + "")) set_data_dev(t1, t1_value);
			if (dirty[0] & /*queue_size*/ 8) set_data_dev(t3, /*queue_size*/ ctx[3]);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(t1);
				detach_dev(t2);
				detach_dev(t3);
				detach_dev(t4);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_14.name,
		type: "if",
		source: "(200:88) ",
		ctx
	});

	return block;
}

// (189:3) {#if progress}
function create_if_block_11(ctx) {
	let each_1_anchor;
	let each_value_1 = ensure_array_like_dev(/*progress*/ ctx[7]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*progress*/ 128) {
				each_value_1 = ensure_array_like_dev(/*progress*/ ctx[7]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(each_1_anchor);
			}

			destroy_each(each_blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_11.name,
		type: "if",
		source: "(189:3) {#if progress}",
		ctx
	});

	return block;
}

// (191:5) {#if p.index != null}
function create_if_block_12(ctx) {
	let t0;
	let t1_value = /*p*/ ctx[39].unit + "";
	let t1;
	let t2;
	let t3_value = " " + "";
	let t3;

	function select_block_type_2(ctx, dirty) {
		if (/*p*/ ctx[39].length != null) return create_if_block_13;
		return create_else_block$1;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			if_block.c();
			t0 = space();
			t1 = text(t1_value);
			t2 = text(" | ");
			t3 = text(t3_value);
		},
		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, t2, anchor);
			insert_dev(target, t3, anchor);
		},
		p: function update(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(t0.parentNode, t0);
				}
			}

			if (dirty[0] & /*progress*/ 128 && t1_value !== (t1_value = /*p*/ ctx[39].unit + "")) set_data_dev(t1, t1_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(t1);
				detach_dev(t2);
				detach_dev(t3);
			}

			if_block.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_12.name,
		type: "if",
		source: "(191:5) {#if p.index != null}",
		ctx
	});

	return block;
}

// (194:6) {:else}
function create_else_block$1(ctx) {
	let t_value = pretty_si(/*p*/ ctx[39].index || 0) + "";
	let t;

	const block = {
		c: function create() {
			t = text(t_value);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*progress*/ 128 && t_value !== (t_value = pretty_si(/*p*/ ctx[39].index || 0) + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$1.name,
		type: "else",
		source: "(194:6) {:else}",
		ctx
	});

	return block;
}

// (192:6) {#if p.length != null}
function create_if_block_13(ctx) {
	let t0_value = pretty_si(/*p*/ ctx[39].index || 0) + "";
	let t0;
	let t1;
	let t2_value = pretty_si(/*p*/ ctx[39].length) + "";
	let t2;

	const block = {
		c: function create() {
			t0 = text(t0_value);
			t1 = text("/");
			t2 = text(t2_value);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, t2, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*progress*/ 128 && t0_value !== (t0_value = pretty_si(/*p*/ ctx[39].index || 0) + "")) set_data_dev(t0, t0_value);
			if (dirty[0] & /*progress*/ 128 && t2_value !== (t2_value = pretty_si(/*p*/ ctx[39].length) + "")) set_data_dev(t2, t2_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(t1);
				detach_dev(t2);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_13.name,
		type: "if",
		source: "(192:6) {#if p.length != null}",
		ctx
	});

	return block;
}

// (190:4) {#each progress as p}
function create_each_block_1(ctx) {
	let if_block_anchor;
	let if_block = /*p*/ ctx[39].index != null && create_if_block_12(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (/*p*/ ctx[39].index != null) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_12(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(if_block_anchor);
			}

			if (if_block) if_block.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(190:4) {#each progress as p}",
		ctx
	});

	return block;
}

// (206:3) {#if timer}
function create_if_block_10(ctx) {
	let t0;
	let t1_value = (/*eta*/ ctx[0] ? `/${/*formatted_eta*/ ctx[19]}` : "") + "";
	let t1;
	let t2;

	const block = {
		c: function create() {
			t0 = text(/*formatted_timer*/ ctx[20]);
			t1 = text(t1_value);
			t2 = text("s");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, t2, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*formatted_timer*/ 1048576) set_data_dev(t0, /*formatted_timer*/ ctx[20]);
			if (dirty[0] & /*eta, formatted_eta*/ 524289 && t1_value !== (t1_value = (/*eta*/ ctx[0] ? `/${/*formatted_eta*/ ctx[19]}` : "") + "")) set_data_dev(t1, t1_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(t1);
				detach_dev(t2);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_10.name,
		type: "if",
		source: "(206:3) {#if timer}",
		ctx
	});

	return block;
}

// (242:37) 
function create_if_block_9(ctx) {
	let loader;
	let current;

	loader = new Loader({
			props: { margin: /*variant*/ ctx[8] === "default" },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(loader.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(loader, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const loader_changes = {};
			if (dirty[0] & /*variant*/ 256) loader_changes.margin = /*variant*/ ctx[8] === "default";
			loader.$set(loader_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loader.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loader.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(loader, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_9.name,
		type: "if",
		source: "(242:37) ",
		ctx
	});

	return block;
}

// (211:2) {#if last_progress_level != null}
function create_if_block_2$1(ctx) {
	let div3;
	let div0;
	let t;
	let div2;
	let div1;
	let style_width = `${/*last_progress_level*/ ctx[15] * 100}%`;
	let if_block = /*progress*/ ctx[7] != null && create_if_block_3$1(ctx);

	const block = {
		c: function create() {
			div3 = element("div");
			div0 = element("div");
			if (if_block) if_block.c();
			t = space();
			div2 = element("div");
			div1 = element("div");
			attr_dev(div0, "class", "progress-level-inner s-sk0WkR14YHPf");
			add_location(div0, file$3, 235, 4, 5388);
			attr_dev(div1, "class", "progress-bar s-sk0WkR14YHPf");
			set_style(div1, "width", style_width);
			add_location(div1, file$3, 257, 5, 5972);
			attr_dev(div2, "class", "progress-bar-wrap s-sk0WkR14YHPf");
			add_location(div2, file$3, 256, 4, 5935);
			attr_dev(div3, "class", "progress-level s-sk0WkR14YHPf");
			add_location(div3, file$3, 234, 3, 5355);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div0);
			if (if_block) if_block.m(div0, null);
			append_dev(div3, t);
			append_dev(div3, div2);
			append_dev(div2, div1);
			/*div1_binding*/ ctx[30](div1);
		},
		p: function update(ctx, dirty) {
			if (/*progress*/ ctx[7] != null) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_3$1(ctx);
					if_block.c();
					if_block.m(div0, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty[0] & /*last_progress_level*/ 32768 && style_width !== (style_width = `${/*last_progress_level*/ ctx[15] * 100}%`)) {
				set_style(div1, "width", style_width);
			}
		},
		i: noop$1,
		o: noop$1,
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div3);
			}

			if (if_block) if_block.d();
			/*div1_binding*/ ctx[30](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$1.name,
		type: "if",
		source: "(211:2) {#if last_progress_level != null}",
		ctx
	});

	return block;
}

// (214:5) {#if progress != null}
function create_if_block_3$1(ctx) {
	let each_1_anchor;
	let each_value = ensure_array_like_dev(/*progress*/ ctx[7]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*progress_level, progress*/ 16512) {
				each_value = ensure_array_like_dev(/*progress*/ ctx[7]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(each_1_anchor);
			}

			destroy_each(each_blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$1.name,
		type: "if",
		source: "(214:5) {#if progress != null}",
		ctx
	});

	return block;
}

// (216:7) {#if p.desc != null || (progress_level && progress_level[i] != null)}
function create_if_block_4(ctx) {
	let t0;
	let t1;
	let t2;
	let if_block3_anchor;
	let if_block0 = /*i*/ ctx[41] !== 0 && create_if_block_8(ctx);
	let if_block1 = /*p*/ ctx[39].desc != null && create_if_block_7(ctx);
	let if_block2 = /*p*/ ctx[39].desc != null && /*progress_level*/ ctx[14] && /*progress_level*/ ctx[14][/*i*/ ctx[41]] != null && create_if_block_6(ctx);
	let if_block3 = /*progress_level*/ ctx[14] != null && create_if_block_5(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			if_block3_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t0, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert_dev(target, t1, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert_dev(target, t2, anchor);
			if (if_block3) if_block3.m(target, anchor);
			insert_dev(target, if_block3_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (/*p*/ ctx[39].desc != null) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_7(ctx);
					if_block1.c();
					if_block1.m(t1.parentNode, t1);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*p*/ ctx[39].desc != null && /*progress_level*/ ctx[14] && /*progress_level*/ ctx[14][/*i*/ ctx[41]] != null) {
				if (if_block2) ; else {
					if_block2 = create_if_block_6(ctx);
					if_block2.c();
					if_block2.m(t2.parentNode, t2);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*progress_level*/ ctx[14] != null) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_5(ctx);
					if_block3.c();
					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(t1);
				detach_dev(t2);
				detach_dev(if_block3_anchor);
			}

			if (if_block0) if_block0.d(detaching);
			if (if_block1) if_block1.d(detaching);
			if (if_block2) if_block2.d(detaching);
			if (if_block3) if_block3.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4.name,
		type: "if",
		source: "(216:7) {#if p.desc != null || (progress_level && progress_level[i] != null)}",
		ctx
	});

	return block;
}

// (217:8) {#if i !== 0}
function create_if_block_8(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text(" /");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_8.name,
		type: "if",
		source: "(217:8) {#if i !== 0}",
		ctx
	});

	return block;
}

// (220:8) {#if p.desc != null}
function create_if_block_7(ctx) {
	let t_value = /*p*/ ctx[39].desc + "";
	let t;

	const block = {
		c: function create() {
			t = text(t_value);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*progress*/ 128 && t_value !== (t_value = /*p*/ ctx[39].desc + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_7.name,
		type: "if",
		source: "(220:8) {#if p.desc != null}",
		ctx
	});

	return block;
}

// (223:8) {#if p.desc != null && progress_level && progress_level[i] != null}
function create_if_block_6(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("-");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_6.name,
		type: "if",
		source: "(223:8) {#if p.desc != null && progress_level && progress_level[i] != null}",
		ctx
	});

	return block;
}

// (226:8) {#if progress_level != null}
function create_if_block_5(ctx) {
	let t0_value = (100 * (/*progress_level*/ ctx[14][/*i*/ ctx[41]] || 0)).toFixed(1) + "";
	let t0;
	let t1;

	const block = {
		c: function create() {
			t0 = text(t0_value);
			t1 = text("%");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*progress_level*/ 16384 && t0_value !== (t0_value = (100 * (/*progress_level*/ ctx[14][/*i*/ ctx[41]] || 0)).toFixed(1) + "")) set_data_dev(t0, t0_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(t1);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5.name,
		type: "if",
		source: "(226:8) {#if progress_level != null}",
		ctx
	});

	return block;
}

// (215:6) {#each progress as p, i}
function create_each_block(ctx) {
	let if_block_anchor;
	let if_block = (/*p*/ ctx[39].desc != null || /*progress_level*/ ctx[14] && /*progress_level*/ ctx[14][/*i*/ ctx[41]] != null) && create_if_block_4(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (/*p*/ ctx[39].desc != null || /*progress_level*/ ctx[14] && /*progress_level*/ ctx[14][/*i*/ ctx[41]] != null) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_4(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(if_block_anchor);
			}

			if (if_block) if_block.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(215:6) {#each progress as p, i}",
		ctx
	});

	return block;
}

// (246:2) {#if !timer}
function create_if_block_1$1(ctx) {
	let p;
	let t;

	const block = {
		c: function create() {
			p = element("p");
			t = text(/*loading_text*/ ctx[9]);
			attr_dev(p, "class", "loading s-sk0WkR14YHPf");
			add_location(p, file$3, 269, 3, 6223);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, t);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*loading_text*/ 512) set_data_dev(t, /*loading_text*/ ctx[9]);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(p);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(246:2) {#if !timer}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let div_class_value;
	let current;
	const if_block_creators = [create_if_block$1, create_if_block_17];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*status*/ ctx[4] === "pending") return 0;
		if (/*status*/ ctx[4] === "error") return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	const block = {
		c: function create() {
			div = element("div");
			if (if_block) if_block.c();
			attr_dev(div, "class", div_class_value = "wrap " + /*variant*/ ctx[8] + " " + /*show_progress*/ ctx[6] + " s-sk0WkR14YHPf");
			toggle_class(div, "hide", !/*status*/ ctx[4] || /*status*/ ctx[4] === "complete" || /*show_progress*/ ctx[6] === "hidden");
			toggle_class(div, "translucent", /*variant*/ ctx[8] === "center" && (/*status*/ ctx[4] === "pending" || /*status*/ ctx[4] === "error") || /*translucent*/ ctx[11] || /*show_progress*/ ctx[6] === "minimal");
			toggle_class(div, "generating", /*status*/ ctx[4] === "generating");
			toggle_class(div, "border", /*border*/ ctx[12]);
			set_style(div, "position", /*absolute*/ ctx[10] ? "absolute" : "static");
			set_style(div, "padding", /*absolute*/ ctx[10] ? "0" : "var(--size-8) 0");
			add_location(div, file$3, 186, 0, 3986);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(div, null);
			}

			/*div_binding*/ ctx[31](div);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				} else {
					if_block = null;
				}
			}

			if (!current || dirty[0] & /*variant, show_progress*/ 320 && div_class_value !== (div_class_value = "wrap " + /*variant*/ ctx[8] + " " + /*show_progress*/ ctx[6] + " s-sk0WkR14YHPf")) {
				attr_dev(div, "class", div_class_value);
			}

			if (!current || dirty[0] & /*variant, show_progress, status, show_progress*/ 336) {
				toggle_class(div, "hide", !/*status*/ ctx[4] || /*status*/ ctx[4] === "complete" || /*show_progress*/ ctx[6] === "hidden");
			}

			if (!current || dirty[0] & /*variant, show_progress, variant, status, translucent, show_progress*/ 2384) {
				toggle_class(div, "translucent", /*variant*/ ctx[8] === "center" && (/*status*/ ctx[4] === "pending" || /*status*/ ctx[4] === "error") || /*translucent*/ ctx[11] || /*show_progress*/ ctx[6] === "minimal");
			}

			if (!current || dirty[0] & /*variant, show_progress, status*/ 336) {
				toggle_class(div, "generating", /*status*/ ctx[4] === "generating");
			}

			if (!current || dirty[0] & /*variant, show_progress, border*/ 4416) {
				toggle_class(div, "border", /*border*/ ctx[12]);
			}

			if (dirty[0] & /*absolute*/ 1024) {
				set_style(div, "position", /*absolute*/ ctx[10] ? "absolute" : "static");
			}

			if (dirty[0] & /*absolute*/ 1024) {
				set_style(div, "padding", /*absolute*/ ctx[10] ? "0" : "var(--size-8) 0");
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			/*div_binding*/ ctx[31](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

let items = [];
let called = false;

async function scroll_into_view(el, enable = true) {
	if (window.__gradio_mode__ === "website" || window.__gradio_mode__ !== "app" && enable !== true) {
		return;
	}

	items.push(el);
	if (!called) called = true; else return;
	await tick();

	requestAnimationFrame(() => {
		let min = [0, 0];

		for (let i = 0; i < items.length; i++) {
			const element = items[i];
			const box = element.getBoundingClientRect();

			if (i === 0 || box.top + window.scrollY <= min[0]) {
				min[0] = box.top + window.scrollY;
				min[1] = i;
			}
		}

		window.scrollTo({ top: min[0] - 20, behavior: "smooth" });
		called = false;
		items = [];
	});
}

function instance$1($$self, $$props, $$invalidate) {
	let formatted_timer;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Static', slots, ['error']);
	let { i18n } = $$props;
	let { eta = null } = $$props;
	let { queue = false } = $$props;
	let { queue_position } = $$props;
	let { queue_size } = $$props;
	let { status } = $$props;
	let { scroll_to_output = false } = $$props;
	let { timer = true } = $$props;
	let { show_progress = "full" } = $$props;
	let { message = null } = $$props;
	let { progress = null } = $$props;
	let { variant = "default" } = $$props;
	let { loading_text = "Loading..." } = $$props;
	let { absolute = true } = $$props;
	let { translucent = false } = $$props;
	let { border = false } = $$props;
	let { autoscroll } = $$props;
	let el;
	let _timer = false;
	let timer_start = 0;
	let timer_diff = 0;
	let old_eta = null;
	let message_visible = false;
	let eta_level = 0;
	let progress_level = null;
	let last_progress_level = undefined;
	let progress_bar = null;
	let show_eta_bar = true;

	const start_timer = () => {
		$$invalidate(25, timer_start = performance.now());
		$$invalidate(26, timer_diff = 0);
		_timer = true;
		run();
	};

	function run() {
		requestAnimationFrame(() => {
			$$invalidate(26, timer_diff = (performance.now() - timer_start) / 1000);
			if (_timer) run();
		});
	}

	function stop_timer() {
		$$invalidate(26, timer_diff = 0);
		if (!_timer) return;
		_timer = false;
	}

	onDestroy(() => {
		if (_timer) stop_timer();
	});

	let formatted_eta = null;
	let show_message_timeout = null;

	function close_message() {
		message_visible = false;

		if (show_message_timeout !== null) {
			clearTimeout(show_message_timeout);
		}
	}

	$$self.$$.on_mount.push(function () {
		if (i18n === undefined && !('i18n' in $$props || $$self.$$.bound[$$self.$$.props['i18n']])) {
			console.warn("<Static> was created without expected prop 'i18n'");
		}

		if (queue_position === undefined && !('queue_position' in $$props || $$self.$$.bound[$$self.$$.props['queue_position']])) {
			console.warn("<Static> was created without expected prop 'queue_position'");
		}

		if (queue_size === undefined && !('queue_size' in $$props || $$self.$$.bound[$$self.$$.props['queue_size']])) {
			console.warn("<Static> was created without expected prop 'queue_size'");
		}

		if (status === undefined && !('status' in $$props || $$self.$$.bound[$$self.$$.props['status']])) {
			console.warn("<Static> was created without expected prop 'status'");
		}

		if (autoscroll === undefined && !('autoscroll' in $$props || $$self.$$.bound[$$self.$$.props['autoscroll']])) {
			console.warn("<Static> was created without expected prop 'autoscroll'");
		}
	});

	const writable_props = [
		'i18n',
		'eta',
		'queue',
		'queue_position',
		'queue_size',
		'status',
		'scroll_to_output',
		'timer',
		'show_progress',
		'message',
		'progress',
		'variant',
		'loading_text',
		'absolute',
		'translucent',
		'border',
		'autoscroll'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Static> was created with unknown prop '${key}'`);
	});

	function div1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			progress_bar = $$value;
			((($$invalidate(16, progress_bar), $$invalidate(7, progress)), $$invalidate(14, progress_level)), $$invalidate(15, last_progress_level));
		});
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(13, el);
		});
	}

	$$self.$$set = $$props => {
		if ('i18n' in $$props) $$invalidate(1, i18n = $$props.i18n);
		if ('eta' in $$props) $$invalidate(0, eta = $$props.eta);
		if ('queue' in $$props) $$invalidate(21, queue = $$props.queue);
		if ('queue_position' in $$props) $$invalidate(2, queue_position = $$props.queue_position);
		if ('queue_size' in $$props) $$invalidate(3, queue_size = $$props.queue_size);
		if ('status' in $$props) $$invalidate(4, status = $$props.status);
		if ('scroll_to_output' in $$props) $$invalidate(22, scroll_to_output = $$props.scroll_to_output);
		if ('timer' in $$props) $$invalidate(5, timer = $$props.timer);
		if ('show_progress' in $$props) $$invalidate(6, show_progress = $$props.show_progress);
		if ('message' in $$props) $$invalidate(23, message = $$props.message);
		if ('progress' in $$props) $$invalidate(7, progress = $$props.progress);
		if ('variant' in $$props) $$invalidate(8, variant = $$props.variant);
		if ('loading_text' in $$props) $$invalidate(9, loading_text = $$props.loading_text);
		if ('absolute' in $$props) $$invalidate(10, absolute = $$props.absolute);
		if ('translucent' in $$props) $$invalidate(11, translucent = $$props.translucent);
		if ('border' in $$props) $$invalidate(12, border = $$props.border);
		if ('autoscroll' in $$props) $$invalidate(24, autoscroll = $$props.autoscroll);
		if ('$$scope' in $$props) $$invalidate(28, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		tick,
		pretty_si,
		items,
		called,
		scroll_into_view,
		onDestroy,
		Loader,
		i18n,
		eta,
		queue,
		queue_position,
		queue_size,
		status,
		scroll_to_output,
		timer,
		show_progress,
		message,
		progress,
		variant,
		loading_text,
		absolute,
		translucent,
		border,
		autoscroll,
		el,
		_timer,
		timer_start,
		timer_diff,
		old_eta,
		message_visible,
		eta_level,
		progress_level,
		last_progress_level,
		progress_bar,
		show_eta_bar,
		start_timer,
		run,
		stop_timer,
		formatted_eta,
		show_message_timeout,
		close_message,
		formatted_timer
	});

	$$self.$inject_state = $$props => {
		if ('i18n' in $$props) $$invalidate(1, i18n = $$props.i18n);
		if ('eta' in $$props) $$invalidate(0, eta = $$props.eta);
		if ('queue' in $$props) $$invalidate(21, queue = $$props.queue);
		if ('queue_position' in $$props) $$invalidate(2, queue_position = $$props.queue_position);
		if ('queue_size' in $$props) $$invalidate(3, queue_size = $$props.queue_size);
		if ('status' in $$props) $$invalidate(4, status = $$props.status);
		if ('scroll_to_output' in $$props) $$invalidate(22, scroll_to_output = $$props.scroll_to_output);
		if ('timer' in $$props) $$invalidate(5, timer = $$props.timer);
		if ('show_progress' in $$props) $$invalidate(6, show_progress = $$props.show_progress);
		if ('message' in $$props) $$invalidate(23, message = $$props.message);
		if ('progress' in $$props) $$invalidate(7, progress = $$props.progress);
		if ('variant' in $$props) $$invalidate(8, variant = $$props.variant);
		if ('loading_text' in $$props) $$invalidate(9, loading_text = $$props.loading_text);
		if ('absolute' in $$props) $$invalidate(10, absolute = $$props.absolute);
		if ('translucent' in $$props) $$invalidate(11, translucent = $$props.translucent);
		if ('border' in $$props) $$invalidate(12, border = $$props.border);
		if ('autoscroll' in $$props) $$invalidate(24, autoscroll = $$props.autoscroll);
		if ('el' in $$props) $$invalidate(13, el = $$props.el);
		if ('_timer' in $$props) _timer = $$props._timer;
		if ('timer_start' in $$props) $$invalidate(25, timer_start = $$props.timer_start);
		if ('timer_diff' in $$props) $$invalidate(26, timer_diff = $$props.timer_diff);
		if ('old_eta' in $$props) $$invalidate(27, old_eta = $$props.old_eta);
		if ('message_visible' in $$props) message_visible = $$props.message_visible;
		if ('eta_level' in $$props) $$invalidate(17, eta_level = $$props.eta_level);
		if ('progress_level' in $$props) $$invalidate(14, progress_level = $$props.progress_level);
		if ('last_progress_level' in $$props) $$invalidate(15, last_progress_level = $$props.last_progress_level);
		if ('progress_bar' in $$props) $$invalidate(16, progress_bar = $$props.progress_bar);
		if ('show_eta_bar' in $$props) $$invalidate(18, show_eta_bar = $$props.show_eta_bar);
		if ('formatted_eta' in $$props) $$invalidate(19, formatted_eta = $$props.formatted_eta);
		if ('show_message_timeout' in $$props) show_message_timeout = $$props.show_message_timeout;
		if ('formatted_timer' in $$props) $$invalidate(20, formatted_timer = $$props.formatted_timer);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*eta, old_eta, queue, timer_start*/ 169869313) {
			{
				if (eta === null) {
					$$invalidate(0, eta = old_eta);
				} else if (queue) {
					$$invalidate(0, eta = (performance.now() - timer_start) / 1000 + eta);
				}

				if (eta != null) {
					$$invalidate(19, formatted_eta = eta.toFixed(1));
					$$invalidate(27, old_eta = eta);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*eta, timer_diff*/ 67108865) {
			$$invalidate(17, eta_level = eta === null || eta <= 0 || !timer_diff
			? null
			: Math.min(timer_diff / eta, 1));
		}

		if ($$self.$$.dirty[0] & /*progress*/ 128) {
			if (progress != null) {
				$$invalidate(18, show_eta_bar = false);
			}
		}

		if ($$self.$$.dirty[0] & /*progress, progress_level, progress_bar, last_progress_level*/ 114816) {
			{
				if (progress != null) {
					$$invalidate(14, progress_level = progress.map(p => {
						if (p.index != null && p.length != null) {
							return p.index / p.length;
						} else if (p.progress != null) {
							return p.progress;
						}

						return undefined;
					}));
				} else {
					$$invalidate(14, progress_level = null);
				}

				if (progress_level) {
					$$invalidate(15, last_progress_level = progress_level[progress_level.length - 1]);

					if (progress_bar) {
						if (last_progress_level === 0) {
							$$invalidate(16, progress_bar.style.transition = "0", progress_bar);
						} else {
							$$invalidate(16, progress_bar.style.transition = "150ms", progress_bar);
						}
					}
				} else {
					$$invalidate(15, last_progress_level = undefined);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*status*/ 16) {
			{
				if (status === "pending") {
					start_timer();
				} else {
					stop_timer();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*el, scroll_to_output, status, autoscroll*/ 20979728) {
			el && scroll_to_output && (status === "pending" || status === "complete") && scroll_into_view(el, autoscroll);
		}

		if ($$self.$$.dirty[0] & /*status, message*/ 8388624) {
			{
				close_message();

				if (status === "error" && message) {
					message_visible = true;
				}
			}
		}

		if ($$self.$$.dirty[0] & /*timer_diff*/ 67108864) {
			$$invalidate(20, formatted_timer = timer_diff.toFixed(1));
		}
	};

	return [
		eta,
		i18n,
		queue_position,
		queue_size,
		status,
		timer,
		show_progress,
		progress,
		variant,
		loading_text,
		absolute,
		translucent,
		border,
		el,
		progress_level,
		last_progress_level,
		progress_bar,
		eta_level,
		show_eta_bar,
		formatted_eta,
		formatted_timer,
		queue,
		scroll_to_output,
		message,
		autoscroll,
		timer_start,
		timer_diff,
		old_eta,
		$$scope,
		slots,
		div1_binding,
		div_binding
	];
}

class Static extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance$1,
			create_fragment$1,
			safe_not_equal$1,
			{
				i18n: 1,
				eta: 0,
				queue: 21,
				queue_position: 2,
				queue_size: 3,
				status: 4,
				scroll_to_output: 22,
				timer: 5,
				show_progress: 6,
				message: 23,
				progress: 7,
				variant: 8,
				loading_text: 9,
				absolute: 10,
				translucent: 11,
				border: 12,
				autoscroll: 24
			},
			null,
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Static",
			options,
			id: create_fragment$1.name
		});
	}

	get i18n() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set i18n(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get eta() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set eta(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get queue() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set queue(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get queue_position() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set queue_position(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get queue_size() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set queue_size(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get status() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set status(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get scroll_to_output() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set scroll_to_output(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get timer() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set timer(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get show_progress() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set show_progress(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get message() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set message(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get progress() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set progress(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get variant() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set variant(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get loading_text() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set loading_text(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get absolute() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set absolute(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get translucent() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set translucent(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get border() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set border(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get autoscroll() {
		throw new Error("<Static>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set autoscroll(value) {
		throw new Error("<Static>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const DropdownArrow_svelte_svelte_type_style_lang = '';

const ToastContent_svelte_svelte_type_style_lang = '';

const Toast_svelte_svelte_type_style_lang = '';

const common$o = {
	built_with_gradio: "تم الإنشاء بإستخدام Gradio",
	clear: "أمسح",
	or: "أو",
	submit: "أرسل"
};
const upload_text$o = {
	click_to_upload: "إضغط للتحميل",
	drop_audio: "أسقط الملف الصوتي هنا",
	drop_csv: "أسقط ملف البيانات هنا",
	drop_file: "أسقط الملف هنا",
	drop_image: "أسقط الصورة هنا",
	drop_video: "أسقط الفيديو هنا"
};
const ar = {
	common: common$o,
	upload_text: upload_text$o
};

const __vite_glob_0_0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$o,
    default: ar,
    upload_text: upload_text$o
}, Symbol.toStringTag, { value: 'Module' }));

const common$n = {
	built_with_gradio: "Construït amb gradio",
	clear: "Neteja",
	empty: "Buit",
	error: "Error",
	loading: "S'està carregant",
	or: "o",
	submit: "Envia"
};
const upload_text$n = {
	click_to_upload: "Feu clic per pujar",
	drop_audio: "Deixeu anar l'àudio aquí",
	drop_csv: "Deixeu anar el CSV aquí",
	drop_file: "Deixeu anar el fitxer aquí",
	drop_image: "Deixeu anar la imatge aquí",
	drop_video: "Deixeu anar el vídeo aquí"
};
const ca = {
	common: common$n,
	upload_text: upload_text$n
};

const __vite_glob_0_1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$n,
    default: ca,
    upload_text: upload_text$n
}, Symbol.toStringTag, { value: 'Module' }));

const annotated_image$1 = {
	annotated_image: "وێنەی نیشانە کراو"
};
const audio$2 = {
	allow_recording_access: "تکایە ڕێگە بدە بە بەکارهێنانی مایکرۆفۆنەکە بۆ تۆمارکردن.",
	audio: "دەنگ",
	record_from_microphone: "تۆمارکردن لە مایکەوە",
	stop_recording: "تۆمارکردن بوەستێنە"
};
const blocks$1 = {
	connection_can_break: "لە مۆبایلدا، پەیوەندییەکە دەکرێت بپچڕێت ئەگەر ئەم تابە چالاک نەبێت یان ئامێرەکە بچێتە دۆخی پشوو، ئەمەش شوێنی خۆت لە ڕیزدا لەدەست دەدات.",
	long_requests_queue: "ڕیزێکی درێژی داواکاری هەیە. ئەم سپەیسە دووباد بکە بۆی چاوەڕوان نەبیت.",
	lost_connection: "پەیوەندی پچڕا بەهۆی جێهێشتنی پەیج. "
};
const checkbox$1 = {
	checkbox: "بۆکسی هەڵبژاردن",
	checkbox_group: "گروپی بۆکسی هەڵبژاردن"
};
const code$1 = {
	code: "کۆد"
};
const color_picker$1 = {
	color_picker: "ڕەنگ هەڵبژاردە"
};
const common$m = {
	built_with: "دروستکراوە لەگەڵ...",
	built_with_gradio: "Gradio دروستکراوە بە",
	clear: "خاوێنکردنەوە",
	download: "دابەزاندن",
	edit: "بژارکردن",
	empty: "بەتاڵ",
	error: "هەڵە",
	hosted_on: "میوانداری کراوە لە",
	loading: "بارکردن",
	logo: "لۆگۆ",
	or: "یان",
	remove: "لابردن",
	share: "هاوبەشکردن",
	submit: "پێشکەشکردن",
	undo: "پووچکردنەوە"
};
const dataframe$1 = {
	incorrect_format: "فۆرماتێکی هەڵە، تەنها فایلەکانی CSV و TSV پشتگیری دەکرێن",
	new_column: "ستوونی نوێ",
	new_row: "ڕیزێکی نوێ"
};
const dropdown$1 = {
	dropdown: "فڕێدانە خوار"
};
const errors$1 = {
	build_error: "هەڵەی دروستکردن هەیە",
	config_error: "هەڵەی ڕێکخستن هەیە",
	contact_page_author: "تکایە پەیوەندی بە نووسەری پەیجەوە بکەن بۆ ئەوەی ئاگاداریان بکەنەوە.",
	no_app_file: "هیچ فایلێکی ئەپ نییە",
	runtime_error: "هەڵەیەکی runtime هەیە",
	space_not_working: "\"سپەیسەکە کارناکات چونکە\" {0}",
	space_paused: "فەزاکە وەستاوە",
	use_via_api: "لە ڕێگەی API بەکاری بهێنە"
};
const file$2 = {
	uploading: "بارکردن..."
};
const highlighted_text$1 = {
	highlighted_text: "دەقی ڕۆشن کراو"
};
const image$1 = {
	allow_webcam_access: "تکایە ڕێگە بدە بە بەکارهێنانی وێبکامەکە بۆ تۆمارکردن.",
	brush_color: "ڕەنگی فڵچە",
	brush_radius: "تیژڕەوی فڵچە",
	image: "وێنە",
	remove_image: "لابردنی وێنە",
	select_brush_color: "ڕەنگی فڵچە هەڵبژێرە",
	start_drawing: "دەست بکە بە وێنەکێشان",
	use_brush: "فڵچە بەکاربهێنە"
};
const label$1 = {
	label: "لەیبڵ"
};
const login$1 = {
	enable_cookies: "ئەگەر تۆ سەردانی HuggingFace Space دەکەیت لە دۆخی نادیاردا، پێویستە کووکی لایەنی سێیەم چالاک بکەیت.",
	incorrect_credentials: "بڕوانامەی هەڵە",
	login: "چونه‌ ژووره‌وه‌"
};
const number$1 = {
	number: "ژمارە"
};
const plot$1 = {
	plot: "هێڵکاری"
};
const radio$1 = {
	radio: "ڕادیۆ"
};
const slider$1 = {
	slider: "خلیسکە"
};
const upload_text$m = {
	click_to_upload: "کلیک بکە بۆ بارکردن",
	drop_audio: "دەنگ لێرە دابنێ",
	drop_csv: "لێرەدا CSV دابنێ",
	drop_file: "فایل لێرە دابنێ",
	drop_image: "وێنە لێرەدا دابنێ",
	drop_video: "ڤیدیۆ لێرە دابنێ"
};
const ckb = {
	"3D_model": {
	"3d_model": "مۆدێلی سێ ڕەهەندی"
},
	annotated_image: annotated_image$1,
	audio: audio$2,
	blocks: blocks$1,
	checkbox: checkbox$1,
	code: code$1,
	color_picker: color_picker$1,
	common: common$m,
	dataframe: dataframe$1,
	dropdown: dropdown$1,
	errors: errors$1,
	file: file$2,
	highlighted_text: highlighted_text$1,
	image: image$1,
	label: label$1,
	login: login$1,
	number: number$1,
	plot: plot$1,
	radio: radio$1,
	slider: slider$1,
	upload_text: upload_text$m
};

const __vite_glob_0_2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    annotated_image: annotated_image$1,
    audio: audio$2,
    blocks: blocks$1,
    checkbox: checkbox$1,
    code: code$1,
    color_picker: color_picker$1,
    common: common$m,
    dataframe: dataframe$1,
    default: ckb,
    dropdown: dropdown$1,
    errors: errors$1,
    file: file$2,
    highlighted_text: highlighted_text$1,
    image: image$1,
    label: label$1,
    login: login$1,
    number: number$1,
    plot: plot$1,
    radio: radio$1,
    slider: slider$1,
    upload_text: upload_text$m
}, Symbol.toStringTag, { value: 'Module' }));

const common$l = {
	built_with_gradio: "Mit Gradio erstellt",
	clear: "Löschen",
	or: "oder",
	submit: "Absenden"
};
const upload_text$l = {
	click_to_upload: "Hochladen",
	drop_audio: "Audio hier ablegen",
	drop_csv: "CSV Datei hier ablegen",
	drop_file: "Datei hier ablegen",
	drop_image: "Bild hier ablegen",
	drop_video: "Video hier ablegen"
};
const de = {
	common: common$l,
	upload_text: upload_text$l
};

const __vite_glob_0_3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$l,
    default: de,
    upload_text: upload_text$l
}, Symbol.toStringTag, { value: 'Module' }));

const annotated_image = {
	annotated_image: "Annotated Image"
};
const audio$1 = {
	allow_recording_access: "Please allow access to the microphone for recording.",
	audio: "Audio",
	record_from_microphone: "Record from microphone",
	stop_recording: "Stop recording"
};
const blocks = {
	connection_can_break: "On mobile, the connection can break if this tab is unfocused or the device sleeps, losing your position in queue.",
	long_requests_queue: "There is a long queue of requests pending. Duplicate this Space to skip.",
	lost_connection: "Lost connection due to leaving page. Rejoining queue..."
};
const checkbox = {
	checkbox: "Checkbox",
	checkbox_group: "Checkbox Group"
};
const code = {
	code: "Code"
};
const color_picker = {
	color_picker: "Color Picker"
};
const common$k = {
	built_with: "built with",
	built_with_gradio: "Built with Gradio",
	clear: "Clear",
	download: "Download",
	edit: "Edit",
	empty: "Empty",
	error: "Error",
	hosted_on: "Hosted on",
	loading: "Loading",
	logo: "logo",
	or: "or",
	remove: "Remove",
	share: "Share",
	submit: "Submit",
	undo: "Undo"
};
const dataframe = {
	incorrect_format: "Incorrect format, only CSV and TSV files are supported",
	new_column: "New column",
	new_row: "New row"
};
const dropdown = {
	dropdown: "Dropdown"
};
const errors = {
	build_error: "there is a build error",
	config_error: "there is a config error",
	contact_page_author: "Please contact the author of the page to let them know.",
	no_app_file: "there is no app file",
	runtime_error: "there is a runtime error",
	space_not_working: "\"Space isn't working because\" {0}",
	space_paused: "the space is paused",
	use_via_api: "Use via API"
};
const file$1 = {
	uploading: "Uploading..."
};
const highlighted_text = {
	highlighted_text: "Highlighted Text"
};
const image = {
	allow_webcam_access: "Please allow access to the webcam for recording.",
	brush_color: "Brush color",
	brush_radius: "Brush radius",
	image: "Image",
	remove_image: "Remove Image",
	select_brush_color: "Select brush color",
	start_drawing: "Start drawing",
	use_brush: "Use brush"
};
const label = {
	label: "Label"
};
const login = {
	enable_cookies: "If you are visiting a HuggingFace Space in Incognito mode, you must enable third party cookies.",
	incorrect_credentials: "Incorrect Credentials",
	login: "Login"
};
const number = {
	number: "Number"
};
const plot = {
	plot: "Plot"
};
const radio = {
	radio: "Radio"
};
const slider = {
	slider: "Slider"
};
const upload_text$k = {
	click_to_upload: "Click to Upload",
	drop_audio: "Drop Audio Here",
	drop_csv: "Drop CSV Here",
	drop_file: "Drop File Here",
	drop_image: "Drop Image Here",
	drop_video: "Drop Video Here"
};
const en = {
	"3D_model": {
	"3d_model": "3D Model"
},
	annotated_image: annotated_image,
	audio: audio$1,
	blocks: blocks,
	checkbox: checkbox,
	code: code,
	color_picker: color_picker,
	common: common$k,
	dataframe: dataframe,
	dropdown: dropdown,
	errors: errors,
	file: file$1,
	highlighted_text: highlighted_text,
	image: image,
	label: label,
	login: login,
	number: number,
	plot: plot,
	radio: radio,
	slider: slider,
	upload_text: upload_text$k
};

const __vite_glob_0_4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    annotated_image,
    audio: audio$1,
    blocks,
    checkbox,
    code,
    color_picker,
    common: common$k,
    dataframe,
    default: en,
    dropdown,
    errors,
    file: file$1,
    highlighted_text,
    image,
    label,
    login,
    number,
    plot,
    radio,
    slider,
    upload_text: upload_text$k
}, Symbol.toStringTag, { value: 'Module' }));

const common$j = {
	built_with_gradio: "Construido con Gradio",
	clear: "Limpiar",
	or: "o",
	submit: "Enviar"
};
const upload_text$j = {
	click_to_upload: "Haga click para cargar",
	drop_audio: "Coloque el audio aquí",
	drop_csv: "Coloque el CSV aquí",
	drop_file: "Coloque el archivo aquí",
	drop_image: "Coloque la imagen aquí",
	drop_video: "Coloque el video aquí"
};
const es = {
	common: common$j,
	upload_text: upload_text$j
};

const __vite_glob_0_5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$j,
    default: es,
    upload_text: upload_text$j
}, Symbol.toStringTag, { value: 'Module' }));

const common$i = {
	built_with_gradio: "Gradiorekin eraikia",
	clear: "Garbitu",
	or: "edo",
	submit: "Bidali"
};
const upload_text$i = {
	click_to_upload: "Klik egin kargatzeko",
	drop_audio: "Jarri hemen audioa",
	drop_csv: "Jarri hemen CSVa",
	drop_file: "Jarri hemen fitxategia",
	drop_image: "Jarri hemen irudia",
	drop_video: "Jarri hemen bideoa"
};
const eu = {
	common: common$i,
	upload_text: upload_text$i
};

const __vite_glob_0_6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$i,
    default: eu,
    upload_text: upload_text$i
}, Symbol.toStringTag, { value: 'Module' }));

const common$h = {
	built_with_gradio: "ساخته شده با gradio",
	clear: "حذف",
	or: "یا",
	submit: "ارسال"
};
const upload_text$h = {
	click_to_upload: "برای آپلود کلیک کنید",
	drop_audio: "صوت را اینجا رها کنید",
	drop_csv: "فایل csv را  اینجا رها کنید",
	drop_file: "فایل را اینجا رها کنید",
	drop_image: "تصویر را اینجا رها کنید",
	drop_video: "ویدیو را اینجا رها کنید"
};
const fa = {
	common: common$h,
	upload_text: upload_text$h
};

const __vite_glob_0_7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$h,
    default: fa,
    upload_text: upload_text$h
}, Symbol.toStringTag, { value: 'Module' }));

const audio = {
	allow_recording_access: "Veuillez autoriser l'accès à l'enregistrement",
	audio: "Audio",
	record_from_microphone: "Enregistrer avec le microphone",
	stop_recording: "Arrêter l'enregistrement"
};
const common$g = {
	built_with: "Construit avec",
	built_with_gradio: "Construit avec Gradio",
	clear: "Effacer",
	download: "Télécharger",
	edit: "Éditer",
	error: "Erreur",
	loading: "Chargement",
	logo: "logo",
	or: "ou",
	remove: "Supprimer",
	share: "Partager",
	submit: "Soumettre"
};
const upload_text$g = {
	click_to_upload: "Cliquer pour Télécharger",
	drop_audio: "Déposer l'Audio Ici",
	drop_csv: "Déposer le CSV Ici",
	drop_file: "Déposer le Fichier Ici",
	drop_image: "Déposer l'Image Ici",
	drop_video: "Déposer la Vidéo Ici"
};
const fr = {
	audio: audio,
	common: common$g,
	upload_text: upload_text$g
};

const __vite_glob_0_8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    audio,
    common: common$g,
    default: fr,
    upload_text: upload_text$g
}, Symbol.toStringTag, { value: 'Module' }));

const common$f = {
	built_with_gradio: "בנוי עם גרדיו",
	clear: "נקה",
	or: "או",
	submit: "שלח"
};
const upload_text$f = {
	click_to_upload: "לחץ כדי להעלות",
	drop_audio: "גרור לכאן קובץ שמע",
	drop_csv: "גרור csv קובץ לכאן",
	drop_file: "גרור קובץ לכאן",
	drop_image: "גרור קובץ תמונה לכאן",
	drop_video: "גרור קובץ סרטון לכאן"
};
const he = {
	common: common$f,
	upload_text: upload_text$f
};

const __vite_glob_0_9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$f,
    default: he,
    upload_text: upload_text$f
}, Symbol.toStringTag, { value: 'Module' }));

const common$e = {
	built_with_gradio: "Gradio से बना",
	clear: "हटाये",
	or: "या",
	submit: "सबमिट करे"
};
const upload_text$e = {
	click_to_upload: "अपलोड के लिए बटन दबायें",
	drop_audio: "यहाँ ऑडियो ड्रॉप करें",
	drop_csv: "यहाँ CSV ड्रॉप करें",
	drop_file: "यहाँ File ड्रॉप करें",
	drop_image: "यहाँ इमेज ड्रॉप करें",
	drop_video: "यहाँ वीडियो ड्रॉप करें"
};
const hi = {
	common: common$e,
	upload_text: upload_text$e
};

const __vite_glob_0_10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$e,
    default: hi,
    upload_text: upload_text$e
}, Symbol.toStringTag, { value: 'Module' }));

const common$d = {
	built_with_gradio: "gradioで作ろう",
	clear: "クリア",
	or: "または",
	submit: "送信"
};
const upload_text$d = {
	click_to_upload: "クリックしてアップロード",
	drop_audio: "ここに音声をドロップ",
	drop_csv: "ここにCSVをドロップ",
	drop_file: "ここにファイルをドロップ",
	drop_image: "ここに画像をドロップ",
	drop_video: "ここに動画をドロップ"
};
const ja = {
	common: common$d,
	upload_text: upload_text$d
};

const __vite_glob_0_11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$d,
    default: ja,
    upload_text: upload_text$d
}, Symbol.toStringTag, { value: 'Module' }));

const common$c = {
	built_with_gradio: "gradio로 제작되었습니다",
	clear: "클리어",
	or: "또는",
	submit: "제출하기"
};
const upload_text$c = {
	click_to_upload: "클릭해서 업로드하기",
	drop_audio: "오디오를 끌어 놓으세요",
	drop_csv: "CSV파일을 끌어 놓으세요",
	drop_file: "파일을 끌어 놓으세요",
	drop_image: "이미지를 끌어 놓으세요",
	drop_video: "비디오를 끌어 놓으세요"
};
const ko = {
	common: common$c,
	upload_text: upload_text$c
};

const __vite_glob_0_12 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$c,
    default: ko,
    upload_text: upload_text$c
}, Symbol.toStringTag, { value: 'Module' }));

const common$b = {
	built_with_gradio: "sukurta su gradio",
	clear: "Trinti",
	or: "arba",
	submit: "Pateikti"
};
const upload_text$b = {
	click_to_upload: "Spustelėkite norėdami įkelti",
	drop_audio: "Įkelkite garso įrašą čia",
	drop_csv: "Įkelkite CSV čia",
	drop_file: "Įkelkite bylą čia",
	drop_image: "Įkelkite paveikslėlį čia",
	drop_video: "Įkelkite vaizdo įrašą čia"
};
const lt = {
	common: common$b,
	upload_text: upload_text$b
};

const __vite_glob_0_13 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$b,
    default: lt,
    upload_text: upload_text$b
}, Symbol.toStringTag, { value: 'Module' }));

const common$a = {
	built_with_gradio: "gemaakt met gradio",
	clear: "Wis",
	or: "of",
	submit: "Zend in"
};
const upload_text$a = {
	click_to_upload: "Klik om the Uploaden",
	drop_audio: "Sleep een Geluidsbestand hier",
	drop_csv: "Sleep een CSV hier",
	drop_file: "Sleep een Document hier",
	drop_image: "Sleep een Afbeelding hier",
	drop_video: "Sleep een Video hier"
};
const nl = {
	common: common$a,
	upload_text: upload_text$a
};

const __vite_glob_0_14 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$a,
    default: nl,
    upload_text: upload_text$a
}, Symbol.toStringTag, { value: 'Module' }));

const common$9 = {
	built_with_gradio: "utworzone z gradio",
	clear: "Wyczyść",
	or: "lub",
	submit: "Zatwierdź"
};
const upload_text$9 = {
	click_to_upload: "Kliknij, aby przesłać",
	drop_audio: "Przeciągnij tutaj audio",
	drop_csv: "Przeciągnij tutaj CSV",
	drop_file: "Przeciągnij tutaj plik",
	drop_image: "Przeciągnij tutaj zdjęcie",
	drop_video: "Przeciągnij tutaj video"
};
const pl = {
	common: common$9,
	upload_text: upload_text$9
};

const __vite_glob_0_15 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$9,
    default: pl,
    upload_text: upload_text$9
}, Symbol.toStringTag, { value: 'Module' }));

const common$8 = {
	built_with_gradio: "Construído com gradio",
	clear: "Limpar",
	error: "Erro",
	flag: "Marcar",
	loading: "Carregando",
	or: "ou",
	submit: "Enviar"
};
const upload_text$8 = {
	click_to_upload: "Clique para o Upload",
	drop_audio: "Solte o Áudio Aqui",
	drop_csv: "Solte o CSV Aqui",
	drop_file: "Solte o Arquivo Aqui",
	drop_image: "Solte a Imagem Aqui",
	drop_video: "Solte o Vídeo Aqui"
};
const ptBR = {
	common: common$8,
	upload_text: upload_text$8
};

const __vite_glob_0_16 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$8,
    default: ptBR,
    upload_text: upload_text$8
}, Symbol.toStringTag, { value: 'Module' }));

const common$7 = {
	built_with_gradio: "сделано с помощью gradio",
	clear: "Очистить",
	or: "или",
	submit: "Исполнить"
};
const upload_text$7 = {
	click_to_upload: "Нажмите, чтобы загрузить",
	drop_audio: "Поместите Аудио Здесь",
	drop_csv: "Поместите CSV Здесь",
	drop_file: "Поместите Документ Здесь",
	drop_image: "Поместите Изображение Здесь",
	drop_video: "Поместите Видео Здесь"
};
const ru = {
	common: common$7,
	upload_text: upload_text$7
};

const __vite_glob_0_17 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$7,
    default: ru,
    upload_text: upload_text$7
}, Symbol.toStringTag, { value: 'Module' }));

const common$6 = {
	built_with_gradio: "கிரேடியோ வுடன் உருவாக்கப்பட்டது",
	clear: "அழிக்கவும்",
	or: "அல்லது",
	submit: "சமர்ப்பிக்கவும்"
};
const upload_text$6 = {
	click_to_upload: "பதிவேற்ற அழுத்தவும்",
	drop_audio: "ஆடியோவை பதிவேற்றவும்",
	drop_csv: "csv ஐ பதிவேற்றவும்",
	drop_file: "கோப்பை பதிவேற்றவும்",
	drop_image: "படத்தை பதிவேற்றவும்",
	drop_video: "காணொளியை பதிவேற்றவும்"
};
const ta = {
	common: common$6,
	upload_text: upload_text$6
};

const __vite_glob_0_18 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$6,
    default: ta,
    upload_text: upload_text$6
}, Symbol.toStringTag, { value: 'Module' }));

const common$5 = {
	built_with_gradio: "Gradio ile oluşturulmuştur",
	clear: "Temizle",
	or: "veya",
	submit: "Yükle"
};
const upload_text$5 = {
	click_to_upload: "Yüklemek için Tıkla",
	drop_audio: "Kaydı Buraya Sürükle",
	drop_csv: "CSV'yi Buraya Sürükle",
	drop_file: "Dosyayı Buraya Sürükle",
	drop_image: "Resmi Buraya Sürükle",
	drop_video: "Videoyu Buraya Sürükle"
};
const tr = {
	common: common$5,
	upload_text: upload_text$5
};

const __vite_glob_0_19 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$5,
    default: tr,
    upload_text: upload_text$5
}, Symbol.toStringTag, { value: 'Module' }));

const common$4 = {
	built_with_gradio: "Зроблено на основі gradio",
	clear: "Очистити",
	or: "або",
	submit: "Надіслати"
};
const upload_text$4 = {
	click_to_upload: "Натисніть щоб завантажити",
	drop_audio: "Перетягніть аудіо сюди",
	drop_csv: "Перетягніть CSV-файл сюди",
	drop_file: "Перетягніть файл сюди",
	drop_image: "Перетягніть зображення сюди",
	drop_video: "Перетягніть відео сюди"
};
const uk = {
	common: common$4,
	upload_text: upload_text$4
};

const __vite_glob_0_20 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$4,
    default: uk,
    upload_text: upload_text$4
}, Symbol.toStringTag, { value: 'Module' }));

const common$3 = {
	built_with_gradio: "کے ساتھ بنایا گیا Gradio",
	clear: "ہٹا دیں",
	or: "یا",
	submit: "جمع کریں"
};
const upload_text$3 = {
	click_to_upload: "اپ لوڈ کے لیے کلک کریں",
	drop_audio: "یہاں آڈیو ڈراپ کریں",
	drop_csv: "یہاں فائل ڈراپ کریں",
	drop_file: "یہاں فائل ڈراپ کریں",
	drop_image: "یہاں تصویر ڈراپ کریں",
	drop_video: "یہاں ویڈیو ڈراپ کریں"
};
const ur = {
	common: common$3,
	upload_text: upload_text$3
};

const __vite_glob_0_21 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$3,
    default: ur,
    upload_text: upload_text$3
}, Symbol.toStringTag, { value: 'Module' }));

const common$2 = {
	built_with_gradio: "gradio bilan qilingan",
	clear: "Tozalash",
	submit: "Yubor"
};
const upload_text$2 = {
	click_to_upload: "Yuklash uchun Bosing",
	drop_audio: "Audioni Shu Yerga Tashlang",
	drop_csv: "CSVni Shu Yerga Tashlang",
	drop_file: "Faylni Shu Yerga Tashlang",
	drop_image: "Rasmni Shu Yerga Tashlang",
	drop_video: "Videoni Shu Yerga Tashlang"
};
const uz = {
	common: common$2,
	upload_text: upload_text$2
};

const __vite_glob_0_22 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$2,
    default: uz,
    upload_text: upload_text$2
}, Symbol.toStringTag, { value: 'Module' }));

const common$1 = {
	built_with_gradio: "使用Gradio构建",
	clear: "清除",
	or: "或",
	submit: "提交"
};
const upload_text$1 = {
	click_to_upload: "点击上传",
	drop_audio: "拖放音频至此处",
	drop_csv: "拖放CSV至此处",
	drop_file: "拖放文件至此处",
	drop_image: "拖放图片至此处",
	drop_video: "拖放视频至此处"
};
const zhCN = {
	common: common$1,
	upload_text: upload_text$1
};

const __vite_glob_0_23 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common: common$1,
    default: zhCN,
    upload_text: upload_text$1
}, Symbol.toStringTag, { value: 'Module' }));

const common = {
	built_with_gradio: "使用Gradio構建",
	clear: "清除",
	or: "或",
	submit: "提交"
};
const upload_text = {
	click_to_upload: "點擊上傳",
	drop_audio: "刪除音頻",
	drop_csv: "刪除CSV",
	drop_file: "刪除檔案",
	drop_image: "刪除圖片",
	drop_video: "刪除影片"
};
const zhTW = {
	common: common,
	upload_text: upload_text
};

const __vite_glob_0_24 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    common,
    default: zhTW,
    upload_text
}, Symbol.toStringTag, { value: 'Module' }));

const langs = /* #__PURE__ */ Object.assign({"./lang/ar.json": __vite_glob_0_0,"./lang/ca.json": __vite_glob_0_1,"./lang/ckb.json": __vite_glob_0_2,"./lang/de.json": __vite_glob_0_3,"./lang/en.json": __vite_glob_0_4,"./lang/es.json": __vite_glob_0_5,"./lang/eu.json": __vite_glob_0_6,"./lang/fa.json": __vite_glob_0_7,"./lang/fr.json": __vite_glob_0_8,"./lang/he.json": __vite_glob_0_9,"./lang/hi.json": __vite_glob_0_10,"./lang/ja.json": __vite_glob_0_11,"./lang/ko.json": __vite_glob_0_12,"./lang/lt.json": __vite_glob_0_13,"./lang/nl.json": __vite_glob_0_14,"./lang/pl.json": __vite_glob_0_15,"./lang/pt-BR.json": __vite_glob_0_16,"./lang/ru.json": __vite_glob_0_17,"./lang/ta.json": __vite_glob_0_18,"./lang/tr.json": __vite_glob_0_19,"./lang/uk.json": __vite_glob_0_20,"./lang/ur.json": __vite_glob_0_21,"./lang/uz.json": __vite_glob_0_22,"./lang/zh-CN.json": __vite_glob_0_23,"./lang/zh-TW.json": __vite_glob_0_24});
function process_langs() {
  let _langs = {};
  for (const lang in langs) {
    const code = lang.split("/").pop().split(".").shift();
    _langs[code] = langs[lang].default;
  }
  return _langs;
}
const processed_langs = process_langs();
for (const lang in processed_langs) {
  m(lang, processed_langs[lang]);
}
function setupi18n() {
  O({
    fallbackLocale: "en",
    initialLocale: z()
  });
}

const Index_svelte_svelte_type_style_lang = '';

const file = "src/Index.svelte";

// (227:1) {#if (loader_status === "pending" || loader_status === "error") && !(config && config?.auth_required)}
function create_if_block_2(ctx) {
	let statustracker;
	let current;

	statustracker = new Static({
			props: {
				absolute: !/*is_embed*/ ctx[4],
				status: /*loader_status*/ ctx[14],
				timer: false,
				queue_position: null,
				queue_size: null,
				translucent: true,
				loading_text: /*loading_text*/ ctx[21],
				i18n: /*$_*/ ctx[20],
				autoscroll: /*autoscroll*/ ctx[0],
				$$slots: { error: [create_error_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(statustracker.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(statustracker, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const statustracker_changes = {};
			if (dirty[0] & /*is_embed*/ 16) statustracker_changes.absolute = !/*is_embed*/ ctx[4];
			if (dirty[0] & /*loader_status*/ 16384) statustracker_changes.status = /*loader_status*/ ctx[14];
			if (dirty[0] & /*$_*/ 1048576) statustracker_changes.i18n = /*$_*/ ctx[20];
			if (dirty[0] & /*autoscroll*/ 1) statustracker_changes.autoscroll = /*autoscroll*/ ctx[0];

			if (dirty[0] & /*space, status, $_*/ 1057024 | dirty[1] & /*$$scope*/ 16384) {
				statustracker_changes.$$scope = { dirty, ctx };
			}

			statustracker.$set(statustracker_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(statustracker.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(statustracker.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(statustracker, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(227:1) {#if (loader_status === \\\"pending\\\" || loader_status === \\\"error\\\") && !(config && config?.auth_required)}",
		ctx
	});

	return block;
}

// (255:4) {:else}
function create_else_block(ctx) {
	let p;
	let t_value = /*$_*/ ctx[20]("errors.contact_page_author") + "";
	let t;

	const block = {
		c: function create() {
			p = element("p");
			t = text(t_value);
			attr_dev(p, "class", "s-ppgE8qJ6HMr2");
			add_location(p, file, 354, 5, 8072);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, t);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*$_*/ 1048576 && t_value !== (t_value = /*$_*/ ctx[20]("errors.contact_page_author") + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(p);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(255:4) {:else}",
		ctx
	});

	return block;
}

// (242:4) {#if (status.status === "space_error" || status.status === "paused") && status.discussions_enabled}
function create_if_block_3(ctx) {
	let p;
	let t0;
	let a;
	let t1;
	let a_href_value;
	let t2;

	const block = {
		c: function create() {
			p = element("p");
			t0 = text("Please ");
			a = element("a");
			t1 = text("contact the author of the space");
			t2 = text(" to let them know.");
			attr_dev(a, "href", a_href_value = "https://huggingface.co/spaces/" + /*space*/ ctx[8] + "/discussions/new?title=" + /*discussion_message*/ ctx[22].title(/*status*/ ctx[13]?.detail) + "&description=" + /*discussion_message*/ ctx[22].description(/*status*/ ctx[13]?.detail, location.origin));
			attr_dev(a, "class", "s-ppgE8qJ6HMr2");
			add_location(a, file, 342, 13, 7729);
			attr_dev(p, "class", "s-ppgE8qJ6HMr2");
			add_location(p, file, 341, 5, 7712);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, t0);
			append_dev(p, a);
			append_dev(a, t1);
			append_dev(p, t2);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*space, status*/ 8448 && a_href_value !== (a_href_value = "https://huggingface.co/spaces/" + /*space*/ ctx[8] + "/discussions/new?title=" + /*discussion_message*/ ctx[22].title(/*status*/ ctx[13]?.detail) + "&description=" + /*discussion_message*/ ctx[22].description(/*status*/ ctx[13]?.detail, location.origin))) {
				attr_dev(a, "href", a_href_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(p);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(242:4) {#if (status.status === \\\"space_error\\\" || status.status === \\\"paused\\\") && status.discussions_enabled}",
		ctx
	});

	return block;
}

// (240:3) 
function create_error_slot(ctx) {
	let div;
	let p;
	let strong;
	let t0_value = (/*status*/ ctx[13]?.message || "") + "";
	let t0;
	let t1;

	function select_block_type(ctx, dirty) {
		if ((/*status*/ ctx[13].status === "space_error" || /*status*/ ctx[13].status === "paused") && /*status*/ ctx[13].discussions_enabled) return create_if_block_3;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			div = element("div");
			p = element("p");
			strong = element("strong");
			t0 = text(t0_value);
			t1 = space();
			if_block.c();
			add_location(strong, file, 339, 7, 7558);
			attr_dev(p, "class", "s-ppgE8qJ6HMr2");
			add_location(p, file, 339, 4, 7555);
			attr_dev(div, "class", "error s-ppgE8qJ6HMr2");
			attr_dev(div, "slot", "error");
			add_location(div, file, 338, 3, 7518);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, p);
			append_dev(p, strong);
			append_dev(strong, t0);
			append_dev(div, t1);
			if_block.m(div, null);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*status*/ 8192 && t0_value !== (t0_value = (/*status*/ ctx[13]?.message || "") + "")) set_data_dev(t0, t0_value);

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			if_block.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_error_slot.name,
		type: "slot",
		source: "(240:3) ",
		ctx
	});

	return block;
}

// (268:41) 
function create_if_block_1(ctx) {
	let blocks;
	let updating_ready;
	let updating_render_complete;
	let current;

	const blocks_spread_levels = [
		{ app: /*app*/ ctx[16] },
		/*config*/ ctx[12],
		{
			theme_mode: /*active_theme_mode*/ ctx[15]
		},
		{
			control_page_title: /*control_page_title*/ ctx[5]
		},
		{ target: /*wrapper*/ ctx[9] },
		{ autoscroll: /*autoscroll*/ ctx[0] },
		{ show_footer: !/*is_embed*/ ctx[4] },
		{ app_mode: /*app_mode*/ ctx[3] },
		{ version: /*version*/ ctx[1] }
	];

	function blocks_ready_binding(value) {
		/*blocks_ready_binding*/ ctx[31](value);
	}

	function blocks_render_complete_binding(value) {
		/*blocks_render_complete_binding*/ ctx[32](value);
	}

	let blocks_props = {};

	for (let i = 0; i < blocks_spread_levels.length; i += 1) {
		blocks_props = assign(blocks_props, blocks_spread_levels[i]);
	}

	if (/*ready*/ ctx[10] !== void 0) {
		blocks_props.ready = /*ready*/ ctx[10];
	}

	if (/*render_complete*/ ctx[11] !== void 0) {
		blocks_props.render_complete = /*render_complete*/ ctx[11];
	}

	blocks = new /*Blocks*/ ctx[18]({ props: blocks_props, $$inline: true });
	binding_callbacks.push(() => bind(blocks, 'ready', blocks_ready_binding));
	binding_callbacks.push(() => bind(blocks, 'render_complete', blocks_render_complete_binding));

	const block = {
		c: function create() {
			create_component(blocks.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(blocks, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const blocks_changes = (dirty[0] & /*app, config, active_theme_mode, control_page_title, wrapper, autoscroll, is_embed, app_mode, version*/ 102971)
			? get_spread_update(blocks_spread_levels, [
					dirty[0] & /*app*/ 65536 && { app: /*app*/ ctx[16] },
					dirty[0] & /*config*/ 4096 && get_spread_object(/*config*/ ctx[12]),
					dirty[0] & /*active_theme_mode*/ 32768 && {
						theme_mode: /*active_theme_mode*/ ctx[15]
					},
					dirty[0] & /*control_page_title*/ 32 && {
						control_page_title: /*control_page_title*/ ctx[5]
					},
					dirty[0] & /*wrapper*/ 512 && { target: /*wrapper*/ ctx[9] },
					dirty[0] & /*autoscroll*/ 1 && { autoscroll: /*autoscroll*/ ctx[0] },
					dirty[0] & /*is_embed*/ 16 && { show_footer: !/*is_embed*/ ctx[4] },
					dirty[0] & /*app_mode*/ 8 && { app_mode: /*app_mode*/ ctx[3] },
					dirty[0] & /*version*/ 2 && { version: /*version*/ ctx[1] }
				])
			: {};

			if (!updating_ready && dirty[0] & /*ready*/ 1024) {
				updating_ready = true;
				blocks_changes.ready = /*ready*/ ctx[10];
				add_flush_callback(() => updating_ready = false);
			}

			if (!updating_render_complete && dirty[0] & /*render_complete*/ 2048) {
				updating_render_complete = true;
				blocks_changes.render_complete = /*render_complete*/ ctx[11];
				add_flush_callback(() => updating_render_complete = false);
			}

			blocks.$set(blocks_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(blocks.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(blocks.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(268:41) ",
		ctx
	});

	return block;
}

// (261:1) {#if config?.auth_required && Login}
function create_if_block(ctx) {
	let login;
	let current;

	login = new /*Login*/ ctx[19]({
			props: {
				auth_message: /*config*/ ctx[12].auth_message,
				root: /*config*/ ctx[12].root,
				space_id: /*space*/ ctx[8],
				app_mode: /*app_mode*/ ctx[3]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(login.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(login, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const login_changes = {};
			if (dirty[0] & /*config*/ 4096) login_changes.auth_message = /*config*/ ctx[12].auth_message;
			if (dirty[0] & /*config*/ 4096) login_changes.root = /*config*/ ctx[12].root;
			if (dirty[0] & /*space*/ 256) login_changes.space_id = /*space*/ ctx[8];
			if (dirty[0] & /*app_mode*/ 8) login_changes.app_mode = /*app_mode*/ ctx[3];
			login.$set(login_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(login.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(login.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(login, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(261:1) {#if config?.auth_required && Login}",
		ctx
	});

	return block;
}

// (217:0) <Embed  display={container && is_embed}  {is_embed}  info={!!space && info}  {version}  {initial_height}  {space}  loaded={loader_status === "complete"}  bind:wrapper >
function create_default_slot(ctx) {
	let t;
	let current_block_type_index;
	let if_block1;
	let if_block1_anchor;
	let current;
	let if_block0 = (/*loader_status*/ ctx[14] === "pending" || /*loader_status*/ ctx[14] === "error") && !(/*config*/ ctx[12] && /*config*/ ctx[12]?.auth_required) && create_if_block_2(ctx);
	const if_block_creators = [create_if_block, create_if_block_1];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*config*/ ctx[12]?.auth_required && /*Login*/ ctx[19]) return 0;
		if (/*config*/ ctx[12] && /*Blocks*/ ctx[18] && /*css_ready*/ ctx[17]) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type_1(ctx))) {
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t, anchor);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert_dev(target, if_block1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if ((/*loader_status*/ ctx[14] === "pending" || /*loader_status*/ ctx[14] === "error") && !(/*config*/ ctx[12] && /*config*/ ctx[12]?.auth_required)) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*loader_status, config*/ 20480) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block1) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block1 = if_blocks[current_block_type_index];

					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block1.c();
					} else {
						if_block1.p(ctx, dirty);
					}

					transition_in(if_block1, 1);
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				} else {
					if_block1 = null;
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
				detach_dev(if_block1_anchor);
			}

			if (if_block0) if_block0.d(detaching);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(217:0) <Embed  display={container && is_embed}  {is_embed}  info={!!space && info}  {version}  {initial_height}  {space}  loaded={loader_status === \\\"complete\\\"}  bind:wrapper >",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let embed;
	let updating_wrapper;
	let current;

	function embed_wrapper_binding(value) {
		/*embed_wrapper_binding*/ ctx[33](value);
	}

	let embed_props = {
		display: /*container*/ ctx[6] && /*is_embed*/ ctx[4],
		is_embed: /*is_embed*/ ctx[4],
		info: !!/*space*/ ctx[8] && /*info*/ ctx[7],
		version: /*version*/ ctx[1],
		initial_height: /*initial_height*/ ctx[2],
		space: /*space*/ ctx[8],
		loaded: /*loader_status*/ ctx[14] === "complete",
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx }
	};

	if (/*wrapper*/ ctx[9] !== void 0) {
		embed_props.wrapper = /*wrapper*/ ctx[9];
	}

	embed = new Embed({ props: embed_props, $$inline: true });
	binding_callbacks.push(() => bind(embed, 'wrapper', embed_wrapper_binding));

	const block = {
		c: function create() {
			create_component(embed.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(embed, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const embed_changes = {};
			if (dirty[0] & /*container, is_embed*/ 80) embed_changes.display = /*container*/ ctx[6] && /*is_embed*/ ctx[4];
			if (dirty[0] & /*is_embed*/ 16) embed_changes.is_embed = /*is_embed*/ ctx[4];
			if (dirty[0] & /*space, info*/ 384) embed_changes.info = !!/*space*/ ctx[8] && /*info*/ ctx[7];
			if (dirty[0] & /*version*/ 2) embed_changes.version = /*version*/ ctx[1];
			if (dirty[0] & /*initial_height*/ 4) embed_changes.initial_height = /*initial_height*/ ctx[2];
			if (dirty[0] & /*space*/ 256) embed_changes.space = /*space*/ ctx[8];
			if (dirty[0] & /*loader_status*/ 16384) embed_changes.loaded = /*loader_status*/ ctx[14] === "complete";

			if (dirty[0] & /*config, space, app_mode, Login, app, active_theme_mode, control_page_title, wrapper, autoscroll, is_embed, version, ready, render_complete, Blocks, css_ready, loader_status, $_, status*/ 2096955 | dirty[1] & /*$$scope*/ 16384) {
				embed_changes.$$scope = { dirty, ctx };
			}

			if (!updating_wrapper && dirty[0] & /*wrapper*/ 512) {
				updating_wrapper = true;
				embed_changes.wrapper = /*wrapper*/ ctx[9];
				add_flush_callback(() => updating_wrapper = false);
			}

			embed.$set(embed_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(embed.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(embed.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(embed, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

let id = -1;

function create_intersection_store() {
	const intersecting = writable({});
	const els = new Map();

	const observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					let _el = els.get(entry.target);
					if (_el !== undefined) intersecting.update(s => ({ ...s, [_el]: true }));
				}
			});
		});

	function register(_id, el) {
		els.set(el, _id);
		observer.observe(el);
	}

	return {
		register,
		subscribe: intersecting.subscribe
	};
}

const intersecting = create_intersection_store();

function instance($$self, $$props, $$invalidate) {
	let $_;
	let $intersecting;
	validate_store(X, '_');
	component_subscribe($$self, X, $$value => $$invalidate(20, $_ = $$value));
	validate_store(intersecting, 'intersecting');
	component_subscribe($$self, intersecting, $$value => $$invalidate(30, $intersecting = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Index', slots, []);
	setupi18n();
	let { autoscroll } = $$props;
	let { version } = $$props;
	let { initial_height } = $$props;
	let { app_mode } = $$props;
	let { is_embed } = $$props;
	let { theme_mode = "system" } = $$props;
	let { control_page_title } = $$props;
	let { container } = $$props;
	let { info } = $$props;
	let { eager } = $$props;
	let websocket;
	let { mount_css: mount_css$1 = mount_css } = $$props;
	let { client } = $$props;
	let { upload_files } = $$props;
	let { space } = $$props;
	let { host } = $$props;
	let { src } = $$props;
	let _id = id++;
	let loader_status = "pending";
	let app_id = null;
	let wrapper;
	let ready = false;
	let render_complete = false;
	let config;
	let loading_text = $_("common.loading") + "...";
	let active_theme_mode;

	async function mount_custom_css(target, css_string) {
		if (css_string) {
			let style = document.createElement("style");
			style.innerHTML = css_string;
			target.appendChild(style);
		}

		await mount_css$1(config.root + "/theme.css", document.head);
		if (!config.stylesheets) return;

		await Promise.all(config.stylesheets.map(stylesheet => {
			let absolute_link = stylesheet.startsWith("http:") || stylesheet.startsWith("https:");

			return mount_css$1(
				absolute_link
				? stylesheet
				: config.root + "/" + stylesheet,
				document.head
			);
		}));
	}

	function handle_darkmode(target) {
		let url = new URL(window.location.toString());
		let url_color_mode = url.searchParams.get("__theme");
		$$invalidate(15, active_theme_mode = theme_mode || url_color_mode || "system");

		if (active_theme_mode === "dark" || active_theme_mode === "light") {
			darkmode(target, active_theme_mode);
		} else {
			$$invalidate(15, active_theme_mode = use_system_theme(target));
		}

		return active_theme_mode;
	}

	function use_system_theme(target) {
		const theme = update_scheme();
		window?.matchMedia("(prefers-color-scheme: dark)")?.addEventListener("change", update_scheme);

		function update_scheme() {
			let _theme = (window?.matchMedia?.("(prefers-color-scheme: dark)").matches)
			? "dark"
			: "light";

			darkmode(target, _theme);
			return _theme;
		}

		return theme;
	}

	function darkmode(target, theme) {
		const dark_class_element = is_embed ? target.parentElement : document.body;
		const bg_element = is_embed ? target : target.parentElement;
		bg_element.style.background = "var(--body-background-fill)";

		if (theme === "dark") {
			dark_class_element.classList.add("dark");
		} else {
			dark_class_element.classList.remove("dark");
		}
	}

	let status = {
		message: "",
		load_status: "pending",
		status: "sleeping",
		detail: "SLEEPING"
	};

	let app;
	let css_ready = false;

	function handle_status(_status) {
		$$invalidate(13, status = _status);
	}

	onMount(async () => {
		if (window.__gradio_mode__ !== "website") {
			$$invalidate(15, active_theme_mode = handle_darkmode(wrapper));
		}

		//@ts-ignore
		const server_port = window.__GRADIO__SERVER_PORT__;

		const api_url = `http://localhost:${typeof server_port === "number" ? server_port : 7860}`
		;

		$$invalidate(16, app = await client(api_url, {
			status_callback: handle_status,
			normalise_files: false
		}));

		$$invalidate(12, config = app.config);
		window.__gradio_space__ = config.space_id;

		$$invalidate(13, status = {
			message: "",
			load_status: "complete",
			status: "running",
			detail: "RUNNING"
		});

		await mount_custom_css(wrapper, config.css);
		$$invalidate(17, css_ready = true);
		window.__is_colab__ = config.is_colab;

		if (config.dev_mode) {
			setTimeout(
				() => {
					const { host } = new URL(api_url);
					let url = new URL(`ws://${host}/dev/reload`);
					websocket = new WebSocket(url);

					websocket.onmessage = async function (event) {
						if (event.data === "CHANGE") {
							$$invalidate(16, app = await client(api_url, {
								status_callback: handle_status,
								normalise_files: false
							}));

							$$invalidate(12, config = app.config);
							window.__gradio_space__ = config.space_id;
						}
					};
				},
				200
			);
		}
	});

	setContext("upload_files", upload_files);
	let Blocks;
	let Login;

	async function get_blocks() {
		$$invalidate(18, Blocks = (await __vitePreload(() => import('./Blocks-eb3f181b.js').then(n => n.B),true?["./Blocks-eb3f181b.js","./Button-153ea7e7.js","./Button-d1784ebc.css","./Blocks-a31dde8d.css"]:void 0,import.meta.url)).default);
	}

	async function get_login() {
		$$invalidate(19, Login = (await __vitePreload(() => import('./Login-3ba48c34.js'),true?["./Login-3ba48c34.js","./index-5f1460d6.js","./index-40719bad.css","./InteractiveTextbox-a07b20ba.js","./Textbox-d96ff70c.js","./Button-153ea7e7.js","./Button-d1784ebc.css","./BlockTitle-10d6508b.js","./Copy-51753e2b.js","./Textbox-bcb3e022.css","./index-0cfc7b99.js","./index-6fd2ac73.css","./Login-abb2db13.css"]:void 0,import.meta.url)).default);
	}

	function load_demo() {
		if (config.auth_required) get_login(); else get_blocks();
	}

	// todo @hannahblair: translate these messages
	const discussion_message = {
		readable_error: {
			NO_APP_FILE: $_("errors.no_app_file"),
			CONFIG_ERROR: $_("errors.config_error"),
			BUILD_ERROR: $_("errors.build_error"),
			RUNTIME_ERROR: $_("errors.runtime_error"),
			PAUSED: $_("errors.space_paused")
		},
		title(error) {
			return encodeURIComponent($_("errors.space_not_working"));
		},
		description(error, site) {
			return encodeURIComponent(`Hello,\n\nFirstly, thanks for creating this space!\n\nI noticed that the space isn't working correctly because there is ${this.readable_error[error] || "an error"}.\n\nIt would be great if you could take a look at this because this space is being embedded on ${site}.\n\nThanks!`);
		}
	};

	onMount(async () => {
		intersecting.register(_id, wrapper);
	});

	$$self.$$.on_mount.push(function () {
		if (autoscroll === undefined && !('autoscroll' in $$props || $$self.$$.bound[$$self.$$.props['autoscroll']])) {
			console.warn("<Index> was created without expected prop 'autoscroll'");
		}

		if (version === undefined && !('version' in $$props || $$self.$$.bound[$$self.$$.props['version']])) {
			console.warn("<Index> was created without expected prop 'version'");
		}

		if (initial_height === undefined && !('initial_height' in $$props || $$self.$$.bound[$$self.$$.props['initial_height']])) {
			console.warn("<Index> was created without expected prop 'initial_height'");
		}

		if (app_mode === undefined && !('app_mode' in $$props || $$self.$$.bound[$$self.$$.props['app_mode']])) {
			console.warn("<Index> was created without expected prop 'app_mode'");
		}

		if (is_embed === undefined && !('is_embed' in $$props || $$self.$$.bound[$$self.$$.props['is_embed']])) {
			console.warn("<Index> was created without expected prop 'is_embed'");
		}

		if (control_page_title === undefined && !('control_page_title' in $$props || $$self.$$.bound[$$self.$$.props['control_page_title']])) {
			console.warn("<Index> was created without expected prop 'control_page_title'");
		}

		if (container === undefined && !('container' in $$props || $$self.$$.bound[$$self.$$.props['container']])) {
			console.warn("<Index> was created without expected prop 'container'");
		}

		if (info === undefined && !('info' in $$props || $$self.$$.bound[$$self.$$.props['info']])) {
			console.warn("<Index> was created without expected prop 'info'");
		}

		if (eager === undefined && !('eager' in $$props || $$self.$$.bound[$$self.$$.props['eager']])) {
			console.warn("<Index> was created without expected prop 'eager'");
		}

		if (client === undefined && !('client' in $$props || $$self.$$.bound[$$self.$$.props['client']])) {
			console.warn("<Index> was created without expected prop 'client'");
		}

		if (upload_files === undefined && !('upload_files' in $$props || $$self.$$.bound[$$self.$$.props['upload_files']])) {
			console.warn("<Index> was created without expected prop 'upload_files'");
		}

		if (space === undefined && !('space' in $$props || $$self.$$.bound[$$self.$$.props['space']])) {
			console.warn("<Index> was created without expected prop 'space'");
		}

		if (host === undefined && !('host' in $$props || $$self.$$.bound[$$self.$$.props['host']])) {
			console.warn("<Index> was created without expected prop 'host'");
		}

		if (src === undefined && !('src' in $$props || $$self.$$.bound[$$self.$$.props['src']])) {
			console.warn("<Index> was created without expected prop 'src'");
		}
	});

	const writable_props = [
		'autoscroll',
		'version',
		'initial_height',
		'app_mode',
		'is_embed',
		'theme_mode',
		'control_page_title',
		'container',
		'info',
		'eager',
		'mount_css',
		'client',
		'upload_files',
		'space',
		'host',
		'src'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Index> was created with unknown prop '${key}'`);
	});

	function blocks_ready_binding(value) {
		ready = value;
		$$invalidate(10, ready);
	}

	function blocks_render_complete_binding(value) {
		render_complete = value;
		$$invalidate(11, render_complete);
	}

	function embed_wrapper_binding(value) {
		wrapper = value;
		$$invalidate(9, wrapper);
	}

	$$self.$$set = $$props => {
		if ('autoscroll' in $$props) $$invalidate(0, autoscroll = $$props.autoscroll);
		if ('version' in $$props) $$invalidate(1, version = $$props.version);
		if ('initial_height' in $$props) $$invalidate(2, initial_height = $$props.initial_height);
		if ('app_mode' in $$props) $$invalidate(3, app_mode = $$props.app_mode);
		if ('is_embed' in $$props) $$invalidate(4, is_embed = $$props.is_embed);
		if ('theme_mode' in $$props) $$invalidate(23, theme_mode = $$props.theme_mode);
		if ('control_page_title' in $$props) $$invalidate(5, control_page_title = $$props.control_page_title);
		if ('container' in $$props) $$invalidate(6, container = $$props.container);
		if ('info' in $$props) $$invalidate(7, info = $$props.info);
		if ('eager' in $$props) $$invalidate(24, eager = $$props.eager);
		if ('mount_css' in $$props) $$invalidate(25, mount_css$1 = $$props.mount_css);
		if ('client' in $$props) $$invalidate(26, client = $$props.client);
		if ('upload_files' in $$props) $$invalidate(27, upload_files = $$props.upload_files);
		if ('space' in $$props) $$invalidate(8, space = $$props.space);
		if ('host' in $$props) $$invalidate(28, host = $$props.host);
		if ('src' in $$props) $$invalidate(29, src = $$props.src);
	};

	$$self.$capture_state = () => ({
		writable,
		default_mount_css: mount_css,
		id,
		create_intersection_store,
		intersecting,
		onMount,
		setContext,
		Embed,
		StatusTracker: Static,
		_: X,
		setupi18n,
		autoscroll,
		version,
		initial_height,
		app_mode,
		is_embed,
		theme_mode,
		control_page_title,
		container,
		info,
		eager,
		websocket,
		mount_css: mount_css$1,
		client,
		upload_files,
		space,
		host,
		src,
		_id,
		loader_status,
		app_id,
		wrapper,
		ready,
		render_complete,
		config,
		loading_text,
		active_theme_mode,
		mount_custom_css,
		handle_darkmode,
		use_system_theme,
		darkmode,
		status,
		app,
		css_ready,
		handle_status,
		Blocks,
		Login,
		get_blocks,
		get_login,
		load_demo,
		discussion_message,
		$_,
		$intersecting
	});

	$$self.$inject_state = $$props => {
		if ('autoscroll' in $$props) $$invalidate(0, autoscroll = $$props.autoscroll);
		if ('version' in $$props) $$invalidate(1, version = $$props.version);
		if ('initial_height' in $$props) $$invalidate(2, initial_height = $$props.initial_height);
		if ('app_mode' in $$props) $$invalidate(3, app_mode = $$props.app_mode);
		if ('is_embed' in $$props) $$invalidate(4, is_embed = $$props.is_embed);
		if ('theme_mode' in $$props) $$invalidate(23, theme_mode = $$props.theme_mode);
		if ('control_page_title' in $$props) $$invalidate(5, control_page_title = $$props.control_page_title);
		if ('container' in $$props) $$invalidate(6, container = $$props.container);
		if ('info' in $$props) $$invalidate(7, info = $$props.info);
		if ('eager' in $$props) $$invalidate(24, eager = $$props.eager);
		if ('websocket' in $$props) websocket = $$props.websocket;
		if ('mount_css' in $$props) $$invalidate(25, mount_css$1 = $$props.mount_css);
		if ('client' in $$props) $$invalidate(26, client = $$props.client);
		if ('upload_files' in $$props) $$invalidate(27, upload_files = $$props.upload_files);
		if ('space' in $$props) $$invalidate(8, space = $$props.space);
		if ('host' in $$props) $$invalidate(28, host = $$props.host);
		if ('src' in $$props) $$invalidate(29, src = $$props.src);
		if ('_id' in $$props) $$invalidate(36, _id = $$props._id);
		if ('loader_status' in $$props) $$invalidate(14, loader_status = $$props.loader_status);
		if ('app_id' in $$props) app_id = $$props.app_id;
		if ('wrapper' in $$props) $$invalidate(9, wrapper = $$props.wrapper);
		if ('ready' in $$props) $$invalidate(10, ready = $$props.ready);
		if ('render_complete' in $$props) $$invalidate(11, render_complete = $$props.render_complete);
		if ('config' in $$props) $$invalidate(12, config = $$props.config);
		if ('loading_text' in $$props) $$invalidate(21, loading_text = $$props.loading_text);
		if ('active_theme_mode' in $$props) $$invalidate(15, active_theme_mode = $$props.active_theme_mode);
		if ('status' in $$props) $$invalidate(13, status = $$props.status);
		if ('app' in $$props) $$invalidate(16, app = $$props.app);
		if ('css_ready' in $$props) $$invalidate(17, css_ready = $$props.css_ready);
		if ('Blocks' in $$props) $$invalidate(18, Blocks = $$props.Blocks);
		if ('Login' in $$props) $$invalidate(19, Login = $$props.Login);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*config*/ 4096) {
			if (config?.app_id) {
				app_id = config.app_id;
			}
		}

		if ($$self.$$.dirty[0] & /*ready, status*/ 9216) {
			$$invalidate(14, loader_status = !ready && status.load_status !== "error"
			? "pending"
			: !ready && status.load_status === "error"
				? "error"
				: status.load_status);
		}

		if ($$self.$$.dirty[0] & /*config, eager, $intersecting*/ 1090523136) {
			config && (eager || $intersecting[_id]) && load_demo();
		}

		if ($$self.$$.dirty[0] & /*render_complete, wrapper*/ 2560) {
			if (render_complete) {
				wrapper.dispatchEvent(new CustomEvent("render",
				{
						bubbles: true,
						cancelable: false,
						composed: true
					}));
			}
		}
	};

	return [
		autoscroll,
		version,
		initial_height,
		app_mode,
		is_embed,
		control_page_title,
		container,
		info,
		space,
		wrapper,
		ready,
		render_complete,
		config,
		status,
		loader_status,
		active_theme_mode,
		app,
		css_ready,
		Blocks,
		Login,
		$_,
		loading_text,
		discussion_message,
		theme_mode,
		eager,
		mount_css$1,
		client,
		upload_files,
		host,
		src,
		$intersecting,
		blocks_ready_binding,
		blocks_render_complete_binding,
		embed_wrapper_binding
	];
}

class Index extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal$1,
			{
				autoscroll: 0,
				version: 1,
				initial_height: 2,
				app_mode: 3,
				is_embed: 4,
				theme_mode: 23,
				control_page_title: 5,
				container: 6,
				info: 7,
				eager: 24,
				mount_css: 25,
				client: 26,
				upload_files: 27,
				space: 8,
				host: 28,
				src: 29
			},
			null,
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Index",
			options,
			id: create_fragment.name
		});
	}

	get autoscroll() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set autoscroll(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get version() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set version(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get initial_height() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set initial_height(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get app_mode() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set app_mode(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get is_embed() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set is_embed(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get theme_mode() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set theme_mode(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get control_page_title() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set control_page_title(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get container() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set container(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get info() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set info(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get eager() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set eager(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get mount_css() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set mount_css(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get client() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set client(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get upload_files() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set upload_files(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get space() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set space(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get host() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set host(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get src() {
		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set src(value) {
		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const ENTRY_CSS = "./assets/index-7d858894.css";
let FONTS;
FONTS = [];
function create_custom_element() {
  class GradioApp extends HTMLElement {
    constructor() {
      super();
      this.host = this.getAttribute("host");
      this.space = this.getAttribute("space");
      this.src = this.getAttribute("src");
      this.control_page_title = this.getAttribute("control_page_title");
      this.initial_height = this.getAttribute("initial_height") ?? "300px";
      this.is_embed = this.getAttribute("embed") ?? "true";
      this.container = this.getAttribute("container") ?? "true";
      this.info = this.getAttribute("info") ?? true;
      this.autoscroll = this.getAttribute("autoscroll");
      this.eager = this.getAttribute("eager");
      this.theme_mode = this.getAttribute("theme_mode");
      this.updating = false;
      this.loading = false;
    }
    async connectedCallback() {
      this.loading = true;
      if (this.app) {
        this.app.$destroy();
      }
      if (typeof FONTS !== "string") {
        FONTS.forEach((f) => mount_css(f, document.head));
      }
      await mount_css(ENTRY_CSS, document.head);
      const event = new CustomEvent("domchange", {
        bubbles: true,
        cancelable: false,
        composed: true
      });
      const observer = new MutationObserver((mutations) => {
        this.dispatchEvent(event);
      });
      observer.observe(this, { childList: true });
      this.app = new Index({
        target: this,
        props: {
          // embed source
          space: this.space ? this.space.trim() : this.space,
          src: this.src ? this.src.trim() : this.src,
          host: this.host ? this.host.trim() : this.host,
          // embed info
          info: this.info === "false" ? false : true,
          container: this.container === "false" ? false : true,
          is_embed: this.is_embed === "false" ? false : true,
          initial_height: this.initial_height,
          eager: this.eager === "true" ? true : false,
          // gradio meta info
          version: "3-45-0-beta-11",
          theme_mode: this.theme_mode,
          // misc global behaviour
          autoscroll: this.autoscroll === "true" ? true : false,
          control_page_title: this.control_page_title === "true" ? true : false,
          // injectables
          client,
          upload_files,
          // for gradio docs
          // TODO: Remove -- i think this is just for autoscroll behavhiour, app vs embeds
          app_mode: window.__gradio_mode__ === "app"
        }
      });
      if (this.updating) {
        this.setAttribute(this.updating.name, this.updating.value);
      }
      this.loading = false;
    }
    static get observedAttributes() {
      return ["src", "space", "host"];
    }
    attributeChangedCallback(name, old_val, new_val) {
      if ((name === "host" || name === "space" || name === "src") && new_val !== old_val) {
        this.updating = { name, value: new_val };
        if (this.loading)
          return;
        if (this.app) {
          this.app.$destroy();
        }
        this.space = null;
        this.host = null;
        this.src = null;
        if (name === "host") {
          this.host = new_val;
        } else if (name === "space") {
          this.space = new_val;
        } else if (name === "src") {
          this.src = new_val;
        }
        this.app = new Index({
          target: this,
          props: {
            // embed source
            space: this.space ? this.space.trim() : this.space,
            src: this.src ? this.src.trim() : this.src,
            host: this.host ? this.host.trim() : this.host,
            // embed info
            info: this.info === "false" ? false : true,
            container: this.container === "false" ? false : true,
            is_embed: this.is_embed === "false" ? false : true,
            initial_height: this.initial_height,
            eager: this.eager === "true" ? true : false,
            // gradio meta info
            version: "3-45-0-beta-11",
            theme_mode: this.theme_mode,
            // misc global behaviour
            autoscroll: this.autoscroll === "true" ? true : false,
            control_page_title: this.control_page_title === "true" ? true : false,
            // injectables
            client,
            upload_files,
            // for gradio docs
            // TODO: Remove -- i think this is just for autoscroll behavhiour, app vs embeds
            app_mode: window.__gradio_mode__ === "app"
          }
        });
        this.updating = false;
      }
    }
  }
  if (!customElements.get("gradio-app"))
    customElements.define("gradio-app", GradioApp);
}
create_custom_element();

export { IntlMessageFormat as I, Loader as L, Static as S, X, __vitePreload as _, split_css_unit as a, get_store_value as b, commonjsGlobal as c, derived as d, is_function as e, setupi18n as f, getDefaultExportFromCjs as g, identity as i, ne as n, post_data as p, spring as s, t, upload_files as u, writable as w };
//# sourceMappingURL=index-30423ace.js.map
