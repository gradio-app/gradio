"""Page loads while the server is busy with a backlog of model calls.

For each arm and each fullness level K, a fresh server runs apps/ml_gradio.py
(or apps/ml_fastapi.py), and K background clients each keep one ~1 s model call
in flight: as soon as one returns, that client sends the next. Once the backlog
is steady, a new visitor opens the page in a fresh browser profile, and the
page load is timed (TTFB, first paint, interactive). One more load per cell is
recorded on video.

Two kinds of work (see apps/ml_work.py):
- cpu: pure-Python compute that holds the GIL
- gpu: a wait that releases the GIL, like a GPU kernel or a remote model

    python bench_queue.py --out results/queue.json --video-dir results/videos/queue
    python bench_queue.py --compose results/queue.json --video-dir results/videos/queue
"""

import argparse
import asyncio
import faulthandler
import json
import multiprocessing as mp
import os
import shutil
import statistics
import subprocess
import time
from pathlib import Path

import aiohttp
import psutil
from bench import (
    READY_JS,
    VENVS,
    Server,
    load_page,
    new_context,
    summarize,
)
from playwright.async_api import async_playwright

HERE = Path(__file__).parent
LABELS = {
    "fastapi": "FastAPI",
    "main": "main (6.31.0)",
    "base-csr": "7.0-dev",
    "pr-default": "7.0-dev + SSR (#14016)",
}
PAGE_KEYS = ("ttfb", "fcp", "lcp", "ready")
NAV_DELAY_S = 0.2  # from the red-to-white switch to navigation, in recorded loads

# The apps that can be benchmarked: their scripts, the API call the background
# clients make, and, for recorded loads, how the page looks while it waits.
QUEUE_APPS = {
    "simple": {
        "scripts": ("ml_gradio", "ml_fastapi"),
        "gradio_api": ("greet", ["load"]),
        "fastapi_api": ("/api/greet", {"data": ["load"]}),
        "color_scheme": "light",
        "wait_color": "#fff",
    },
    "upscale": {
        "scripts": ("upscale_gradio", "upscale_fastapi"),
        "gradio_api": ("enhance", [None]),
        "fastapi_api": ("/api/enhance", None),
        "color_scheme": "dark",
        "wait_color": "#0b0f19",
    },
}
# Interactive: the button is visible and all three images (the input, and the
# slider's two) have loaded.
READY_JS["upscale"] = """() => { const b = document.querySelector('#enhance');
    const imgs = [...document.querySelectorAll('#input img, #slider img')];
    return (b && b.getBoundingClientRect().width > 0 && imgs.length >= 3
            && imgs.every((i) => i.complete && i.naturalWidth > 0)) ? performance.now() : false }"""
SWEEP_S = 1.8  # the slider sweep after an upscale page becomes interactive


class QueueServer(Server):
    def __init__(self, arm, port, log_dir, work, iters, app="simple"):
        super().__init__(arm, "simple", port, log_dir)
        gradio_script, fastapi_script = QUEUE_APPS[app]["scripts"]
        self.cmd[-1] = fastapi_script if arm == "fastapi" else gradio_script
        self.env.update(BENCH_WORK=work, BENCH_WORK_ITERS=str(iters), BENCH_WORK_S="1")
        self.log_path = log_dir / f"queue-{app}-{arm}-{work}-{port}.log"


def calibrate(seconds: float = 1.0) -> int:
    """Iterations of ml_work.spin that take `seconds` on one idle core."""
    code = (
        "import sys, time; sys.path.insert(0, 'apps'); from ml_work import spin\n"
        "n = 3_000_000; ts = []\n"
        "for _ in range(5):\n"
        "    t = time.perf_counter(); spin(n); ts.append(time.perf_counter() - t)\n"
        "print(n / sorted(ts)[0])"
    )
    rate = float(
        subprocess.run(
            [str(VENVS / "base" / "bin" / "python"), "-c", code],
            cwd=HERE,
            capture_output=True,
            text=True,
            check=True,
        ).stdout
    )
    return int(rate * seconds)


# ------------------------------------------------------------- background load


async def _load(base, kind, app, k, stop, done, errors, inflight):
    timeout = aiohttp.ClientTimeout(total=None)
    connector = aiohttp.TCPConnector(limit=0)
    async with aiohttp.ClientSession(
        connector=connector, timeout=timeout, trust_env=False
    ) as s:

        async def one():
            if kind == "fastapi":
                path, body = QUEUE_APPS[app]["fastapi_api"]
                async with s.post(base + path, json=body) as r:
                    await r.read()
                    return r.status == 200
            api, data = QUEUE_APPS[app]["gradio_api"]
            async with s.post(
                f"{base}/gradio_api/call/{api}", json={"data": data}
            ) as r:
                event_id = (await r.json())["event_id"]
            async with s.get(f"{base}/gradio_api/call/{api}/{event_id}") as r:
                return b"event: complete" in await r.read()

        async def client():
            while not stop.is_set():
                with inflight.get_lock():
                    inflight.value += 1
                try:
                    ok = await one()
                except Exception:
                    ok = False
                with inflight.get_lock():
                    inflight.value -= 1
                counter = done if ok else errors
                with counter.get_lock():
                    counter.value += 1
                if not ok:
                    await asyncio.sleep(0.1)

        tasks = [asyncio.create_task(client()) for _ in range(k)]
        while not stop.is_set():
            await asyncio.sleep(0.05)
        for t in tasks:
            t.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)


def _load_proc(*args):
    asyncio.run(_load(*args))


class Load:
    """K clients, each keeping one model call in flight, in a separate process."""

    def __init__(self, base, kind, k, app="simple"):
        self.stop = mp.Event()
        self.done, self.errors, self.inflight = (
            mp.Value("i", 0),
            mp.Value("i", 0),
            mp.Value("i", 0),
        )
        self.proc = mp.Process(
            target=_load_proc,
            args=(base, kind, app, k, self.stop, self.done, self.errors, self.inflight),
            daemon=True,
        )

    def __enter__(self):
        self.proc.start()
        return self

    def __exit__(self, *exc):
        self.stop.set()
        self.proc.join(10)
        if self.proc.is_alive():
            self.proc.kill()


# ------------------------------------------------------------------ the run


async def recorded_load(
    browser,
    url,
    video_dir: Path,
    name: str,
    app="simple",
    headers=None,
    size=(640, 400),
) -> dict | None:
    """One cold page load recorded on video, in a fresh browser profile. Returns
    the video's file name and when the page became interactive, in ms. On the
    upscale app, it then sweeps the before/after slider, as a visitor would."""
    look = QUEUE_APPS.get(app, QUEUE_APPS["simple"])
    tmp = video_dir / f"_{name}"
    shutil.rmtree(tmp, ignore_errors=True)
    ctx = await browser.new_context(
        extra_http_headers=headers or {},
        record_video_dir=str(tmp),
        record_video_size={"width": size[0], "height": size[1]},
        viewport={"width": size[0], "height": size[1]},
        color_scheme=look["color_scheme"],
    )
    page = await ctx.new_page()
    # A red page, turned white NAV_DELAY_S before navigating: nav_start() finds
    # the switch in the video. Chrome keeps the white page on screen until the
    # new page first paints, so the clip shows the wait.
    # The dot's animation makes Chrome repaint, so the recorder captures red frames.
    await page.set_content(
        "<style>@keyframes b{to{opacity:0}}</style><body style='background:#f00;margin:0'>"
        "<div id=d style='width:4px;height:4px;background:#e00;"
        "animation:b .1s infinite alternate'></div></body>"
    )
    await asyncio.sleep(0.8)
    ready_ms = None
    try:
        # Turn the page white (the dot keeps repainting, in near-white, so the
        # recorder captures the switch), then navigate exactly NAV_DELAY_S later.
        async with page.expect_navigation(wait_until="commit", timeout=180_000):
            await page.evaluate(
                "([url, delay, color]) => { const d = document.getElementById('d');"
                " d.style.opacity = 0.99; d.style.background = color;"
                " document.body.style.background = color;"
                " setTimeout(() => { location.href = url; }, delay); }",
                [url, NAV_DELAY_S * 1000, look["wait_color"]],
            )
        ready_ms = await (
            await page.wait_for_function(READY_JS[app], polling=5, timeout=180_000)
        ).json_value()
        if app == "upscale":
            await sweep_slider(page)
        await asyncio.sleep(1.0)
    except Exception as e:
        print(f"recorded load failed: {name}: {e!r}", flush=True)
    video = page.video
    await ctx.close()
    if video is None or ready_ms is None:
        return None
    path = Path(await video.path())
    final = video_dir / f"{name}.webm"
    path.replace(final)
    shutil.rmtree(tmp, ignore_errors=True)
    return {"video": final.name, "ready_ms": ready_ms}


async def sweep_slider(page):
    """Drags the before/after slider right, then left, then back to the middle,
    over SWEEP_S seconds."""
    box = await page.locator(
        "#slider .slider-wrap, #slider .stage"
    ).first.bounding_box()
    y = box["y"] + box["height"] / 2
    at = lambda f: box["x"] + box["width"] * f  # noqa: E731
    await page.mouse.move(at(0.5), y)
    await page.mouse.down()
    for start, end, seconds in ((0.5, 0.88, 0.5), (0.88, 0.12, 0.8), (0.12, 0.5, 0.5)):
        steps = int(seconds * 60)
        for i in range(1, steps + 1):
            await page.mouse.move(at(start + (end - start) * i / steps), y)
            await asyncio.sleep(seconds / steps)
    await page.mouse.up()


async def median_take(browser, url, video_dir, name, takes, size, app) -> dict | None:
    """Records `takes` loads and keeps the one closest to their median, so the
    video shows a typical load rather than a lucky or unlucky one."""
    vs = []
    for i in range(takes):
        v = await recorded_load(
            browser, url, video_dir, f"{name}-take{i}", app=app, size=size
        )
        if v:
            vs.append(v)
    if not vs:
        return None
    med = statistics.median(v["ready_ms"] for v in vs)
    best = min(vs, key=lambda v: abs(v["ready_ms"] - med))
    for v in vs:
        if v is not best:
            (video_dir / v["video"]).unlink()
    final = video_dir / f"{name}.webm"
    (video_dir / best["video"]).replace(final)
    return {
        **best,
        "video": final.name,
        "ready_ms_all": sorted(v["ready_ms"] for v in vs),
    }


def nav_start(video: Path) -> float:
    """Seconds into the video at which navigation starts: NAV_DELAY_S after the
    first frame that isn't red."""
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(video)]
        + ["-vf", "fps=100,scale=4:4,format=rgb24", "-f", "rawvideo", "-"],
        capture_output=True,
        check=True,
    ).stdout
    frame = 4 * 4 * 3
    seen_red = False
    for i in range(len(raw) // frame):
        px = raw[i * frame : (i + 1) * frame]
        r, g, b = (sum(px[c::3]) / 16 for c in range(3))
        red = r > 200 and g < 60 and b < 60
        if red:
            seen_red = True
        elif seen_red:
            return i / 100 + NAV_DELAY_S
    raise RuntimeError(f"no red-to-white switch in {video}")


async def run(args):
    iters = calibrate()
    print(f"calibrated: {iters} iterations ~ 1 s of CPU work", flush=True)
    video_dir = Path(args.video_dir) if args.video_dir else None
    if video_dir:
        video_dir.mkdir(parents=True, exist_ok=True)
    out = Path(args.out)
    results = json.loads(out.read_text()) if out.exists() else {}
    results["meta"] = {
        "work_iters": iters,
        "load_avg_at_start": os.getloadavg(),
        "machine": f"{psutil.cpu_count()} cpus, {psutil.virtual_memory().total / 2**30:.0f} GB",
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    rows = results.setdefault("queue", [])
    log_dir = out.parent / "logs"
    port = args.port
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for work in args.work.split(","):
            for k in [int(x) for x in args.levels.split(",")]:
                for arm in args.arms.split(","):
                    server = QueueServer(arm, port, log_dir, work, iters, args.app)
                    server.start()
                    kind = "fastapi" if arm == "fastapi" else "gradio"
                    try:
                        with Load(server.url, kind, k, args.app) as load:
                            await asyncio.sleep(args.warmup if k else 1)
                            d0, t0 = load.done.value, time.perf_counter()
                            runs = []
                            for _ in range(args.reps):
                                ctx = await new_context(browser)
                                runs.append(
                                    await load_page(
                                        ctx, server.url, args.app, event=False
                                    )
                                )
                                await ctx.close()
                            elapsed = time.perf_counter() - t0
                            jobs_per_s = (load.done.value - d0) / elapsed
                            inflight = load.inflight.value
                            video = None
                            if video_dir:
                                video = await median_take(
                                    browser,
                                    server.url,
                                    video_dir,
                                    f"{work}-k{k}-{arm}",
                                    args.video_takes,
                                    args.video_size,
                                    args.app,
                                )
                            errors = load.errors.value
                    finally:
                        server.stop()
                    ok = [r for r in runs if r]
                    row = {
                        "arm": arm,
                        "app": args.app,
                        "work": work,
                        "k": k,
                        "failures": len(runs) - len(ok),
                        "jobs_per_s": jobs_per_s,
                        "inflight": inflight,
                        "load_errors": errors,
                        "video": video,
                        **{
                            key: summarize([r.get(key) for r in ok])
                            for key in PAGE_KEYS
                        },
                    }
                    rows[:] = [
                        r
                        for r in rows
                        if (r["arm"], r["work"], r["k"]) != (arm, work, k)
                    ] + [row]
                    out.write_text(json.dumps(results, indent=1))
                    med = lambda key: round(row[key].get("median", float("nan")))  # noqa: E731
                    print(
                        f"{work} k={k} {arm}: ttfb={med('ttfb')} fcp={med('fcp')} "
                        f"ready={med('ready')} ms, jobs/s={jobs_per_s:.2f}, "
                        f"in flight={inflight}, fail={row['failures']}",
                        flush=True,
                    )
        await browser.close()


# ----------------------------------------------------------------- videos


async def record_urls(specs, video_dir: Path, reps: int, out: Path, hf_auth: bool):
    """Records `reps` cold loads of each `cell/arm/app=url`, interleaved, and keeps
    the one whose interactive time is closest to the median, so the video shows
    a typical load rather than a lucky one."""
    headers = {}
    if hf_auth:
        from huggingface_hub import get_token

        headers = {"Authorization": f"Bearer {get_token()}"}
    video_dir.mkdir(parents=True, exist_ok=True)
    takes: dict[tuple, list] = {}
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for rep in range(reps):
            for spec in specs:
                key, url = spec.split("=", 1)
                cell, arm, app = key.split("/")
                v = await recorded_load(
                    browser, url, video_dir, f"{cell}-{arm}-{rep}", app, headers
                )
                takes.setdefault((cell, arm), []).append(v)
                print(
                    f"recorded {cell} {arm} rep {rep}: {v and round(v['ready_ms'])} ms",
                    flush=True,
                )
        await browser.close()
    results = json.loads(out.read_text()) if out.exists() else {}
    recorded = results.setdefault("recorded", [])
    for (cell, arm), vs in takes.items():
        ok = [v for v in vs if v]
        med = statistics.median(v["ready_ms"] for v in ok)
        best = min(ok, key=lambda v: abs(v["ready_ms"] - med))
        for v in ok:
            if v is not best:
                (video_dir / v["video"]).unlink()
        recorded[:] = [r for r in recorded if (r["cell"], r["arm"]) != (cell, arm)]
        recorded.append(
            {
                "cell": cell,
                "arm": arm,
                "video": best,
                "ready_ms_all": sorted(v["ready_ms"] for v in ok),
            }
        )
    out.write_text(json.dumps(results, indent=1))


def compose(results_path: Path, video_dir: Path, arms: list[str]):
    """One side-by-side video per cell: each arm's page load, starting at
    navigation, with a running clock and the time it became interactive."""
    data = json.loads(results_path.read_text())
    rows = [
        {**r, "cell": r.get("cell") or f"{r['work']}-k{r['k']}"}
        for r in data.get("queue", []) + data.get("recorded", [])
    ]
    font = "/System/Library/Fonts/Supplemental/Arial.ttf"
    for cell in sorted({r["cell"] for r in rows}):
        clips = [
            r
            for arm in arms
            for r in rows
            if r["arm"] == arm and r["cell"] == cell and r["video"]
        ]
        if len(clips) < 2:
            continue
        longest = max(c["video"]["ready_ms"] for c in clips) / 1000 + 1.0
        inputs, filters = [], []
        for i, c in enumerate(clips):
            v = c["video"]
            path = video_dir / v["video"]
            inputs += ["-i", str(path)]
            label = LABELS[c["arm"]].replace(":", r"\:")
            ready = f"interactive at {v['ready_ms'] / 1000:.2f} s"
            filters.append(
                f"[{i}:v]fps=100,trim=start={nav_start(path):.2f},setpts=PTS-STARTPTS,"
                f"fps=25,tpad=stop_mode=clone:stop_duration={longest:.2f},"
                f"trim=duration={longest:.2f},"
                f"pad=iw:ih+70:0:70:white,"
                f"drawtext=fontfile={font}:text='{label}':x=12:y=10:fontsize=24:fontcolor=black,"
                f"drawtext=fontfile={font}:text='%{{eif\\:t\\:d}}.%{{eif\\:mod(t*100\\,100)\\:d\\:2}} s':"
                f"x=w-tw-12:y=10:fontsize=24:fontcolor=0x555555,"
                f"drawtext=fontfile={font}:text='{ready}':x=12:y=42:fontsize=18:"
                f"fontcolor=0x1a7f37:enable='gte(t\\,{v['ready_ms'] / 1000:.3f})'[v{i}]"
            )
        n = len(clips)
        if n == 4:
            layout = "xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0"
        else:
            layout = f"hstack=inputs={n}"
        graph = ";".join(filters) + ";" + "".join(f"[v{i}]" for i in range(n)) + layout
        out = video_dir / f"compare-{cell}.mp4"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", *inputs]
            + ["-filter_complex", graph, "-c:v", "libx264", "-pix_fmt", "yuv420p"]
            + ["-movflags", "+faststart", str(out)],
            check=True,
        )
        print("wrote", out, flush=True)


def main():
    faulthandler.dump_traceback_later(900, repeat=True)
    ap = argparse.ArgumentParser()
    ap.add_argument("--arms", default="fastapi,main,base-csr,pr-default")
    ap.add_argument("--app", default="simple", choices=list(QUEUE_APPS))
    ap.add_argument("--work", default="cpu,gpu")
    ap.add_argument("--levels", default="0,10,50", help="model calls kept in flight")
    ap.add_argument("--reps", type=int, default=10)
    ap.add_argument("--warmup", type=float, default=8)
    ap.add_argument("--port", type=int, default=18700)
    ap.add_argument("--out")
    ap.add_argument("--video-dir")
    ap.add_argument(
        "--video-takes",
        type=int,
        default=1,
        help="recorded loads per cell; the one closest to the median is kept",
    )
    ap.add_argument(
        "--video-size",
        type=lambda v: tuple(int(x) for x in v.split("x")),
        default=(640, 400),
        help="browser viewport and video size, e.g. 860x538",
    )
    ap.add_argument("--compose", help="results file: build comparison videos only")
    ap.add_argument(
        "--record",
        action="append",
        default=[],
        help="cell/arm/app=url: record cold loads of an existing server instead",
    )
    ap.add_argument("--hf-auth", action="store_true", help="for private Spaces")
    args = ap.parse_args()
    if args.record:
        asyncio.run(
            record_urls(
                args.record,
                Path(args.video_dir),
                args.reps,
                Path(args.out),
                args.hf_auth,
            )
        )
    elif args.compose:
        compose(Path(args.compose), Path(args.video_dir), args.arms.split(","))
    else:
        asyncio.run(run(args))


if __name__ == "__main__":
    main()
