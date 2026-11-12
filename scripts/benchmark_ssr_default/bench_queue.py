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
from playwright.async_api import async_playwright

from bench import (
    READY_JS,
    VENVS,
    Server,
    load_page,
    new_context,
    summarize,
)

HERE = Path(__file__).parent
LABELS = {
    "fastapi": "FastAPI",
    "main": "main (6.31.0)",
    "base-csr": "7.0-dev",
    "pr-default": "7.0-dev + SSR (#14016)",
}
PAGE_KEYS = ("ttfb", "fcp", "lcp", "ready")


class QueueServer(Server):
    def __init__(self, arm, port, log_dir, work, iters):
        super().__init__(arm, "simple", port, log_dir)
        self.cmd[-1] = "ml_fastapi" if arm == "fastapi" else "ml_gradio"
        self.env.update(BENCH_WORK=work, BENCH_WORK_ITERS=str(iters), BENCH_WORK_S="1")
        self.log_path = log_dir / f"queue-{arm}-{work}-{port}.log"


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


async def _load(base, kind, k, stop, done, errors, inflight):
    timeout = aiohttp.ClientTimeout(total=None)
    connector = aiohttp.TCPConnector(limit=0)
    async with aiohttp.ClientSession(
        connector=connector, timeout=timeout, trust_env=False
    ) as s:

        async def one():
            if kind == "fastapi":
                async with s.post(base + "/api/greet", json={"data": ["load"]}) as r:
                    return r.status == 200 and b"Hello load!" in await r.read()
            async with s.post(
                base + "/gradio_api/call/greet", json={"data": ["load"]}
            ) as r:
                event_id = (await r.json())["event_id"]
            async with s.get(f"{base}/gradio_api/call/greet/{event_id}") as r:
                return b"Hello load!" in await r.read()

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

    def __init__(self, base, kind, k):
        self.stop = mp.Event()
        self.done, self.errors, self.inflight = (
            mp.Value("i", 0),
            mp.Value("i", 0),
            mp.Value("i", 0),
        )
        self.proc = mp.Process(
            target=_load_proc,
            args=(base, kind, k, self.stop, self.done, self.errors, self.inflight),
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
    browser, url, video_dir: Path, name: str, app="simple", headers=None
) -> dict | None:
    """One cold page load recorded on video, in a fresh browser profile. Returns
    the video's file name and when the page became interactive, in ms."""
    tmp = video_dir / f"_{name}"
    shutil.rmtree(tmp, ignore_errors=True)
    ctx = await browser.new_context(
        extra_http_headers=headers or {},
        record_video_dir=str(tmp),
        record_video_size={"width": 640, "height": 400},
        viewport={"width": 640, "height": 400},
    )
    page = await ctx.new_page()
    # A red page, turned white just before navigating: compose() starts each
    # clip at the first frame that isn't red. Chrome keeps the white page on
    # screen until the new page first paints, so the clip shows the wait.
    # The dot's animation makes Chrome repaint, so the recorder captures red frames.
    await page.set_content(
        "<style>@keyframes b{to{opacity:0}}</style><body style='background:#f00;margin:0'>"
        "<div id=d style='width:4px;height:4px;background:#e00;"
        "animation:b .1s infinite alternate'></div></body>"
    )
    await asyncio.sleep(0.8)
    ready_ms = None
    try:
        await page.evaluate(
            "() => new Promise((r) => { document.getElementById('d').remove();"
            " document.body.style.background = '#fff';"
            " requestAnimationFrame(() => requestAnimationFrame(r)); })"
        )
        await page.goto(url, wait_until="commit", timeout=180_000)
        ready_ms = await (
            await page.wait_for_function(READY_JS[app], polling=5, timeout=180_000)
        ).json_value()
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


def nav_start(video: Path) -> float:
    """Seconds into the video of the first frame that isn't red."""
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
            return i / 100
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
                    server = QueueServer(arm, port, log_dir, work, iters)
                    server.start()
                    kind = "fastapi" if arm == "fastapi" else "gradio"
                    try:
                        with Load(server.url, kind, k) as load:
                            await asyncio.sleep(args.warmup if k else 1)
                            d0, t0 = load.done.value, time.perf_counter()
                            runs = []
                            for _ in range(args.reps):
                                ctx = await new_context(browser)
                                runs.append(
                                    await load_page(
                                        ctx, server.url, "simple", event=False
                                    )
                                )
                                await ctx.close()
                            elapsed = time.perf_counter() - t0
                            jobs_per_s = (load.done.value - d0) / elapsed
                            inflight = load.inflight.value
                            video = None
                            if video_dir:
                                video = await recorded_load(
                                    browser, server.url, video_dir, f"{work}-k{k}-{arm}"
                                )
                            errors = load.errors.value
                    finally:
                        server.stop()
                    ok = [r for r in runs if r]
                    row = {
                        "arm": arm,
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
    ap.add_argument("--work", default="cpu,gpu")
    ap.add_argument("--levels", default="0,10,50", help="model calls kept in flight")
    ap.add_argument("--reps", type=int, default=10)
    ap.add_argument("--warmup", type=float, default=8)
    ap.add_argument("--port", type=int, default=18700)
    ap.add_argument("--out")
    ap.add_argument("--video-dir")
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
