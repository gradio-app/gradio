import { fileURLToPath } from "url";
import { createServer, build } from "vite";
import { readdirSync } from "fs";
import { join } from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
import { svelte } from "@sveltejs/vite-plugin-svelte";

interface ServerOptions {
	component_dir: string;
	root_dir: string;
}

export async function create_server({
	component_dir,
	root_dir
}: ServerOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const imports = generate_imports(component_dir);

	const server = await createServer({
		// any valid user config options, plus `mode` and `configFile`
		mode: "development",
		configFile: false,
		root: join(process.cwd(), "..", "..", "gradio", "templates", "dev"),
		build: {
			rollupOptions: {
				external: [
					"../../../node/dev/svelte.js",
					"../../../node/dev/svelte-internal.js",
					"../../../../../../gradio/node/dev/svelte-internal.js",
					"../../../../../../gradio/node/dev/svelte.js"
				]
			}
		},
		optimizeDeps: {
			disabled: true
		},
		server: {
			port: 1337,
			fs: {
				allow: [
					join(process.cwd(), "..", "..", "gradio", "templates", "dev"),
					join(process.cwd(), "..", "..", "gradio", "node", "dev"),
					join(process.cwd(), component_dir)
				]
			}
		},
		plugins: [
			svelte({
				prebundleSvelteLibraries: false,
				hot: true
			}),
			{
				name: "gradio",
				enforce: "pre",
				resolveId(importee, importer) {
					if (importee === "svelte") {
						return join(
							process.cwd(),
							"..",
							"..",
							"gradio",
							"node",
							"dev",
							"svelte-internal.js"
						);
					}

					if (importee === "svelte/internal") {
						return join(
							process.cwd(),
							"..",
							"..",
							"gradio",
							"node",
							"dev",
							"svelte-internal.js"
						);
					}
				},
				transform(code) {
					if (code.includes("__REPLACE_ME_STATIC__")) {
						return code
							.replace("__REPLACE_ME_STATIC__", imports.static)
							.replace("__REPLACE_ME_INTERACTIVE__", imports.interactive);
					}
				}
			}
		]
	});

	await server.listen();

	server.printUrls();
}

function get_components_from_dir(dir: string): string[] {
	const path = join(process.cwd(), dir);
	const components = readdirSync(path);
	return components;
}

// generate imports for each sub dir in component_dir
// like this:
// `component_name: {
///  interactive: () => import("./components/component_name/interactive"),`
//   static: () => import("./components/component_name/static")
// }`
function generate_imports(component_dir: string): Record<string, string> {
	const components = get_components_from_dir(component_dir);

	const imports = components.map((component) => {
		// return `${component}: {
		//   interactive: () => import("./components/js/${component}/interactive"),
		//   static: () => import("./components/js/${component}/static")
		// },\n`;

		return {
			interactive: join(
				process.cwd(),
				component_dir,
				component,
				"js",
				"interactive"
			),
			//      `"./components/js/${component}/interactive"`,
			static: join(process.cwd(), component_dir, component, "js", "static") //`"./components/js/${component}/static"`
		};
	});

	return imports[0];
}
