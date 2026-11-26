import json
import sys

for f in sys.argv[1:]:
    r = json.load(open(f))
    g = lambda d: (
        f"p50 {d['p50']:.0f} p95 {d['p95']:.0f} p99 {d['p99']:.0f} max {d['max']:.0f}"
        if d["n"]
        else "none"
    )
    print(
        f"{f}: {r['app']} {r['executor']} rate {r['rate']}/s x {r['seconds']}s visitors {r['visitors']} loaded {r['pages_loaded']} errors {r['errors']} {r['error_samples'][:2]}"
    )
    print(
        f"   page ms: idle {r['idle_page_ms_p50']:.0f} | {g(r['page_ms'])} | >1s: {r['page_over_1s']} | by10s {r['page_ms_p50_by_10s']}"
    )
    print(f"   join ms: {g(r['join_ms'])} | first update ms: {g(r['first_update_ms'])}")
    print(
        f"   completed {r['completed']} ({r['throughput_per_min']:.0f}/min) fn s solo {r['solo_fn_s_p50']:.3f} load p50 {r['fn_s']['p50']:.3f} p95 {r['fn_s']['p95']:.3f} | cpu {r['cpu_percent']} rss {r['rss_mb']}"
    )
