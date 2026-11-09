"""Benchmarks gradio-app/gradio#14016 (SSR by default) against 7.0-dev and plain FastAPI.

Suites:
  startup   spawn the app N times, time each phase until the first HTTP 200, and
            record idle memory of the whole process tree (Python, gateway, Node)
  pageload  headless Chromium: cold, warm and throttled (Lighthouse "mobile")
            loads, with navigation timings, bytes, time until the app is
            interactive, and the first event's round trip
  http      a multi-process aiohttp load generator against GET /, GET /config
            and the app's API at several concurrency levels
  tabs      many browser tabs opened at once, in one browser profile (one user)
            or in separate profiles (many users), then an event fired in all

Arms are described by `ARMS` below. Each needs a virtualenv (see README.md).
Local runs start every server itself. `--remote arm=url` points the pageload,
http and tabs suites at already running servers, such as Hugging Face Spaces.
"""

from __future__ import annotations

import argparse
import asyncio
import faulthandler
import json
import multiprocessing as mp
import os
import statistics
import subprocess
import threading
import time
from pathlib import Path

import aiohttp
import psutil
from playwright.async_api import async_playwright

HERE = Path(__file__).parent
APPS_DIR = HERE / "apps"
VENVS = Path(os.environ.get("BENCH_VENVS", HERE / ".venvs"))

# arm -> (virtualenv, extra environment). GRADIO_SSR_MODE is removed from the
# environment first, so "unset" really means each version's default.
ARMS = {
    "fastapi": ("base", {}),
    "main": ("main", {}),  # main (6.x) default: client-side rendering
    "base-csr": ("base", {}),  # 7.0-dev default: client-side rendering
    "base-ssr": (
        "base",
        {"GRADIO_SSR_MODE": "true"},
    ),  # 7.0-dev, SSR opted in (as on Spaces today)
    "pr-default": ("pr", {}),  # #14016 default: SSR, since a patched Node is installed
    "pr-csr": ("pr", {"GRADIO_SSR_MODE": "false"}),  # #14016 with SSR turned off
}
APPS = {"simple": "simple_gradio", "many_tabs": "many_tabs"}

# How each app signals "interactive", and how to run one event through the UI.
READY_JS = {
    "simple": """() => { const b = document.querySelector('#greet');
        const i = document.querySelector('#name textarea, #name input');
        return (b && i && b.getBoundingClientRect().width > 0) ? performance.now() : false }""",
    "many_tabs": """() => { const i = document.querySelector('#text_input textarea');
        return (i && i.getBoundingClientRect().width > 0) ? performance.now() : false }""",
}
EVENT_JS = {
    "simple": ("#name textarea, #name input", "#greet", "#out textarea, #out input"),
    "many_tabs": ("#text_input textarea", None, "#text_output textarea"),
}
# Waits for the output to contain this run's random input, so a stale output from
# an earlier event can't count. With a button, the value gets 50 ms to reach the
# component before the click (a click in the same tick sends the old value), and
# timing starts at the click. Without one, the `.change` event fires on input.
RUN_EVENT_JS = """async ([inSel, btnSel, outSel]) => {
    const el = document.querySelector(inSel);
    const expected = 'bench' + Math.random().toString(36).slice(2, 8);
    let t0 = performance.now();
    el.value = expected;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    if (btnSel) {
        await new Promise((r) => setTimeout(r, 50));
        t0 = performance.now();
        document.querySelector(btnSel).click();
    }
    return await new Promise((resolve) => {
        const check = () => {
            const o = document.querySelector(outSel);
            if (o && o.value && o.value.includes(expected)) resolve(performance.now() - t0);
            else setTimeout(check, 2);
        };
        check();
    });
}"""
TAB_SWITCH_JS = """async () => {
    const tab = [...document.querySelectorAll('button[role=tab]')].find(b => b.textContent.includes('Video'));
    const t0 = performance.now();
    tab.click();
    return await new Promise((resolve) => {
        const check = () => {
            const label = [...document.querySelectorAll('label, span')].find(
                e => e.textContent.trim() === 'Upload Video' && e.getBoundingClientRect().width > 0);
            if (label) resolve(performance.now() - t0); else setTimeout(check, 2);
        };
        check();
    });
}"""
LCP_INIT_JS = """window.__lcp = 0;
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; })
    .observe({ type: 'largest-contentful-paint', buffered: true });"""
NAV_METRICS_JS = """() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = Object.fromEntries(performance.getEntriesByType('paint').map(p => [p.name, p.startTime]));
    const res = performance.getEntriesByType('resource');
    const kind = (r) => /\\.m?js(\\?|$)/.test(r.name) ? 'js' : /\\.css(\\?|$)/.test(r.name) ? 'css' : 'other';
    const out = { requests: res.length + 1, js_requests: 0, css_requests: 0,
        transfer_bytes: nav.transferSize, decoded_bytes: nav.decodedBodySize,
        js_bytes: 0, css_bytes: 0, js_decoded_bytes: 0, css_decoded_bytes: 0 };
    for (const r of res) {
        const k = kind(r);
        out.transfer_bytes += r.transferSize; out.decoded_bytes += r.decodedBodySize;
        if (k !== 'other') { out[k + '_requests'] += 1; out[k + '_bytes'] += r.transferSize;
            out[k + '_decoded_bytes'] += r.decodedBodySize; }
    }
    return { ...out, ttfb: nav.responseStart, html_transfer_bytes: nav.transferSize,
        html_decoded_bytes: nav.decodedBodySize, dom_content_loaded: nav.domContentLoadedEventEnd,
        load: nav.loadEventEnd, fcp: paint['first-contentful-paint'] ?? null, lcp: window.__lcp || null };
}"""
# Lighthouse's default mobile profile: 150ms RTT, 1.6 Mbps down, 750 Kbps up, 4x CPU.
THROTTLE = {"latency": 150, "download": 1.6e6 / 8, "upload": 750e3 / 8, "cpu": 4}


def auth_headers() -> dict:
    """A bearer token for private Spaces (see --hf-auth), passed to every request."""
    token = os.environ.get("BENCH_AUTH_TOKEN")
    return {"Authorization": f"Bearer {token}"} if token else {}


async def new_context(browser):
    ctx = await browser.new_context(extra_http_headers=auth_headers())
    await ctx.add_init_script(LCP_INIT_JS)
    return ctx


# ---------------------------------------------------------------- servers


def tree(pid: int) -> list[psutil.Process]:
    try:
        p = psutil.Process(pid)
        return [p, *p.children(recursive=True)]
    except psutil.NoSuchProcess:
        return []


def tree_rss_mb(pid: int) -> float:
    total = 0
    for p in tree(pid):
        try:
            total += p.memory_info().rss
        except psutil.NoSuchProcess:
            pass
    return total / 2**20


def tree_cpu_seconds(pid: int) -> float:
    total = 0.0
    for p in tree(pid):
        try:
            t = p.cpu_times()
            total += t.user + t.system
        except psutil.NoSuchProcess:
            pass
    return total


class Server:
    def __init__(self, arm: str, app: str, port: int, log_dir: Path):
        self.arm, self.app, self.port = arm, app, port
        self.url = f"http://127.0.0.1:{port}"
        venv, extra = ARMS[arm]
        env = {k: v for k, v in os.environ.items() if not k.startswith("GRADIO_")}
        env.update(extra)
        env.update(
            GRADIO_ANALYTICS_ENABLED="False",
            BENCH_PORT=str(port),
            PYTHONUNBUFFERED="1",
        )
        script = "simple_fastapi" if arm == "fastapi" else APPS[app]
        self.cmd = [
            str(VENVS / venv / "bin" / "python"),
            str(APPS_DIR / "run.py"),
            script,
        ]
        self.env = env
        log_dir.mkdir(parents=True, exist_ok=True)
        self.log_path = log_dir / f"{arm}-{app}-{port}.log"

    def start(self, timeout: float = 120) -> dict:
        """Starts the server and returns its startup timings, in ms since spawn."""
        import socket

        with socket.socket() as sock:
            if sock.connect_ex(("127.0.0.1", self.port)) == 0:
                raise RuntimeError(f"port {self.port} is already in use")
        self.log = open(self.log_path, "w")
        t0 = time.time()
        self.env["BENCH_T0"] = repr(t0)
        self.proc = subprocess.Popen(
            self.cmd, env=self.env, stdout=self.log, stderr=subprocess.STDOUT
        )
        first_get_ms = html_bytes = None
        session = requests_session()
        while time.time() - t0 < timeout:
            if self.proc.poll() is not None:
                raise RuntimeError(f"{self.arm} exited, see {self.log_path}")
            t = time.perf_counter()
            try:
                r = session.get(self.url + "/", timeout=30)
                if r.status_code == 200:
                    first_get_ms = (time.perf_counter() - t) * 1000
                    html_bytes = len(r.content)
                    break
            except Exception:
                pass
            time.sleep(0.005)
        else:
            raise RuntimeError(f"{self.arm} not ready after {timeout}s")
        t_ready = time.time()
        stamps = self._read_stamps(timeout=10)
        return {
            "import_ms": (stamps["t_import"] - t0) * 1000,
            "build_ms": (stamps["t_build"] - stamps["t_import"]) * 1000,
            "launch_ms": (stamps["t_launch"] - stamps["t_build"]) * 1000,
            "ready_ms": (t_ready - t0) * 1000,
            "first_get_ms": first_get_ms,
            "html_bytes": html_bytes,
            "ssr": stamps.get("ssr", False),
        }

    def _read_stamps(self, timeout: float) -> dict:
        deadline = time.time() + timeout
        while time.time() < deadline:
            for line in self.log_path.read_text().splitlines():
                if line.startswith("BENCH_STARTUP "):
                    return json.loads(line.removeprefix("BENCH_STARTUP "))
            time.sleep(0.01)
        raise RuntimeError(f"no BENCH_STARTUP line in {self.log_path}")

    def processes(self) -> int:
        return len(tree(self.proc.pid))

    def rss_mb(self) -> float:
        return tree_rss_mb(self.proc.pid)

    def cpu_seconds(self) -> float:
        return tree_cpu_seconds(self.proc.pid)

    def stop(self):
        procs = tree(self.proc.pid)
        for p in reversed(procs):
            try:
                p.terminate()
            except psutil.NoSuchProcess:
                pass
        _, alive = psutil.wait_procs(procs, timeout=8)
        for p in alive:
            p.kill()
        self.log.close()
        wait_port_free(self.port)


def requests_session():
    import requests

    s = requests.Session()
    s.trust_env = False
    return s


def wait_port_free(port: int, timeout: float = 15):
    import socket

    deadline = time.time() + timeout
    while time.time() < deadline:
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return
        time.sleep(0.05)


def summarize(values: list[float]) -> dict:
    values = [v for v in values if v is not None]
    if not values:
        return {}
    values = sorted(values)
    q = lambda p: values[min(len(values) - 1, int(round(p * (len(values) - 1))))]  # noqa: E731
    return {
        "n": len(values),
        "mean": statistics.fmean(values),
        "median": statistics.median(values),
        "p90": q(0.90),
        "p99": q(0.99),
        "min": values[0],
        "max": values[-1],
        "stdev": statistics.stdev(values) if len(values) > 1 else 0.0,
    }


# ---------------------------------------------------------------- suites


def suite_startup(arms, apps, reps, log_dir) -> list[dict]:
    """Interleaves arms so background load on the machine hits them all equally."""
    rows: dict[tuple, list] = {}
    for rep in range(reps):
        for app in apps:
            for arm in arms:
                if arm == "fastapi" and app != "simple":
                    continue
                server = Server(arm, app, 18600, log_dir)
                timing = server.start()
                time.sleep(3)  # let lazy imports and background threads settle
                timing["idle_rss_mb"] = server.rss_mb()
                timing["processes"] = server.processes()
                server.stop()
                rows.setdefault((arm, app), []).append(timing)
                print(
                    f"startup {rep} {arm}/{app}: ready {timing['ready_ms']:.0f}ms "
                    f"ssr={timing['ssr']} rss={timing['idle_rss_mb']:.0f}MB",
                    flush=True,
                )
    out = []
    for (arm, app), runs in rows.items():
        out.append(
            {
                "arm": arm,
                "app": app,
                "ssr": runs[0]["ssr"],
                "processes": runs[0]["processes"],
                "html_bytes": runs[0]["html_bytes"],
                **{
                    k: summarize([r[k] for r in runs])
                    for k in (
                        "import_ms",
                        "build_ms",
                        "launch_ms",
                        "ready_ms",
                        "first_get_ms",
                        "idle_rss_mb",
                    )
                },
            }
        )
    return out


async def load_page(context, url, app, throttle=None, event=True, tab_switch=False):
    """One page load. Gives up after 3 minutes and returns None, so a stuck load
    is counted as a failure instead of hanging the run."""
    page = await context.new_page()
    step = {"at": "start"}
    try:
        return await asyncio.wait_for(
            _load_page(page, context, url, app, throttle, event, tab_switch, step), 180
        )
    except Exception as e:
        state = None
        try:
            ins, _, outs = EVENT_JS[app]
            state = await asyncio.wait_for(
                page.evaluate(
                    f"[document.querySelector('{ins}')?.value, document.querySelector('{outs}')?.value]"
                ),
                5,
            )
        except Exception:
            pass
        print(
            f"page load failed at {step['at']}: {url} {app} throttle={bool(throttle)} "
            f"(input, output)={state}: {e!r}",
            flush=True,
        )
        return None
    finally:
        await page.close()


async def _load_page(page, context, url, app, throttle, event, tab_switch, step):
    if throttle:
        cdp = await context.new_cdp_session(page)
        await cdp.send("Network.enable")
        await cdp.send(
            "Network.emulateNetworkConditions",
            {
                "offline": False,
                "latency": throttle["latency"],
                "downloadThroughput": throttle["download"],
                "uploadThroughput": throttle["upload"],
            },
        )
        await cdp.send("Emulation.setCPUThrottlingRate", {"rate": throttle["cpu"]})
    step["at"] = "goto"
    await page.goto(url, wait_until="commit", timeout=120_000)
    step["at"] = "ready"
    ready = await (
        await page.wait_for_function(READY_JS[app], polling=5, timeout=120_000)
    ).json_value()
    step["at"] = "load"
    await page.wait_for_load_state("load")
    await asyncio.sleep(0.3)  # let LCP settle
    metrics = await page.evaluate(NAV_METRICS_JS)
    metrics["ready"] = ready
    if event:
        step["at"] = "first_event"
        metrics["first_event_ms"] = await page.evaluate(
            RUN_EVENT_JS, list(EVENT_JS[app])
        )
        # Button clicks default to trigger_mode="once": a click while the previous
        # event is still pending is dropped, and the output can arrive before the
        # event completes. Wait it out (untimed) before the second event.
        await asyncio.sleep(0.5)
        step["at"] = "second_event"
        metrics["second_event_ms"] = await page.evaluate(
            RUN_EVENT_JS, list(EVENT_JS[app])
        )
    if tab_switch:
        step["at"] = "tab_switch"
        metrics["tab_switch_ms"] = await page.evaluate(TAB_SWITCH_JS)
    return metrics


PAGE_KEYS = (
    "ttfb",
    "fcp",
    "lcp",
    "dom_content_loaded",
    "load",
    "ready",
    "first_event_ms",
    "second_event_ms",
    "tab_switch_ms",
    "requests",
    "js_requests",
    "css_requests",
    "transfer_bytes",
    "decoded_bytes",
    "html_transfer_bytes",
    "html_decoded_bytes",
    "js_bytes",
    "css_bytes",
    "js_decoded_bytes",
    "css_decoded_bytes",
)


async def suite_pageload(targets, reps, throttled_reps) -> list[dict]:
    rows: dict[tuple, list] = {}
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        warm_contexts = {}
        for key, (url, app) in targets.items():
            ctx = await new_context(browser)
            await load_page(
                ctx, url, app
            )  # prime the HTTP cache and the server's first event
            warm_contexts[key] = ctx
            print(f"primed {key}", flush=True)
        for rep in range(reps):
            for key, (url, app) in targets.items():
                ctx = await new_context(browser)
                rows.setdefault((*key, "cold"), []).append(
                    await load_page(ctx, url, app, tab_switch=app == "many_tabs")
                )
                await ctx.close()
                rows.setdefault((*key, "warm"), []).append(
                    await load_page(warm_contexts[key], url, app)
                )
            print(f"pageload rep {rep} done", flush=True)
        for rep in range(throttled_reps):
            for key, (url, app) in targets.items():
                ctx = await new_context(browser)
                rows.setdefault((*key, "throttled"), []).append(
                    await load_page(
                        ctx, url, app, throttle=THROTTLE, tab_switch=app == "many_tabs"
                    )
                )
                await ctx.close()
            print(f"pageload throttled rep {rep} done", flush=True)
        await browser.close()
    return [
        {
            "arm": arm,
            "app": app,
            "profile": profile,
            **{k: summarize([r.get(k) for r in runs]) for k in PAGE_KEYS},
        }
        for (arm, app, profile), runs in (
            (k, [r for r in v if r]) for k, v in rows.items()
        )
    ]


# ------------------------------------------------- http load generator


async def _http_worker(base, scenario, concurrency, duration, warmup, count):
    lat, errors = [], 0
    connector = aiohttp.TCPConnector(limit=0, force_close=False)
    timeout = aiohttp.ClientTimeout(total=60)

    async def one(s):
        if scenario == "page":
            async with s.get(base + "/") as r:
                await r.read()
                return r.status == 200
        if scenario == "config":
            async with s.get(base + "/config") as r:
                await r.read()
                return r.status == 200
        if scenario == "api-fastapi":
            async with s.post(base + "/api/greet", json={"data": ["bench"]}) as r:
                return (await r.json())["data"][0] == "Hello bench!"
        async with s.post(
            base + "/gradio_api/call/greet", json={"data": ["bench"]}
        ) as r:
            event_id = (await r.json())["event_id"]
        async with s.get(f"{base}/gradio_api/call/greet/{event_id}") as r:
            return b"Hello bench!" in await r.read()

    async with aiohttp.ClientSession(
        connector=connector, timeout=timeout, trust_env=False, headers=auth_headers()
    ) as s:
        start = time.perf_counter()
        deadline = start + warmup + duration

        async def loop():
            nonlocal errors
            n = 0
            while (count and n < count) or (
                not count and time.perf_counter() < deadline
            ):
                t = time.perf_counter()
                try:
                    ok = await one(s)
                except Exception:
                    ok = False
                end = time.perf_counter()
                n += 1
                if count or t >= start + warmup:
                    if ok:
                        lat.append((end - t) * 1000)
                    else:
                        errors += 1

        await asyncio.gather(*(loop() for _ in range(concurrency)))
    return lat, errors


def _http_proc(args):
    return asyncio.run(_http_worker(*args))


def run_http(base, scenario, concurrency, duration=10.0, warmup=2.0, count=0, procs=4):
    procs = max(1, min(procs, concurrency))
    shares = [
        concurrency // procs + (1 if i < concurrency % procs else 0)
        for i in range(procs)
    ]
    per_count = count // procs if count else 0
    t = time.perf_counter()
    with mp.get_context("spawn").Pool(procs) as pool:
        results = pool.map(
            _http_proc,
            [(base, scenario, c, duration, warmup, per_count) for c in shares],
        )
    wall = time.perf_counter() - t
    lat = [x for r in results for x in r[0]]
    errors = sum(r[1] for r in results)
    elapsed = duration if not count else wall
    return {
        "concurrency": concurrency,
        "ok": len(lat),
        "errors": errors,
        "rps": len(lat) / elapsed,
        "latency_ms": summarize(lat),
    }


class Sampler(threading.Thread):
    """Samples CPU and memory of a server's process tree while a test runs."""

    def __init__(self, server):
        super().__init__(daemon=True)
        self.server, self.stop_flag, self.rss = server, threading.Event(), []

    def run(self):
        self.cpu0, self.t0 = self.server.cpu_seconds(), time.time()
        while not self.stop_flag.wait(0.25):
            self.rss.append(self.server.rss_mb())

    def finish(self) -> dict:
        self.stop_flag.set()
        self.join()
        cpu = self.server.cpu_seconds() - self.cpu0
        return {
            "server_cpu_cores": cpu / (time.time() - self.t0),
            "server_peak_rss_mb": max(self.rss, default=self.server.rss_mb()),
        }


def suite_http(
    targets, servers, levels, duration, only=None, count=300, pause=0.0
) -> list[dict]:
    out = []
    for (arm, app), (url, _) in targets.items():
        scenarios = ["page", "api-fastapi" if arm == "fastapi" else "api-gradio"]
        if arm != "fastapi":
            scenarios.insert(1, "config")
        if only:
            scenarios = [x for x in scenarios if x.split("-")[0] in only]
        for scenario in scenarios:
            for c in levels:
                time.sleep(
                    pause
                )  # Spaces' edge rate-limits a client after a few thousand requests
                sampler = Sampler(servers[(arm, app)]) if servers else None
                if sampler:
                    sampler.start()
                if c == 1:
                    res = run_http(url, scenario, 1, count=count, procs=1)
                else:
                    res = run_http(url, scenario, c, duration=duration)
                if sampler:
                    res.update(sampler.finish())
                res.update(arm=arm, app=app, scenario=scenario.split("-")[0])
                out.append(res)
                print(
                    f"http {arm} {scenario} c={c}: {res['rps']:.0f} rps "
                    f"p50={res['latency_ms'].get('median', 0):.1f}ms err={res['errors']}",
                    flush=True,
                )
    return out


# ---------------------------------------------------------------- tabs


async def suite_tabs(targets, servers, counts, modes, pause=0.0) -> list[dict]:
    out = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for k in counts:
            for mode in modes:
                for (arm, app), (url, _) in targets.items():
                    await asyncio.sleep(pause)
                    server = servers.get((arm, app)) if servers else None
                    out.append(
                        await _tabs_once(browser, url, app, arm, k, mode, server)
                    )
                    r = out[-1]
                    print(
                        f"tabs {arm}/{app} k={k} {mode}: ready p50={r['ready_ms'].get('median', 0):.0f} "
                        f"max={r['ready_ms'].get('max', 0):.0f} event p50={r['event_ms'].get('median', 0):.0f} "
                        f"fail={r['failures']}",
                        flush=True,
                    )
        await browser.close()
    return out


async def _tabs_once(browser, url, app, arm, k, mode, server):
    if mode == "shared":
        ctx = await new_context(browser)
        contexts = [ctx]
        pages = [await ctx.new_page() for _ in range(k)]
    else:
        contexts = [await new_context(browser) for _ in range(k)]
        pages = [await c.new_page() for c in contexts]
    cpu0 = server.cpu_seconds() if server else None
    t0 = time.perf_counter()

    async def open_one(page):
        try:
            await page.goto(url, wait_until="commit", timeout=120_000)
            h = await page.wait_for_function(READY_JS[app], polling=5, timeout=120_000)
            return await h.json_value(), time.perf_counter() - t0
        except Exception:
            return None, None

    opened = await asyncio.gather(*(open_one(p) for p in pages))
    all_ready_s = time.perf_counter() - t0
    live = [p for p, (r, _) in zip(pages, opened) if r is not None]
    rss_open = server.rss_mb() if server else None
    visible = await pages[-1].evaluate("document.visibilityState")

    async def event_one(page):
        try:
            return await asyncio.wait_for(
                page.evaluate(RUN_EVENT_JS, list(EVENT_JS[app])), 120
            )
        except Exception:
            return None

    t1 = time.perf_counter()
    events = await asyncio.gather(*(event_one(p) for p in live))
    all_events_s = time.perf_counter() - t1
    result = {
        "arm": arm,
        "app": app,
        "tabs": k,
        "mode": mode,
        "ready_ms": summarize([r for r, _ in opened]),
        "all_ready_s": all_ready_s,
        "event_ms": summarize(events),
        "all_events_s": all_events_s,
        "failures": (k - len(live)) + sum(e is None for e in events),
        "visibility": visible,
    }
    if server:
        result["server_cpu_s"] = server.cpu_seconds() - cpu0
        result["server_rss_mb_open"] = rss_open
    for c in contexts:
        await c.close()
    return result


# ---------------------------------------------------------------- main


def main():
    faulthandler.dump_traceback_later(
        900, repeat=True
    )  # shows where a hung run is stuck
    ap = argparse.ArgumentParser()
    ap.add_argument("--suites", default="startup,pageload,http,tabs")
    ap.add_argument("--arms", default=",".join(ARMS))
    ap.add_argument("--apps", default=",".join(APPS))
    ap.add_argument(
        "--remote",
        action="append",
        default=[],
        help="arm/app=url, e.g. pr-default/simple=https://x.hf.space; skips local servers",
    )
    ap.add_argument("--startup-reps", type=int, default=10)
    ap.add_argument("--page-reps", type=int, default=15)
    ap.add_argument("--throttled-reps", type=int, default=5)
    ap.add_argument("--http-levels", default="1,10,50,100")
    ap.add_argument("--http-duration", type=float, default=10)
    ap.add_argument("--http-scenarios", help="subset of page,config,api")
    ap.add_argument(
        "--http-count", type=int, default=300, help="requests at concurrency 1"
    )
    ap.add_argument("--http-pause", type=float, default=0, help="seconds between runs")
    ap.add_argument("--tab-counts", default="1,10,25,50")
    ap.add_argument("--tab-modes", default="shared,isolated")
    ap.add_argument("--tab-pause", type=float, default=0, help="seconds between runs")
    ap.add_argument(
        "--hf-auth",
        action="store_true",
        help="send the local Hugging Face token, for private Spaces",
    )
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    if args.hf_auth:
        from huggingface_hub import get_token

        os.environ["BENCH_AUTH_TOKEN"] = get_token()
    suites = args.suites.split(",")
    arms = args.arms.split(",")
    apps = args.apps.split(",")
    out_path = Path(args.out)
    results = json.loads(out_path.read_text()) if out_path.exists() else {}
    results["meta"] = {
        **results.get("meta", {}),
        "machine": f"{psutil.cpu_count()} cpus, {psutil.virtual_memory().total / 2**30:.0f} GB",
        "node": subprocess.run(
            ["node", "--version"], capture_output=True, text=True
        ).stdout.strip(),
        "load_avg_at_start": os.getloadavg(),
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "remote": bool(args.remote),
    }

    def save():
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(results, indent=1))

    log_dir = out_path.parent / "logs"
    if "startup" in suites and not args.remote:
        results["startup"] = suite_startup(arms, apps, args.startup_reps, log_dir)
        save()

    rest = [s for s in suites if s != "startup"]
    if not rest:
        return
    servers, targets = {}, {}
    if args.remote:
        for spec in args.remote:
            key, url = spec.split("=", 1)
            arm, app = key.split("/")
            targets[(arm, app)] = (url.rstrip("/"), app)
    else:
        port = 18600
        for app in apps:
            for arm in arms:
                if arm == "fastapi" and app != "simple":
                    continue
                s = Server(arm, app, port, log_dir)
                s.start()
                servers[(arm, app)] = s
                targets[(arm, app)] = (s.url, app)
                port += 20
    try:
        if "pageload" in suites:
            results["pageload"] = asyncio.run(
                suite_pageload(targets, args.page_reps, args.throttled_reps)
            )
            save()
        if "http" in suites:
            http_targets = {k: v for k, v in targets.items() if k[1] == "simple"}
            results["http"] = suite_http(
                http_targets,
                servers,
                [int(x) for x in args.http_levels.split(",")],
                args.http_duration,
                only=args.http_scenarios.split(",") if args.http_scenarios else None,
                count=args.http_count,
                pause=args.http_pause,
            )
            save()
        if "tabs" in suites:
            results["tabs"] = asyncio.run(
                suite_tabs(
                    targets,
                    servers,
                    [int(x) for x in args.tab_counts.split(",")],
                    args.tab_modes.split(","),
                    pause=args.tab_pause,
                )
            )
            save()
    finally:
        for s in servers.values():
            s.stop()


if __name__ == "__main__":
    main()
