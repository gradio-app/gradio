#!/usr/bin/env python3
"""Analyze profiling output from sampler.sh + playwright run.

Usage: analyze.py <results_dir>

Reads totals.csv, processes.csv, playwright.json (if present) and prints a
summary of resource patterns over the run.
"""

from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path


def kb_to_mb(kb: float) -> float:
    return kb / 1024.0


def load_totals(path: Path):
    rows = []
    with path.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Sentinel row from sampler trap
            if row.get("py_count") == "SAMPLER_STOPPED":
                continue
            try:
                rows.append({
                    "ts": int(row["ts"]),
                    "py_count": int(row["py_count"]),
                    "py_rss_kb": int(row["py_rss_kb"]),
                    "node_count": int(row["node_count"]),
                    "node_rss_kb": int(row["node_rss_kb"]),
                    "chrome_count": int(row["chrome_count"]),
                    "chrome_rss_kb": int(row["chrome_rss_kb"]),
                    "playwright_count": int(row["playwright_count"]),
                    "playwright_rss_kb": int(row["playwright_rss_kb"]),
                })
            except (ValueError, KeyError):
                continue
    return rows


def load_processes(path: Path):
    rows = []
    with path.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                rows.append({
                    "ts": int(row["ts"]),
                    "pid": int(row["pid"]),
                    "ppid": int(row["ppid"]),
                    "pcpu": float(row["pcpu"]),
                    "rss_kb": int(row["rss_kb"]),
                    "comm": row["comm"],
                    "cmd": row["cmd"],
                })
            except (ValueError, KeyError):
                continue
    return rows


def load_playwright(path: Path):
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError:
        return None


def summarize_totals(rows):
    if not rows:
        print("  (no totals data)")
        return

    first = rows[0]
    last = rows[-1]
    duration_s = last["ts"] - first["ts"]

    print(f"  duration: {duration_s}s ({duration_s/60:.1f} min), {len(rows)} samples")
    print()
    print("  category    start_count   peak_count   end_count   start_rss   peak_rss   end_rss   delta_rss")
    print("  --------    -----------   ----------   ---------   ---------   --------   -------   ---------")

    for cat, count_key, rss_key in [
        ("python   ", "py_count", "py_rss_kb"),
        ("node     ", "node_count", "node_rss_kb"),
        ("playwrght", "playwright_count", "playwright_rss_kb"),
        ("chrome   ", "chrome_count", "chrome_rss_kb"),
    ]:
        peak_count = max(r[count_key] for r in rows)
        peak_rss = max(r[rss_key] for r in rows)
        delta = last[rss_key] - first[rss_key]
        print(
            f"  {cat}   {first[count_key]:>11}   {peak_count:>10}   {last[count_key]:>9}"
            f"   {kb_to_mb(first[rss_key]):>7.0f}MB   {kb_to_mb(peak_rss):>6.0f}MB   {kb_to_mb(last[rss_key]):>5.0f}MB   {kb_to_mb(delta):>+7.0f}MB"
        )


def find_steepest_growth(rows, key, window_samples=15):
    """Find window of N samples where `key` grows fastest. Returns (start_ts, end_ts, delta_kb)."""
    if len(rows) < window_samples:
        return None
    best = (0, 0, 0)
    for i in range(len(rows) - window_samples):
        delta = rows[i + window_samples][key] - rows[i][key]
        if delta > best[2]:
            best = (rows[i]["ts"], rows[i + window_samples]["ts"], delta)
    return best if best[2] > 0 else None


def summarize_growth(rows):
    print()
    print("Steepest 30s growth windows:")
    for label, key in [
        ("python RSS    ", "py_rss_kb"),
        ("python procs  ", "py_count"),
        ("node RSS      ", "node_rss_kb"),
        ("chrome RSS    ", "chrome_rss_kb"),
    ]:
        result = find_steepest_growth(rows, key)
        if result is None:
            print(f"  {label}: (no growth)")
            continue
        start, end, delta = result
        if "rss" in key:
            print(f"  {label}: +{kb_to_mb(delta):.0f}MB between ts={start}..{end}")
        else:
            print(f"  {label}: +{delta} procs between ts={start}..{end}")


def classify_node(cmd: str) -> str:
    """Bucket a node process by purpose so editor/LSP noise doesn't drown
    out the test runner + gradio SSR signal."""
    c = cmd.lower()
    if "templates/register.mjs" in c or "templates/node/build" in c:
        return "gradio-ssr"
    if "playwright" in c:
        return "playwright"
    if "vitest" in c:
        return "vitest"
    if "vite/bin/vite" in c or "/vite.js" in c:
        return "vite"
    if "pnpm" in c:
        return "pnpm"
    if any(s in c for s in [
        "zed", "basedpyright", "tsserver", "typescript-language",
        "language-server", "langserver", "vscode-", "cursor",
        "discord", "adobe", "creative cloud", "ccxprocess",
        "twinkleplop",
    ]):
        return "editor-or-app"
    return "other-node"


def summarize_top_pids(processes, end_ts):
    """At end of run, list top python processes by RSS, plus a per-bucket
    breakdown of node processes (so the test-runner/gradio-ssr signal is
    legible against editor/LSP background noise)."""
    if not processes:
        print("  (no per-process data)")
        return

    last_window_start = end_ts - 10
    recent = [p for p in processes if p["ts"] >= last_window_start]

    by_pid_py = defaultdict(list)
    by_pid_node = defaultdict(list)
    for p in recent:
        if p["comm"] == "python":
            by_pid_py[p["pid"]].append(p["rss_kb"])
        elif p["comm"] == "node":
            by_pid_node[p["pid"]].append(p["rss_kb"])

    def show(label, data):
        if not data:
            print(f"  {label}: none")
            return
        avg = sorted(
            ((pid, sum(rss) / len(rss)) for pid, rss in data.items()),
            key=lambda x: -x[1],
        )
        print(f"  {label}: {len(avg)} procs alive, top-10 by RSS:")
        for pid, rss in avg[:10]:
            cmd = next(
                (p["cmd"] for p in recent if p["pid"] == pid),
                "?",
            )
            print(f"    pid={pid:>6} {kb_to_mb(rss):>6.0f}MB  {cmd[:90]}")

    show("python", by_pid_py)
    show("node (all)", by_pid_node)

    print()
    print("Node breakdown by purpose (final 10s window):")
    bucket_counts: dict[str, int] = defaultdict(int)
    bucket_rss: dict[str, float] = defaultdict(float)
    for pid, rss_samples in by_pid_node.items():
        avg_rss = sum(rss_samples) / len(rss_samples)
        cmd = next((p["cmd"] for p in recent if p["pid"] == pid), "")
        bucket = classify_node(cmd)
        bucket_counts[bucket] += 1
        bucket_rss[bucket] += avg_rss

    print("  bucket            count    rss")
    print("  ------            -----    ---")
    for bucket in sorted(bucket_counts.keys(), key=lambda b: -bucket_rss[b]):
        print(f"  {bucket:<16}    {bucket_counts[bucket]:>5}    {kb_to_mb(bucket_rss[bucket]):>6.0f}MB")


def summarize_node_growth(processes, totals):
    """Track gradio-ssr + playwright node procs across the run, in 30s windows,
    so we can see whether either category leaks during SSR mode."""
    if not processes or not totals:
        return

    # Bucket processes by 30s windows from run start
    start_ts = totals[0]["ts"]
    by_window: dict[int, dict[str, dict[int, int]]] = defaultdict(
        lambda: defaultdict(dict)
    )

    for p in processes:
        if p["comm"] != "node":
            continue
        bucket = classify_node(p["cmd"])
        if bucket not in ("gradio-ssr", "playwright", "vite", "vitest"):
            continue
        window = (p["ts"] - start_ts) // 30
        # Keep last RSS we saw for this pid in this window (averages out below)
        by_window[window][bucket][p["pid"]] = p["rss_kb"]

    if not by_window:
        return

    print()
    print("Test-runner / gradio-ssr node procs over time (per 30s window):")
    print("  win    gradio-ssr (n,rss)    playwright (n,rss)    vite (n,rss)    vitest (n,rss)")
    for window in sorted(by_window.keys()):
        parts = []
        for bucket in ("gradio-ssr", "playwright", "vite", "vitest"):
            data = by_window[window].get(bucket, {})
            n = len(data)
            rss = sum(data.values())
            parts.append(f"{n:>2},{kb_to_mb(rss):>5.0f}MB")
        secs = window * 30
        print(f"  {secs:>3}s   {parts[0]:>16}      {parts[1]:>16}    {parts[2]:>14}  {parts[3]:>14}")


def summarize_playwright(pw_data):
    if not pw_data:
        print("  (no playwright JSON — file missing or unparseable)")
        return

    stats = pw_data.get("stats", {})
    print(f"  expected: {stats.get('expected', '?')}")
    print(f"  unexpected: {stats.get('unexpected', '?')}")
    print(f"  flaky: {stats.get('flaky', '?')}")
    print(f"  skipped: {stats.get('skipped', '?')}")
    print(f"  duration: {stats.get('duration', '?'):.0f}ms")


def main():
    if len(sys.argv) != 2:
        print("Usage: analyze.py <results_dir>", file=sys.stderr)
        sys.exit(2)

    results_dir = Path(sys.argv[1])
    if not results_dir.is_dir():
        print(f"not a directory: {results_dir}", file=sys.stderr)
        sys.exit(2)

    print(f"=== Analysis: {results_dir.name} ===")
    print()

    print("Totals over the run:")
    totals = load_totals(results_dir / "totals.csv")
    summarize_totals(totals)

    if totals:
        summarize_growth(totals)

    print()
    print("Top processes by RSS (final 10s window):")
    processes = load_processes(results_dir / "processes.csv")
    end_ts = totals[-1]["ts"] if totals else 0
    summarize_top_pids(processes, end_ts)

    summarize_node_growth(processes, totals)

    print()
    print("Playwright run summary:")
    pw = load_playwright(results_dir / "playwright.json")
    summarize_playwright(pw)

    print()


if __name__ == "__main__":
    main()
