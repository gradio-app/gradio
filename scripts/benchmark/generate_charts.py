import argparse
import json
from collections import defaultdict
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

"""Generate comparison charts from benchmark results.

Usage:
    # Compare results across directories (each labeled by directory name)
    python scripts/benchmark/generate_charts.py \
        benchmark_results/v4 benchmark_results/cl10 benchmark_results/cl100 \
        --output-dir benchmark_results/charts

    # Custom labels for each directory
    python scripts/benchmark/generate_charts.py \
        benchmark_results/v4 benchmark_results/cl10 \
        --labels "cl=1" "cl=10" \
        --output-dir benchmark_results/charts
"""

# Stable color palette for up to 8 series
COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"]

PHASE_COLORS = {
    "queue_wait": "#e74c3c",
    "preprocess": "#9b59b6",
    "fn_call": "#3498db",
    "postprocess": "#f39c12",
    "streaming_diff": "#1abc9c",
}


def find_app_dirs(base: Path) -> dict[str, Path]:
    """Find all app timestamp directories within a results dir.

    Returns {app_name: path} mapping.
    """
    apps = {}
    for d in sorted(base.iterdir()):
        if not d.is_dir() or not (d / "summary.json").exists():
            continue
        summary = json.loads((d / "summary.json").read_text())
        app_path = summary.get("app", "")
        app_name = Path(app_path).stem
        if app_name:
            apps[app_name] = d
    return apps


def discover_tiers(app_dir: Path) -> list[int]:
    """Discover available tiers from a results directory."""
    tiers = []
    for d in sorted(app_dir.iterdir()):
        if d.is_dir() and d.name.startswith("tier_"):
            try:
                tiers.append(int(d.name.replace("tier_", "")))
            except ValueError:
                pass
    return sorted(tiers)


def load_all_data(
    result_dirs: dict[str, Path],
) -> tuple[dict, list[str], list[str], list[int]]:
    """Load client latencies and server traces from all result directories.

    Returns:
        data: nested dict data[app][label][tier] = {"client_latencies": [...], "traces": [...]}
        apps: sorted list of app names found
        labels: list of series labels (in input order)
        tiers: sorted union of all tiers found
    """
    data: dict = defaultdict(lambda: defaultdict(dict))
    all_apps: set[str] = set()
    all_tiers: set[int] = set()

    for label, base_dir in result_dirs.items():
        app_dirs = find_app_dirs(base_dir)
        for app_name, app_dir in app_dirs.items():
            all_apps.add(app_name)
            tiers = discover_tiers(app_dir)
            for tier in tiers:
                all_tiers.add(tier)
                tier_dir = app_dir / f"tier_{tier}"
                clients = []
                cl_path = tier_dir / "client_latencies.jsonl"
                if cl_path.exists():
                    clients = [json.loads(line) for line in cl_path.read_text().splitlines() if line.strip()]
                traces = []
                tr_path = tier_dir / "traces.jsonl"
                if tr_path.exists():
                    traces = [json.loads(line) for line in tr_path.read_text().splitlines() if line.strip()]
                data[app_name][label][tier] = {"client_latencies": clients, "traces": traces}

    apps = sorted(all_apps)
    labels = list(result_dirs.keys())
    tiers = sorted(all_tiers)
    return data, apps, labels, tiers


def _get_client_percentiles(tier_data: dict) -> dict[str, float]:
    """Return p50, p90, p99 for client latencies."""
    lats = [r["latency_ms"] for r in tier_data.get("client_latencies", []) if r.get("success")]
    if not lats:
        return {"p50": 0.0, "p90": 0.0, "p99": 0.0}
    arr = np.array(lats)
    return {
        "p50": float(np.percentile(arr, 50)),
        "p90": float(np.percentile(arr, 90)),
        "p99": float(np.percentile(arr, 99)),
    }


def _get_client_p50(tier_data: dict) -> float:
    return _get_client_percentiles(tier_data)["p50"]


def _get_trace_phase_p50(tier_data: dict, phase: str) -> float:
    traces = tier_data.get("traces", [])
    vals = [t[f"{phase}_ms"] for t in traces]
    return float(np.percentile(vals, 50)) if vals else 0.0


def chart_client_latency_by_label(data: dict, apps: list[str], labels: list[str], tiers: list[int], output_dir: Path):
    """Bar chart: client p50/p90/p99 at max tier for each app, one subplot per app."""
    max_tier = max(tiers)
    percentiles = ["p50", "p90", "p99"]
    pct_colors = {"p50": "#2ecc71", "p90": "#f39c12", "p99": "#e74c3c"}

    n_apps = len(apps)
    fig, axes = plt.subplots(1, n_apps, figsize=(4 * n_apps, 5), sharey=False, squeeze=False)
    axes = axes[0]

    for idx, app in enumerate(apps):
        ax = axes[idx]
        x = np.arange(len(labels))
        n_pcts = len(percentiles)
        width = 0.8 / n_pcts

        for i, pct in enumerate(percentiles):
            vals = [_get_client_percentiles(data[app].get(label, {}).get(max_tier, {}))[pct] for label in labels]
            bars = ax.bar(x + i * width, vals, width, label=pct, color=pct_colors[pct], alpha=0.85)
            for bar, val in zip(bars, vals):
                if val > 0:
                    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height(),
                            f"{val:.0f}", ha="center", va="bottom", fontsize=7)

        ax.set_xticks(x + width)
        ax.set_xticklabels(labels, fontsize=9)
        ax.set_title(app, fontsize=9)
        if idx == 0:
            ax.set_ylabel("Latency (ms)")
            ax.legend(fontsize=8)
        ax.grid(True, alpha=0.3, axis="y")
        # Add headroom so labels don't clip
        ymax = ax.get_ylim()[1]
        ax.set_ylim(top=ymax * 1.15)

    fig.suptitle(f"Client Latency at {max_tier} Concurrent Users", fontsize=12, y=1.02)
    fig.tight_layout()
    fig.savefig(output_dir / "client_latency_by_label.png", dpi=150, bbox_inches="tight")
    plt.close(fig)


def chart_latency_vs_tier(data: dict, apps: list[str], labels: list[str], tiers: list[int], output_dir: Path):
    """Line chart: client p50 across tiers, one subplot per app, lines per label."""
    n_apps = len(apps)
    fig, axes = plt.subplots(1, n_apps, figsize=(4 * n_apps, 4), sharey=False, squeeze=False)
    axes = axes[0]

    for idx, app in enumerate(apps):
        ax = axes[idx]
        for i, label in enumerate(labels):
            p50s = [_get_client_p50(data[app].get(label, {}).get(tier, {})) for tier in tiers]
            ax.plot(tiers, p50s, marker="o", label=label, color=COLORS[i % len(COLORS)], linewidth=2)
        ax.set_xlabel("Concurrent Users")
        if idx == 0:
            ax.set_ylabel("Client p50 (ms)")
        ax.set_title(app, fontsize=9)
        ax.set_xscale("log")
        ax.set_xticks(tiers)
        ax.set_xticklabels([str(t) for t in tiers])
        ax.grid(True, alpha=0.3)
        if idx == 0:
            ax.legend(fontsize=8)

    fig.suptitle("Client p50 Latency vs Concurrency", fontsize=12, y=1.02)
    fig.tight_layout()
    fig.savefig(output_dir / "latency_vs_tier.png", dpi=150, bbox_inches="tight")
    plt.close(fig)


def chart_phase_breakdown(data: dict, apps: list[str], labels: list[str], tiers: list[int], output_dir: Path):
    """Stacked bar: server phase breakdown at max tier for each (app, label) combo."""
    max_tier = max(tiers)
    phases = list(PHASE_COLORS.keys())
    n_apps = len(apps)
    fig, axes = plt.subplots(1, n_apps, figsize=(4 * n_apps, 5), sharey=False, squeeze=False)
    axes = axes[0]

    for idx, app in enumerate(apps):
        ax = axes[idx]
        x = np.arange(len(labels))

        bottom = np.zeros(len(labels))
        for phase in phases:
            vals = np.array([
                _get_trace_phase_p50(data[app].get(label, {}).get(max_tier, {}), phase)
                for label in labels
            ])
            ax.bar(x, vals, bottom=bottom, label=phase, color=PHASE_COLORS[phase], alpha=0.85, width=0.6)
            bottom += vals

        ax.set_xticks(x)
        ax.set_xticklabels(labels, fontsize=9)
        ax.set_title(app, fontsize=9)
        if idx == 0:
            ax.set_ylabel("Time (ms)")
            ax.legend(fontsize=7)
        ax.grid(True, alpha=0.3, axis="y")

    fig.suptitle(f"Server Phase Breakdown at {max_tier} Concurrent Users (p50)", fontsize=12, y=1.02)
    fig.tight_layout()
    fig.savefig(output_dir / "phase_breakdown.png", dpi=150, bbox_inches="tight")
    plt.close(fig)


def chart_improvement_factor(data: dict, apps: list[str], labels: list[str], tiers: list[int], output_dir: Path):
    """Grouped bar chart: paired bars per label showing baseline vs target, with multiplier annotation."""
    if len(labels) < 2:
        return
    max_tier = max(tiers)
    baseline_label = labels[0]

    n_apps = len(apps)
    fig, axes = plt.subplots(1, n_apps, figsize=(4 * n_apps, 5), sharey=False, squeeze=False)
    axes = axes[0]

    for idx, app in enumerate(apps):
        ax = axes[idx]
        base_p50 = _get_client_p50(data[app].get(baseline_label, {}).get(max_tier, {}))

        x = np.arange(len(labels) - 1)
        width = 0.35

        base_vals = [base_p50] * (len(labels) - 1)
        target_vals = []
        for target_label in labels[1:]:
            target_vals.append(_get_client_p50(data[app].get(target_label, {}).get(max_tier, {})))

        ax.bar(x - width / 2, base_vals, width, label=baseline_label, color="#e74c3c", alpha=0.85)
        ax.bar(x + width / 2, target_vals, width, label="comparison", color="#3498db", alpha=0.85)

        for i, (bv, tv) in enumerate(zip(base_vals, target_vals)):
            factor = bv / tv if tv > 0 else 0
            y_pos = max(bv, tv)
            ax.annotate(f"{factor:.1f}x",
                        xy=(i, y_pos), xytext=(0, 8),
                        textcoords="offset points", ha="center", va="bottom",
                        fontsize=9, fontweight="bold", color="#555555")

        ax.set_xticks(x)
        ax.set_xticklabels(labels[1:], fontsize=9)
        ax.set_title(app, fontsize=9)
        if idx == 0:
            ax.set_ylabel("Client p50 (ms)")
            ax.legend(fontsize=8)
        ax.grid(True, alpha=0.3, axis="y")
        ymax = ax.get_ylim()[1]
        ax.set_ylim(top=ymax * 1.15)

    fig.suptitle(f"Latency Improvement vs {baseline_label} at {max_tier} Concurrent Users",
                 fontsize=12, y=1.02)
    fig.tight_layout()
    fig.savefig(output_dir / "improvement_factor.png", dpi=150, bbox_inches="tight")
    plt.close(fig)


def chart_sse_overhead(data: dict, apps: list[str], labels: list[str], tiers: list[int], output_dir: Path):
    """Grouped bar chart: client p50 vs (queue_wait + total) p50, showing SSE overhead."""
    max_tier = max(tiers)
    n_apps = len(apps)
    fig, axes = plt.subplots(1, n_apps, figsize=(4 * n_apps, 5), sharey=False, squeeze=False)
    axes = axes[0]
    x = np.arange(len(labels))
    width = 0.35

    for idx, app in enumerate(apps):
        ax = axes[idx]
        client_p50s = []
        server_p50s = []

        for label in labels:
            tier_data = data[app].get(label, {}).get(max_tier, {})
            client_p50s.append(_get_client_p50(tier_data))
            traces = tier_data.get("traces", [])
            server_vals = [t["queue_wait_ms"] + t["total_ms"] for t in traces]
            server_p50s.append(float(np.percentile(server_vals, 50)) if server_vals else 0.0)

        ax.bar(x - width / 2, client_p50s, width, label="Client p50", color="#e74c3c", alpha=0.85)
        ax.bar(x + width / 2, server_p50s, width, label="queue_wait + total p50", color="#3498db", alpha=0.85)

        for i, (cv, sv) in enumerate(zip(client_p50s, server_p50s)):
            overhead = cv - sv
            pct = (overhead / cv * 100) if cv > 0 else 0
            y_pos = max(cv, sv)
            ax.annotate(f"+{overhead:.0f}ms\n({pct:.0f}%)",
                        xy=(i, y_pos), xytext=(0, 8),
                        textcoords="offset points", ha="center", va="bottom",
                        fontsize=7, color="#555555")

        ax.set_xticks(x)
        ax.set_xticklabels(labels, fontsize=9)
        ax.set_title(app, fontsize=9)
        if idx == 0:
            ax.set_ylabel("Time (ms)")
            ax.legend(fontsize=7)
        ax.grid(True, alpha=0.3, axis="y")
        ymax = ax.get_ylim()[1]
        ax.set_ylim(top=ymax * 1.15)

    fig.suptitle(f"Client Latency vs Server Time at {max_tier} Concurrent Users\n(gap = SSE protocol overhead)",
                 fontsize=12, y=1.04)
    fig.tight_layout()
    fig.savefig(output_dir / "sse_overhead.png", dpi=150, bbox_inches="tight")
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(
        description="Generate comparison charts from benchmark results",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "result_dirs",
        nargs="+",
        help="One or more benchmark result directories to compare",
    )
    parser.add_argument(
        "--labels",
        nargs="+",
        default=None,
        help="Labels for each result directory (defaults to directory names)",
    )
    parser.add_argument(
        "--output-dir",
        default="benchmark_results/charts",
        help="Output directory for charts (default: benchmark_results/charts)",
    )
    args = parser.parse_args()

    dirs = [Path(d) for d in args.result_dirs]
    if args.labels:
        if len(args.labels) != len(dirs):
            parser.error(f"Got {len(args.labels)} labels for {len(dirs)} directories")
        dir_labels = args.labels
    else:
        dir_labels = [d.name for d in dirs]

    result_dirs = dict(zip(dir_labels, dirs))
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Loading data...")
    data, apps, labels, tiers = load_all_data(result_dirs)
    print(f"  Apps: {apps}")
    print(f"  Labels: {labels}")
    print(f"  Tiers: {tiers}")

    print("Generating charts...")
    chart_client_latency_by_label(data, apps, labels, tiers, output_dir)
    print("  -> client_latency_by_label.png")
    chart_latency_vs_tier(data, apps, labels, tiers, output_dir)
    print("  -> latency_vs_tier.png")
    chart_phase_breakdown(data, apps, labels, tiers, output_dir)
    print("  -> phase_breakdown.png")
    chart_improvement_factor(data, apps, labels, tiers, output_dir)
    print("  -> improvement_factor.png")
    chart_sse_overhead(data, apps, labels, tiers, output_dir)
    print("  -> sse_overhead.png")

    print(f"\nAll charts saved to {output_dir}/")


if __name__ == "__main__":
    main()
