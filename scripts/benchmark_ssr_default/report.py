"""Turns bench.py / spaces/deploy.py JSON into the Markdown tables in RESULTS.md.

python report.py --local results/local.json --spaces results/spaces.json > RESULTS.md
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ARM_ORDER = ["fastapi", "main", "base-csr", "base-ssr", "pr-default", "pr-csr"]
ARM_LABEL = {
    "fastapi": "FastAPI",
    "main": "main (6.31.0, CSR, default)",
    "base-csr": "7.0-dev (CSR, default)",
    "base-ssr": "7.0-dev (SSR opt-in)",
    "pr-default": "**#14016 (default → SSR)**",
    "pr-csr": "#14016 (SSR off)",
}


def fmt(v, unit=""):
    if v is None:
        return "–"
    if isinstance(v, str):
        return v
    if abs(v) >= 100:
        s = f"{v:,.0f}"
    elif abs(v) >= 10:
        s = f"{v:.0f}"
    else:
        s = f"{v:.1f}"
    return s + unit


def kb(v):
    return "–" if v is None else f"{v / 1024:,.0f} KB"


def med(d, key="median"):
    return d.get(key) if d else None


def table(headers, rows):
    out = [
        "| " + " | ".join(headers) + " |",
        "|" + "|".join(["---"] + ["---:"] * (len(headers) - 1)) + "|",
    ]
    out += ["| " + " | ".join(r) + " |" for r in rows]
    return "\n".join(out)


def by_arm(rows, **match):
    found = {}
    for r in rows:
        if all(r.get(k) == v for k, v in match.items()):
            found[r["arm"]] = r
    return [(a, found[a]) for a in ARM_ORDER if a in found]


def find(rows, **match):
    for r in rows:
        if all(r.get(k) == v for k, v in match.items()):
            return r
    return None


def spaces_startup_median(d, arm, key="in_container_ms"):
    vals = sorted(
        r[key]
        for r in d.get("startup_spaces", [])
        if r["arm"] == arm and r["app"] == "simple" and key in r
    )
    return vals[len(vals) // 2] if vals else None


def headline(d, where):
    rows = []
    levels = sorted({r["concurrency"] for r in d.get("http", [])})
    c = 50 if 50 in levels else (levels[-1] if levels else 50)
    for arm, s in by_arm(d.get("startup", []), app="simple") or [
        (a, None) for a in ARM_ORDER
    ]:
        cold = find(d.get("pageload", []), arm=arm, app="simple", profile="cold") or {}
        warm = find(d.get("pageload", []), arm=arm, app="simple", profile="warm") or {}
        thr = (
            find(d.get("pageload", []), arm=arm, app="simple", profile="throttled")
            or {}
        )
        api1 = find(d.get("http", []), arm=arm, scenario="api", concurrency=1) or {}
        api50 = find(d.get("http", []), arm=arm, scenario="api", concurrency=c) or {}
        page50 = find(d.get("http", []), arm=arm, scenario="page", concurrency=c) or {}
        tabs = (
            find(
                d.get("tabs", []),
                arm=arm,
                app="simple",
                tabs=max([t["tabs"] for t in d.get("tabs", [])] or [0]),
                mode="isolated",
            )
            or {}
        )
        if s is None and not cold:
            continue
        rows.append(
            [
                ARM_LABEL[arm],
                fmt(med(s["ready_ms"]) / 1000, " s")
                if s
                else (
                    fmt(spaces_startup_median(d, arm) / 1000, " s")
                    if spaces_startup_median(d, arm)
                    else "–"
                ),
                fmt(med(s["idle_rss_mb"]), " MB") if s else "–",
                fmt(med(cold.get("ready")), " ms"),
                fmt(med(warm.get("ready")), " ms"),
                fmt(med(thr.get("ready")), " ms"),
                fmt(med(cold.get("first_event_ms")), " ms"),
                fmt(med(api1.get("latency_ms")), " ms"),
                fmt(api50.get("rps")),
                fmt(page50.get("rps")),
                f"{fmt(med(tabs.get('ready_ms')))} / {fmt(med(tabs.get('ready_ms'), 'max'))} ms"
                if tabs
                else "–",
            ]
        )
    k = max([t["tabs"] for t in d.get("tabs", [])] or [0])
    return table(
        [
            "Arm",
            "Startup",
            "Idle RSS",
            "Page ready (cold)",
            "Page ready (warm)",
            "Page ready (slow 4G + 4x CPU)",
            "First UI event",
            "API latency (1 user)",
            f"API req/s ({c} users)",
            f"`GET /` req/s ({c} users)",
            f"{k} tabs ready (p50 / max)",
        ],
        rows,
    )


def startup_table(d):
    rows = []
    for app in ("simple", "many_tabs"):
        for arm, s in by_arm(d.get("startup", []), app=app):
            rows.append(
                [
                    f"{app}",
                    ARM_LABEL[arm],
                    "yes" if s["ssr"] else "no",
                    str(s["processes"]),
                    fmt(med(s["import_ms"]), " ms"),
                    fmt(med(s["build_ms"]), " ms"),
                    fmt(med(s["launch_ms"]), " ms"),
                    fmt(med(s["ready_ms"]), " ms"),
                    fmt(med(s["ready_ms"], "p90"), " ms"),
                    fmt(med(s["first_get_ms"]), " ms"),
                    kb(s["html_bytes"]),
                    fmt(med(s["idle_rss_mb"]), " MB"),
                ]
            )
    return table(
        [
            "App",
            "Arm",
            "SSR",
            "Procs",
            "Import",
            "Build Blocks",
            "launch()",
            "Spawn → first 200",
            "(p90)",
            "First `GET /`",
            "HTML",
            "Idle RSS (all procs)",
        ],
        rows,
    )


def spaces_startup_table(d):
    rows = []
    groups = {}
    for r in d.get("startup_spaces", []):
        groups.setdefault((r["app"], r["arm"]), []).append(r)
    for app in ("simple", "many_tabs"):
        for arm in ARM_ORDER:
            runs = groups.get((app, arm))
            if not runs:
                continue
            m = lambda k: (
                sorted(r[k] for r in runs if k in r)[len(runs) // 2]
                if any(k in r for r in runs)
                else None
            )  # noqa: E731
            rows.append(
                [
                    app,
                    ARM_LABEL[arm],
                    "yes" if runs[0].get("ssr") else "no",
                    str(len(runs)),
                    fmt(m("import_ms"), " ms"),
                    fmt(m("build_ms"), " ms"),
                    fmt(m("launch_ms"), " ms"),
                    fmt(m("in_container_ms"), " ms"),
                    fmt(m("restart_to_ready_s"), " s"),
                ]
            )
    return table(
        [
            "App",
            "Arm",
            "SSR",
            "Runs",
            "Import",
            "Build Blocks",
            "launch()",
            "Container start → listening",
            "Restart API call → first 200",
        ],
        rows,
    )


def pageload_tables(d):
    out = []
    for app in ("simple", "many_tabs"):
        for profile in ("cold", "warm", "throttled"):
            rows = []
            for arm, r in by_arm(d.get("pageload", []), app=app, profile=profile):
                row = [ARM_LABEL[arm]] + [
                    fmt(med(r[k]), " ms")
                    for k in (
                        "ttfb",
                        "fcp",
                        "lcp",
                        "dom_content_loaded",
                        "load",
                        "ready",
                    )
                ]
                row.append(fmt(med(r["ready"], "p90"), " ms"))
                row += [
                    fmt(med(r["first_event_ms"]), " ms"),
                    fmt(med(r["second_event_ms"]), " ms"),
                ]
                if app == "many_tabs" and profile != "warm":
                    row.append(fmt(med(r.get("tab_switch_ms")), " ms"))
                rows.append(row)
            if not rows:
                continue
            headers = [
                "Arm",
                "TTFB",
                "FCP",
                "LCP",
                "DOMContentLoaded",
                "load",
                "**Interactive**",
                "(p90)",
                "1st event",
                "2nd event",
            ]
            if app == "many_tabs" and profile != "warm":
                headers.append("Switch to Video tab")
            n = by_arm(d["pageload"], app=app, profile=profile)[0][1]["ready"].get("n")
            out.append(
                f"**{app} · {profile}** (median of {n})\n\n" + table(headers, rows)
            )
    return "\n\n".join(out)


def bytes_table(d):
    rows = []
    for app in ("simple", "many_tabs"):
        for arm, r in by_arm(d.get("pageload", []), app=app, profile="cold"):
            g = lambda k: med(r[k])  # noqa: E731
            rows.append(
                [
                    app,
                    ARM_LABEL[arm],
                    fmt(g("requests")),
                    kb(g("transfer_bytes")),
                    kb(g("decoded_bytes")),
                    kb(g("html_transfer_bytes")),
                    f"{fmt(g('js_requests'))} / {kb(g('js_bytes'))}",
                    f"{fmt(g('css_requests'))} / {kb(g('css_bytes'))}",
                ]
            )
    return table(
        [
            "App",
            "Arm",
            "Requests",
            "Transferred",
            "Decoded",
            "HTML",
            "JS (files / transferred)",
            "CSS (files / transferred)",
        ],
        rows,
    )


def http_tables(d):
    out = []
    for scenario, title in (
        ("page", "`GET /` (the HTML document)"),
        ("config", "`GET /config` (Python route)"),
        (
            "api",
            "API call (Gradio: `POST /gradio_api/call/greet` + SSE result; FastAPI: `POST /api/greet`)",
        ),
    ):
        rows = []
        for arm in ARM_ORDER:
            for r in d.get("http", []):
                if r["arm"] == arm and r["scenario"] == scenario:
                    lat = r["latency_ms"]
                    rows.append(
                        [
                            ARM_LABEL[arm],
                            str(r["concurrency"]),
                            fmt(r["rps"]),
                            fmt(med(lat), " ms"),
                            fmt(med(lat, "p90"), " ms"),
                            fmt(med(lat, "p99"), " ms"),
                            str(r["errors"]),
                            fmt(r.get("server_cpu_cores")),
                        ]
                    )
        if rows:
            out.append(
                f"**{title}**\n\n"
                + table(
                    [
                        "Arm",
                        "Concurrency",
                        "req/s",
                        "p50",
                        "p90",
                        "p99",
                        "Errors",
                        "Server CPU (cores)",
                    ],
                    rows,
                )
            )
    return "\n\n".join(out)


def tabs_table(d):
    rows = []
    for app in ("simple", "many_tabs"):
        for mode in ("shared", "isolated"):
            for k in sorted({t["tabs"] for t in d.get("tabs", [])}):
                for arm, r in by_arm(d.get("tabs", []), app=app, mode=mode, tabs=k):
                    rows.append(
                        [
                            app,
                            mode,
                            str(k),
                            ARM_LABEL[arm],
                            fmt(med(r["ready_ms"]), " ms"),
                            fmt(med(r["ready_ms"], "max"), " ms"),
                            fmt(r["all_ready_s"], " s"),
                            fmt(med(r["event_ms"]), " ms"),
                            fmt(med(r["event_ms"], "max"), " ms"),
                            str(r["failures"]),
                            fmt(r.get("server_cpu_s"), " s"),
                        ]
                    )
    return table(
        [
            "App",
            "Profiles",
            "Tabs",
            "Arm",
            "Ready p50",
            "Ready max",
            "All ready",
            "Event p50",
            "Event max",
            "Failures",
            "Server CPU",
        ],
        rows,
    )


def section(d, where):
    parts = [f"### {where}: summary (simple app)\n\n" + headline(d, where)]
    if d.get("startup"):
        parts.append(f"### {where}: startup\n\n" + startup_table(d))
    if d.get("startup_spaces"):
        parts.append(f"### {where}: startup\n\n" + spaces_startup_table(d))
    if d.get("pageload"):
        parts.append(f"### {where}: page load\n\n" + pageload_tables(d))
        parts.append(f"### {where}: bytes on a cold load\n\n" + bytes_table(d))
    if d.get("http"):
        parts.append(f"### {where}: HTTP load\n\n" + http_tables(d))
    if d.get("tabs"):
        parts.append(f"### {where}: many browser tabs\n\n" + tabs_table(d))
    return "\n\n".join(parts)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--local")
    ap.add_argument("--spaces")
    args = ap.parse_args()
    parts = []
    if args.local:
        parts.append(section(json.loads(Path(args.local).read_text()), "Local"))
    if args.spaces:
        parts.append(section(json.loads(Path(args.spaces).read_text()), "Spaces"))
    print("\n\n".join(parts))


if __name__ == "__main__":
    main()
