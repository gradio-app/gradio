import json
import sys

for f in sys.argv[1:]:
    d = json.load(open(f))
    print(f"== {f} device={d['device']} steps={d['steps']}")
    for r in d["results"]:
        s, c = r["sequential"], r["concurrent"]
        print(f"[{r['executor']}]")
        print("  startup s:", [round(x, 2) for x in r["startup_s"]])
        print(
            "  procs:", [(p["role"], round(p["rss_mb"])) for p in r["processes_after"]]
        )
        print(
            f"  seq e2e p50 {s['e2e_s']['p50']:.3f} p95 {s['e2e_s']['p95']:.3f} | fn p50 {s['fn_s']['p50']:.3f} | overhead ms mean {s['overhead_ms']['mean']:.1f} p50 {s['overhead_ms']['p50']:.1f} p95 {s['overhead_ms']['p95']:.1f}"
        )
        i = r["idle_probe_ms"]
        print(
            f"  idle probe ms page p50 {i['page']['p50']:.2f} p95 {i['page']['p95']:.2f} | config p50 {i['config']['p50']:.2f} p95 {i['config']['p95']:.2f}"
        )
        print(
            f"  conc {c['requests']} req wall {c['wall_s']:.1f}s thr {c['throughput_rps']:.3f} rps | e2e mean {c['e2e_s']['mean']:.2f} p95 {c['e2e_s']['p95']:.2f} | fn p50 {c['fn_s']['p50']:.3f} mean {c['fn_s']['mean']:.3f}"
        )
        for k in ("probe_page_ms", "probe_config_ms"):
            p = c[k]
            print(
                f"  {k}: n {p['n']} p50 {p['p50']:.2f} p95 {p['p95']:.2f} max {p['max']:.1f}"
            )
        print("  cpu%:", [x["cpu_percent"] for x in c["cpu"]])
