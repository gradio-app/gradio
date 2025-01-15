import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function resolve(specifier, context, nextResolve) {
	// Take an `import` or `require` specifier and resolve it to a URL.
	if (specifier === "svelte/internal" || specifier === "svelte") {
		return nextResolve(
			join(__dirname, "frontend", "assets", "svelte", "svelte.js")
		);
	}
	if (specifier.startsWith("svelte/")) {
		return nextResolve(
			join(__dirname, "frontend", "assets", "svelte", "svelte-submodules.js")
		);
	}
	return nextResolve(specifier);
}
