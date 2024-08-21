import { emitDts } from "svelte2tsx";
import { createRequire } from "node:module";
import { join, resolve, relative } from "node:path";

async function main() {
	const root = resolve(
		import.meta.url.replace("file://", ""),
		"..",
		"..",
		".."
	);

	const out_path = join(process.cwd(), "dist").replace(root + "/", "");
	const require = createRequire(import.meta.url);

	console.log({
		libRoot: process.cwd(),
		declarationDir: relative(process.cwd(), out_path)
	});

	await emitDts({
		libRoot: process.cwd(),
		svelteShimsPath: require.resolve("svelte2tsx/svelte-shims-v4.d.ts"),
		declarationDir: relative(process.cwd(), out_path)
	});
}

main();
