import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svelte_imports = [
	"svelte",
	"svelte/animate",
	"svelte/attachments",
	"svelte/compiler",
	"svelte/easing",
	"svelte/events",
	"svelte/internal/client",
	"svelte/internal/disclose_version",
	"svelte/internal/flags/async",
	"svelte/internal/flags/legacy",
	"svelte/internal/flags/tracing",
	"svelte/internal/server",
	"svelte/internal",
	"svelte/legacy",
	"svelte/motion",
	"svelte/reactivity/window",
	"svelte/reactivity",
	"svelte/server",
	"svelte/store",
	"svelte/transition"
];

const import_map = svelte_imports.reduce((map, specifier) => {
	map[specifier] = join(
		__dirname,
		"templates",
		"frontend",
		"assets",
		"svelte",
		specifier.split("/").join("_") + ".js"
	);
	return map;
}, {});

import_map["svelte"] = join(
	__dirname,
	"templates",
	"frontend",
	"assets",
	"svelte",
	"svelte_svelte.js"
);

console.log("import map:", import_map);

export async function resolve(specifier, context, nextResolve) {
	console.log("Resolving:", specifier);
	if (Object.hasOwn(import_map, specifier)) {
		return nextResolve(import_map[specifier], context);
	}

	return nextResolve(specifier, context);
}
