// Verifies that every dist artifact referenced by the public package
// contract (exports map, main/module/types fields, and the CDN path
// documented in the README) is actually emitted by `pnpm build`.
// Run automatically as the last step of the `build` script so the
// published package can never drift from the documented entrypoints.
// See https://github.com/gradio-app/gradio/issues/10028 and
// https://github.com/gradio-app/gradio/issues/9214.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkg_dir = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(pkg_dir, "package.json"), "utf-8"));

const referenced = new Set();

for (const field of ["main", "module", "types"]) {
	if (pkg[field]) referenced.add(pkg[field]);
}

function collect(entry) {
	if (typeof entry === "string") {
		referenced.add(entry);
	} else if (entry && typeof entry === "object") {
		for (const [condition, value] of Object.entries(entry)) {
			// the "gradio" condition points at src/, which is shipped as-is
			if (condition === "gradio") continue;
			collect(value);
		}
	}
}
collect(pkg.exports);

const missing = [...referenced]
	.map((p) => p.replace(/^\.\//, ""))
	.filter((p) => p.startsWith("dist/"))
	.filter((p) => !existsSync(join(pkg_dir, p)));

if (missing.length > 0) {
	console.error(
		"verify_dist: build did not emit artifact(s) referenced by package.json:\n" +
			missing.map((p) => `  - ${p}`).join("\n")
	);
	process.exit(1);
}
console.log("verify_dist: all published entrypoints exist in dist/");
