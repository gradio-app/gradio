"""Render the recorded latency comparison (requires Matplotlib)."""

import gzip
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["svg.fonttype"] = "none"

ROOT = Path(__file__).resolve().parent
callbacks = json.loads(
    gzip.decompress((ROOT / "results/callbacks.json.gz").read_bytes())
)
http = json.loads(gzip.decompress((ROOT / "results/http.json.gz").read_bytes()))
fig, (ax, bx) = plt.subplots(
    1, 2, figsize=(14, 7), gridspec_kw={"width_ratios": [1.6, 1]}, facecolor="#fafafa"
)
colors = {"thread": "#607d9e", "process": "#e17b28"}
labels = [
    r["name"].replace("streaming_echo", "streaming echo") for r in callbacks["cases"]
]
y = np.arange(len(labels))
for i, row in enumerate(callbacks["cases"]):
    vals = [row["summary"][m]["median_ms"] for m in colors]
    ax.plot(vals, [i, i], color="#c0c0c0", linewidth=2, zorder=1)
for mode, color in colors.items():
    vals = [row["summary"][mode]["median_ms"] for row in callbacks["cases"]]
    ax.scatter(vals, y, color=color, s=65, label=mode.capitalize(), zorder=3)
ax.set_yticks(y, labels)
ax.invert_yaxis()
ax.set_xscale("log")
ax.set_xlim(0.025, 1000)
ax.set_xticks(
    [0.05, 0.2, 1, 5, 20, 100, 500], ["0.05", "0.2", "1", "5", "20", "100", "500"]
)
ax.set_xlabel("Median callback latency (ms, logarithmic scale)")
ax.set_title("Executor boundary · unchanged demo functions", fontsize=12, pad=20)
fig.legend(
    *ax.get_legend_handles_labels(),
    loc="upper right",
    bbox_to_anchor=(0.96, 0.91),
    ncol=2,
    frameon=False,
)
y2 = np.arange(len(http["cases"]))
for offset, (mode, color) in zip([-0.16, 0.16], colors.items()):
    vals = [r["summary"][mode]["median_ms"] for r in http["cases"]]
    bx.barh(y2 + offset, vals, height=0.28, color=color)
    for pos, value in zip(y2 + offset, vals):
        bx.text(value + 0.04, pos, f"{value:.2f}", va="center", fontsize=11)
bx.set_yticks(y2, [r["name"].replace("greet", "hello_world") for r in http["cases"]])
bx.invert_yaxis()
bx.set_xlim(
    0, max(r["summary"][m]["median_ms"] for r in http["cases"] for m in colors) * 1.28
)
bx.set_xlabel("Median HTTP/SSE latency (ms)")
bx.set_title("Actual queued requests · localhost", fontsize=12, pad=20)
for axis in (ax, bx):
    axis.set_facecolor("#fafafa")
    axis.spines[["top", "right"]].set_visible(False)
    axis.grid(axis="x", alpha=0.15)
    axis.set_axisbelow(True)
fig.text(
    0.04,
    0.95,
    "Gradio: the latency cost of a persistent process",
    fontsize=22,
    weight="bold",
    color="#202832",
)
fig.text(
    0.04,
    0.90,
    "M5 Mac · one worker per endpoint · no autoscaling · lower latency is better",
    fontsize=13,
    color="#566171",
)
small = callbacks["cases"][0]["summary"]
large = callbacks["cases"][3]["summary"]
cold = [
    r["cold_process_ms"] / 1000 for r in callbacks["cases"] if "cold_process_ms" in r
]
fig.text(
    0.04,
    0.20,
    f"Tiny callback: +{small['process']['median_ms'] - small['thread']['median_ms']:.2f} ms   |   1024×1024 image: +{large['process']['median_ms'] - large['thread']['median_ms']:.2f} ms",
    fontsize=15,
    weight="bold",
)
fig.text(
    0.04,
    0.145,
    f"First process call: {min(cold):.2f}–{max(cold):.2f} s including startup and callback work; excluded from warm medians.",
    fontsize=11,
)
fig.text(
    0.04,
    0.085,
    "Three alternating rounds per case; sequential requests, identical outputs checked. Callback measurements exclude HTTP and preprocessing.\nStreaming demo retains its 50 ms delay per chunk. HTTP tests cover text/arithmetic only. Small local experiment, not a universal latency guarantee.\nSource and raw samples included in demo/process_executor · 22 Oct 2026.",
    fontsize=9,
    color="#626975",
    linespacing=1.5,
    va="top",
)
fig.subplots_adjust(left=0.24, right=0.96, top=0.77, bottom=0.31, wspace=0.5)
for ext in ("png", "svg"):
    fig.savefig(ROOT / f"results/latency.{ext}", dpi=180, facecolor=fig.get_facecolor())

svg = ROOT / "results/latency.svg"
svg.write_text("\n".join(line.rstrip() for line in svg.read_text().splitlines()) + "\n")
