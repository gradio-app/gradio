const fs = require("fs");

let pr, base;
try {
	pr = JSON.parse(fs.readFileSync("/tmp/bench_pr.json", "utf8"));
	base = JSON.parse(fs.readFileSync("/tmp/bench_base.json", "utf8"));
} catch (e) {
	console.warn("Could not read benchmark results:", e.message);
	process.exit(0);
}

const metrics = [
	{
		name: "DOM Content Loaded",
		key: "dom_content_loaded_ms",
		unit: "ms",
		warn: 0.25,
		fail: 0.5
	},
	{ name: "Page Load", key: "page_load_ms", unit: "ms", warn: 0.25, fail: 0.5 },
	{ name: "LCP", key: "lcp_ms", unit: "ms", warn: 0.25, fail: 0.5 },
	{
		name: "Tab Navigation",
		key: "tab_nav_ms",
		unit: "ms",
		warn: 0.25,
		fail: 0.5
	},
	{ name: "JS Size", key: "total_js_kb", unit: "KB", warn: 0.1, fail: 0.25 },
	{ name: "CSS Size", key: "total_css_kb", unit: "KB", warn: 0.1, fail: 0.25 }
];

const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);

const baseTag = process.env.BASE_TAG || "unknown";

console.log("");
console.log("=".repeat(78));
console.log("  Frontend Performance Benchmark");
console.log("  Base: " + baseTag);
console.log("=".repeat(78));
console.log("");
console.log(
	pad("Metric", 22) +
		rpad("Base", 12) +
		rpad("PR", 12) +
		rpad("Change", 12) +
		"  Status"
);
console.log("-".repeat(78));

let shouldFail = false;
let md = "## Frontend Performance Benchmark\n\n";
md += "| Metric | Base | PR | Change | Status |\n";
md += "|--------|------|----|--------|--------|\n";

for (const m of metrics) {
	const bv = base[m.key];
	const pv = pr[m.key];
	if (bv === undefined || pv === undefined) continue;
	const pct = bv === 0 ? 0 : (pv - bv) / bv;
	const pctStr = (pct * 100).toFixed(1) + "%";
	const changeStr = (pct > 0 ? "+" : "") + pctStr;
	const absDiff = pv - bv;
	const minAbsDiff = m.unit === "ms" ? 200 : 0;
	let status = "OK";
	let mdStatus = "✅";
	if (pct > m.fail && absDiff > minAbsDiff) {
		status = "FAIL";
		mdStatus = "❌ FAIL";
		shouldFail = true;
	} else if (pct > m.warn && absDiff > minAbsDiff) {
		status = "WARNING";
		mdStatus = "⚠️ WARNING";
	}
	console.log(
		pad(m.name, 22) +
			rpad(bv + " " + m.unit, 12) +
			rpad(pv + " " + m.unit, 12) +
			rpad(changeStr, 12) +
			"  " +
			status
	);
	md +=
		"| " +
		m.name +
		" | " +
		bv +
		" " +
		m.unit +
		" | " +
		pv +
		" " +
		m.unit +
		" | " +
		changeStr +
		" | " +
		mdStatus +
		" |\n";
}

console.log("-".repeat(78));
console.log(
	pad("JS Resources", 22) +
		rpad(base.js_resource_count || "-", 12) +
		rpad(pr.js_resource_count || "-", 12)
);
console.log(
	pad("CSS Resources", 22) +
		rpad(base.css_resource_count || "-", 12) +
		rpad(pr.css_resource_count || "-", 12)
);
console.log("");

md +=
	"\n| JS Resources | " +
	(base.js_resource_count || "-") +
	" | " +
	(pr.js_resource_count || "-") +
	" | | |\n";
md +=
	"| CSS Resources | " +
	(base.css_resource_count || "-") +
	" | " +
	(pr.css_resource_count || "-") +
	" | | |\n";
md +=
	"\n> Base: `" +
	baseTag +
	"` | Thresholds: timing warns at +25%/fails at +50%, size warns at +10%/fails at +25%.\n";

fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
fs.writeFileSync("/tmp/bench_comment.md", md);

const ghOutput = process.env.GITHUB_OUTPUT;
if (ghOutput) {
	fs.appendFileSync(ghOutput, `failed=${shouldFail ? "true" : "false"}\n`);
}

if (shouldFail) {
	console.log("❌ Frontend performance regression detected.");
	process.exit(1);
} else {
	console.log("✅ No performance regressions detected.");
}
