"""Builds a side-by-side comparison video (MP4 and GIF) from two recorded loads.

The labels and frame are an HTML page (video_frame.html) screenshotted with
Playwright, so they get real typography; ffmpeg lays the recordings and a
running clock over them. Each clip starts at the frame where the visitor
navigates (see bench_queue.nav_start).

    python make_video.py results/queue-hero.json results/videos/hero \\
        --left fastapi --right pr-default --out results/videos/hero/fastapi-vs-ssr
"""

import argparse
import asyncio
import json
import subprocess
from pathlib import Path

from bench_queue import nav_start
from playwright.async_api import async_playwright

HERE = Path(__file__).parent
W, H = 1920, 1080
PREROLL = 0.6  # seconds of blank windows before the visitor navigates
HOLD = 2.4  # seconds held after the slower page becomes interactive
MONO = "/System/Library/Fonts/SFNSMono.ttf"

ARMS = {
    "fastapi": ("FastAPI", "def route &middot; 40-thread pool"),
    "main": ("Gradio 6 (main)", "queue &middot; one process"),
    "base-csr": ("Gradio 7.0-dev", "queue &middot; gateway + app process"),
    "pr-default": (
        "Gradio 7.0-dev + SSR",
        "#14016 &middot; queue &middot; gateway + app process",
    ),
}


async def render_layers(spec: dict, out: Path) -> dict:
    """Screenshots the frame's layers and returns where the dynamic parts go."""
    html = (HERE / "video_frame.html").read_text()
    for key, value in spec.items():
        html = html.replace("{{" + key + "}}", str(value))
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport={"width": W, "height": H})
        await page.set_content(html)
        await page.evaluate("document.fonts.ready")
        boxes = await page.evaluate(
            """() => Object.fromEntries([...document.querySelectorAll('[data-box]')].map(
                (e) => { const r = e.getBoundingClientRect();
                         return [e.dataset.box, [r.x, r.y, r.width, r.height]] }))"""
        )
        await page.screenshot(path=out / "base.png")
        await page.evaluate("document.body.className = 'top'")
        await page.screenshot(path=out / "top.png", omit_background=True)
        await page.evaluate("document.body.className = ''")
        for name in ("loading-l", "loading-r", "ready-l", "ready-r"):
            await page.evaluate(f"document.body.dataset.show = '{name}'")
            await page.locator(f"[data-pill='{name}']").screenshot(
                path=out / f"{name}.png", omit_background=True
            )
            boxes[name] = await page.locator(f"[data-pill='{name}']").evaluate(
                "(e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height] }"
            )
        await browser.close()
    return boxes


def clock(t0: float, ready: float, x: int, y: int) -> str:
    """A running clock that starts at t0 and freezes, in green, at `ready`."""
    run = (
        f"drawtext=fontfile={MONO}:fontsize=48:fontcolor=0xE2E8F0:borderw=1:bordercolor=0xE2E8F0:"
        f"x={x}-tw:y={y}:"
        f"text='%{{eif\\:max(0\\,t-{t0})\\:d}}.%{{eif\\:mod(max(0\\,t-{t0})*100\\,100)\\:d\\:2}}s':"
        f"enable='lt(t\\,{t0 + ready:.3f})'"
    )
    done = (
        f"drawtext=fontfile={MONO}:fontsize=48:fontcolor=0x4ADE80:borderw=1:bordercolor=0x4ADE80:"
        f"x={x}-tw:y={y}:text='{ready:.2f}s':enable='gte(t\\,{t0 + ready:.3f})'"
    )
    return f"{run},{done}"


def build(results: Path, video_dir: Path, left: str, right: str, out: Path, k: int):
    rows = {r["arm"]: r for r in json.loads(results.read_text())["queue"]}
    clips = [rows[left], rows[right]]
    ready = [c["video"]["ready_ms"] / 1000 for c in clips]
    medians = [c["ready"]["median"] / 1000 for c in clips]
    takes = len(clips[0]["video"].get("ready_ms_all", [1]))
    duration = PREROLL + max(ready) + HOLD
    layers = out.parent / f"{out.name}-layers"
    layers.mkdir(parents=True, exist_ok=True)
    (ln, ld), (rn, rd) = ARMS[left], ARMS[right]
    spec = {
        "k": k,
        "left_name": ln,
        "left_desc": ld,
        "right_name": rn,
        "right_desc": rd,
        "left_ready": f"{ready[0]:.2f}",
        "right_ready": f"{ready[1]:.2f}",
        "left_median": f"{medians[0]:.2f}",
        "right_median": f"{medians[1]:.2f}",
        "reps": clips[0]["ready"]["n"],
        "takes": takes,
    }
    boxes = asyncio.run(render_layers(spec, layers))
    sx, sy, sw, sh = (round(v) for v in boxes["slot-l"])
    rx, ry, _, _ = (round(v) for v in boxes["slot-r"])
    cxl, cyl, cwl, _ = boxes["clock-l"]
    cxr, cyr, cwr, _ = boxes["clock-r"]

    inputs = []
    for name in ("base", "top", "loading-l", "loading-r", "ready-l", "ready-r"):
        inputs += [
            "-loop",
            "1",
            "-t",
            f"{duration:.2f}",
            "-i",
            str(layers / f"{name}.png"),
        ]
    for c in clips:
        inputs += ["-i", str(video_dir / c["video"]["video"])]
    f = []
    for i, c in enumerate(clips):
        start = nav_start(video_dir / c["video"]["video"])
        f.append(
            f"[{6 + i}:v]fps=100,trim=start={start:.2f},setpts=PTS-STARTPTS,fps=30,"
            f"tpad=start_mode=add:color=white:start_duration={PREROLL}:stop_mode=clone:stop_duration={duration:.2f},"
            f"trim=duration={duration:.2f},scale={sw}:{sh}:flags=lanczos,setsar=1[c{i}]"
        )
    pill = lambda name: [round(v) for v in boxes[name][:2]]  # noqa: E731
    (llx, lly), (lrx, lry) = pill("loading-l"), pill("loading-r")
    (rlx, rly), (rrx, rry) = pill("ready-l"), pill("ready-r")
    t_l, t_r = PREROLL + ready[0], PREROLL + ready[1]
    f.append(
        f"[0:v]fps=30,format=rgba[b];[b][c0]overlay={sx}:{sy}[v1];[v1][c1]overlay={rx}:{ry}[v2];"
        f"[v2][1:v]overlay=0:0[v3];"
        f"[v3][2:v]overlay={llx}:{lly}:enable='lt(t\\,{t_l:.3f})'[v4];"
        f"[v4][3:v]overlay={lrx}:{lry}:enable='lt(t\\,{t_r:.3f})'[v5];"
        f"[v5][4:v]overlay={rlx}:{rly}:enable='gte(t\\,{t_l:.3f})'[v6];"
        f"[v6][5:v]overlay={rrx}:{rry}:enable='gte(t\\,{t_r:.3f})'[v7];"
        f"[v7]{clock(PREROLL, ready[0], round(cxl + cwl), round(cyl))},"
        f"{clock(PREROLL, ready[1], round(cxr + cwr), round(cyr))},format=yuv420p[out]"
    )
    mp4 = out.with_suffix(".mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(f)]
        + [
            "-map",
            "[out]",
            "-r",
            "30",
            "-c:v",
            "libx264",
            "-crf",
            "18",
            "-preset",
            "slow",
        ]
        + ["-movflags", "+faststart", str(mp4)],
        check=True,
    )
    gif = out.with_suffix(".gif")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp4), "-filter_complex"]
        + [
            (
                "fps=15,scale=1200:-1:flags=lanczos,split[a][b];"
                "[a]palettegen=max_colors=128:stats_mode=diff[p];"
                "[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle"
            )
        ]
        + [str(gif)],
        check=True,
    )
    print("wrote", mp4, gif, flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("results")
    ap.add_argument("video_dir")
    ap.add_argument("--left", default="fastapi")
    ap.add_argument("--right", default="pr-default")
    ap.add_argument("--k", type=int, default=50, help="model calls in flight")
    ap.add_argument("--out", required=True, help="output path without extension")
    args = ap.parse_args()
    build(
        Path(args.results),
        Path(args.video_dir),
        args.left,
        args.right,
        Path(args.out),
        args.k,
    )


if __name__ == "__main__":
    main()
