"""Charts from results/sweep_summary.json (run aggregate_sweep.py first)."""

import json

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

rows = json.load(open("results/sweep_summary.json"))
APPS = {
    "chat.py": "Streaming LLM app (SmolLM2-135M)",
    "app.py": "Diffusion image app (DiT-XL/2)",
}
STYLE = {
    "process": dict(
        color="#2a78d6", marker="o", linestyle="-", label='executor="process"'
    ),
    "thread": dict(
        color="#eb6834", marker="D", linestyle="--", label='executor="thread"'
    ),
}


def series(app, executor, key):
    picked = sorted(
        (r for r in rows if r["app"] == app and r["executor"] == executor),
        key=lambda r: r["rate"],
    )
    return [r["rate"] for r in picked], [r[key] for r in picked], picked


def figure(key, ylabel, title, path, solo=False):
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.2), dpi=160)
    for ax, (app, name) in zip(axes, APPS.items()):
        top = 0
        for executor, style in STYLE.items():
            x, y, picked = series(app, executor, key)
            ax.plot(x, y, linewidth=2, markersize=7, **style)
            for xi, yi in zip(x, y):
                text = f"{yi:.2f}" if key == "fn_p50" else f"{yi:.0f}"
                offset = 9 if executor == "process" else -15
                if key == "fn_p50":
                    offset = -15 if executor == "process" else 9
                ax.annotate(
                    text,
                    (xi, yi),
                    textcoords="offset points",
                    xytext=(0, offset),
                    ha="center",
                    fontsize=9,
                    color=style["color"],
                )
            top = max(top, *y)
        if solo:
            base = sum(r["solo"] for r in rows if r["app"] == app) / sum(
                1 for r in rows if r["app"] == app
            )
            ax.axhline(base, color="#898781", linewidth=1, linestyle=":")
            ax.annotate(
                "no traffic",
                (60, base),
                textcoords="offset points",
                xytext=(0, -12),
                ha="center",
                fontsize=9,
                color="#898781",
            )
        ax.set_title(name, fontsize=11, loc="left")
        ax.set_xlabel("Visitors arriving per second (1 in 4 submits a request)")
        ax.set_ylabel(ylabel)
        ax.set_xticks([20, 40, 80, 120])
        ax.set_xlim(10, 130)
        ax.set_ylim(0, top * 1.2)
        ax.grid(axis="y", color="#e1e0d9", linewidth=1)
        ax.set_axisbelow(True)
        for side in ("top", "right"):
            ax.spines[side].set_visible(False)
    axes[0].legend(frameon=False, loc="lower left")
    fig.suptitle(title, fontsize=13, x=0.01, ha="left")
    fig.tight_layout()
    fig.savefig(path)


figure(
    "per_min_mean",
    "Generations completed per minute",
    "Model throughput while a Space is flooded with visitors (Gradio 7.0-dev)",
    "results/charts/throughput.png",
)
figure(
    "fn_p50",
    "Seconds per generation (p50)",
    "Time for one generation while a Space is flooded with visitors (Gradio 7.0-dev)",
    "results/charts/generation_time.png",
    solo=True,
)
