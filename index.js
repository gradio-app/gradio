import * as path from "path";
import * as fs from "fs";

import { getPackagesSync } from "@manypkg/get-packages";

const ignored = [
	"@gradio/wasm",
	"@gradio/lite",
	"@gradio/tootils",
	"@gradio/utils",
	"@gradio/tooltip",
	"@gradio/theme",
	"@gradio/storybook",
	"@gradio/preview",
	"@gradio/icons",
	"@gradio/atoms",
	"@gradio/client",
	"@gradio/cdn-test",
	"@gradio/spaces-test",
	"@gradio/upload",
	"@gradio/statustracker",
	"@gradio/app"
];

const import_re = /export { default } from ".\/\w+.svelte";/;
const static_re = /Static\w+.svelte/;
const interactive_re = /Interactive\w+.svelte/;

const make_module = (mods) => `<script context="module" lang="ts">
  ${mods.join("\n")}
</script>`;
const make_svelte = (str) => {
	const end = str.indexOf("/script>");

	const script = str.substring(0, end + 8);
	const template = str.substring(end + 8, str.length);

	return `${script}\n
  
{#if mode === "static"}
${template}
{:else}

{/if}`;
};
function run() {
	const packages = getPackagesSync(process.cwd());
	const packages_to_change = packages.packages.filter(
		(p) =>
			!p.packageJson.python &&
			p.packageJson.name.startsWith("@gradio") &&
			!ignored.includes(p.packageJson.name)
	);

	packages_to_change.forEach((p) => {
		// const pkgJson = JSON.parse(
		// 	fs.readFileSync(path.join(p.dir, "package.json"), "utf-8")
		// );
		// console.log("Processing EXAMPLE");
		// if (fs.existsSync(path.join(p.dir, "example"))) {
		// 	const example = fs
		// 		.readdirSync(path.join(p.dir, "example"))
		// 		.find((f) => f.endsWith(".svelte"));
		// 	pkgJson.exports = {
		// 		".": "./Index.svelte",
		// 		"./example": "./Example.svelte",
		// 		"./package.json": "./package.json"
		// 	};
		// 	fs.writeFileSync(
		// 		path.join(p.dir, "package.json"),
		// 		JSON.stringify(pkgJson, null, "\t")
		// 	);
		// 	fs.copyFileSync(
		// 		path.join(p.dir, "example", example),
		// 		path.join(p.dir, "Example.svelte")
		// 	);
		// 	fs.rmSync(path.join(p.dir, "example"), { recursive: true });
		// } else {
		// 	pkgJson.exports = {
		// 		".": "./Index.svelte",
		// 		"./package.json": "./package.json"
		// 	};
		// 	fs.writeFileSync(
		// 		path.join(p.dir, "package.json"),
		// 		JSON.stringify(pkgJson, null, "\t")
		// 	);
		// }
		// console.log("Processing STATIC");
		// if (fs.existsSync(path.join(p.dir, "static"))) {
		// 	const dir = fs.readdirSync(path.join(p.dir, "static"));
		// 	const imports = fs
		// 		.readFileSync(path.join(p.dir, "static", "index.ts"), "utf-8")
		// 		.split("\n")
		// 		.filter((l) => !l.match(import_re) && !!l);
		// 	const _static =
		// 		dir.find((f) => f.match(static_re) || f === "index.svelte") ||
		// 		dir.filter((f) => f !== "index.ts")[0];
		// 	// console.log(dir, imports, _static);
		// 	// write to `Index.svelte
		// 	const body = fs.readFileSync(
		// 		path.join(p.dir, "static", _static),
		// 		"utf-8"
		// 	);
		// 	const content = make_svelte(body);
		// 	const file = (imports.length ? make_module(imports) : "") + content;
		// 	fs.writeFileSync(path.join(p.dir, "Index.svelte"), file);
		// 	fs.rmSync(path.join(p.dir, "static", _static), { recursive: true });
		// 	// copy to `shared.svelte`
		// 	const rest_files = dir.filter((f) => f !== _static && f !== "index.ts");
		// 	if (rest_files.length && !fs.existsSync(path.join(p.dir, "shared"))) {
		// 		fs.mkdirSync(path.join(p.dir, "shared"));
		// 	}
		// 	rest_files.forEach((f) => {
		// 		if (!fs.existsSync(path.join(p.dir, "shared", f))) {
		// 			fs.copyFileSync(
		// 				path.join(p.dir, "static", f),
		// 				path.join(p.dir, "shared", f)
		// 			);
		// 			fs.rmSync(path.join(p.dir, "static", f), { recursive: true });
		// 		} else {
		// 			console.warn(
		// 				"skipping",
		// 				path.join(p.dir, "shared", f),
		// 				"Handle manually"
		// 			);
		// 		}
		// 	});
		// 	console.log("Processing INTERACTIVE");
		// 	if (fs.existsSync(path.join(p.dir, "interactive"))) {
		// 		const dirs = fs.readdirSync(path.join(p.dir, "interactive"));
		// 		const _interactive =
		// 			dirs.find((f) => f.match(interactive_re) || f === "index.svelte") ||
		// 			dirs.filter((f) => f !== "index.ts")[0];
		// 		const rest_files = dirs.filter(
		// 			(f) => f !== _interactive && f !== "index.ts"
		// 		);
		// 		if (rest_files.length && !fs.existsSync(path.join(p.dir, "shared"))) {
		// 			fs.mkdirSync(path.join(p.dir, "shared"));
		// 		}
		// 		rest_files.forEach((f) => {
		// 			if (!fs.existsSync(path.join(p.dir, "shared", f))) {
		// 				fs.copyFileSync(
		// 					path.join(p.dir, "interactive", f),
		// 					path.join(p.dir, "shared", f)
		// 				);
		// 				fs.rmSync(path.join(p.dir, "interactive", f), { recursive: true });
		// 			} else {
		// 				console.warn(
		// 					"skipping",
		// 					path.join(p.dir, "shared", f),
		// 					"Handle manually"
		// 				);
		// 			}
		// 		});
		// 	}
		// }

		const interactive = fs.existsSync(path.join(p.dir, "interactive"));

		// delete
		if (interactive) {
			console.log(" interactive index", path.join(p.dir, "interactive"));

			fs.rmSync(path.join(p.dir, "interactive"), { recursive: true });
		}

		const _static = fs.existsSync(path.join(p.dir, "static"));

		// delete
		if (_static) {
			console.log(" static index", path.join(p.dir, "static"));

			fs.rmSync(path.join(p.dir, "static"), { recursive: true });
		}

		const shared = fs.existsSync(path.join(p.dir, "shared", "index.ts"));

		// delete

		if (shared) {
			console.log(" shared index", path.join(p.dir, "shared", "index.ts"));
			fs.rmSync(path.join(p.dir, "shared", "index.ts"), { recursive: true });
		}

		const pkgJson = JSON.parse(
			fs.readFileSync(path.join(p.dir, "package.json"), "utf-8")
		);

		delete pkgJson.main;

		fs.writeFileSync(
			path.join(p.dir, "package.json"),
			JSON.stringify(pkgJson, null, "\t")
		);

		console.log("pkgJson", pkgJson);
	});
}

run();
