import collections
import glob
import json
import statistics as st

g = collections.defaultdict(list)
for f in sorted(glob.glob("results/sweep/*.json")):
    r = json.load(open(f))
    g[(r["app"], r["rate"], r["executor"])].append(r)
out = []
for (app, rate, ex), rs in sorted(g.items()):
    row = dict(
        app=app,
        rate=rate,
        executor=ex,
        runs=len(rs),
        visitors=[r["visitors"] for r in rs],
        errors=sum(r["errors"] for r in rs),
        per_min=[round(r["throughput_per_min"]) for r in rs],
        per_min_mean=st.mean(r["throughput_per_min"] for r in rs),
        solo=st.mean(r["solo_fn_s_p50"] for r in rs),
        fn_p50=st.mean(r["fn_s"]["p50"] for r in rs),
        page_p50=st.mean(r["page_ms"]["p50"] for r in rs),
        page_p99=st.mean(r["page_ms"]["p99"] for r in rs),
        page_max=max(r["page_ms"]["max"] for r in rs),
        cpu=[r["cpu_percent"] for r in rs][0],
    )
    out.append(row)
    print(
        f"{app:8} {rate:5.0f}/s {ex:8} n={row['runs']} vis={row['visitors']} err={row['errors']} per_min={row['per_min']} mean={row['per_min_mean']:.0f} solo={row['solo']:.3f} fn={row['fn_p50']:.3f} page p50={row['page_p50']:.0f} p99={row['page_p99']:.0f} max={row['page_max']:.0f} cpu={row['cpu']}"
    )
json.dump(out, open("results/sweep_summary.json", "w"), indent=1)
