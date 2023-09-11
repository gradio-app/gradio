import { fileURLToPath } from "url";
import { createServer, build } from "vite";
import { readdirSync } from "fs";
import { join } from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { transform } from "sucrase";

// import { typescript } from "svelte-preprocess";

interface ServerOptions {
	component_dir: string;
	root_dir: string;
}

console.log(__dirname);

export async function create_server({
	component_dir,
	root_dir
}: ServerOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const imports = generate_imports(component_dir);
	console.log(imports);

	const _ROOT = join(__dirname, "..", "..", "..", "..");
	console.log({ _ROOT });

	const server = await createServer({
		// any valid user config options, plus `mode` and `configFile`
		mode: "development",
		configFile: false,
		root: join(_ROOT, "gradio", "templates", "dev"),
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
					join(_ROOT, "gradio", "templates", "dev"),
					join(_ROOT, "gradio", "node", "dev"),
					join(_ROOT, component_dir)
				]
			}
		},
		plugins: [
			svelte({
				prebundleSvelteLibraries: false,
				hot: true,
				preprocess: [
					{
						script: ({ attributes, filename, content }) => {
							if (attributes.lang !== "ts") {
								const compiledCode = transform(content, {
									transforms: ["typescript"]
								});

								return {
									code: compiledCode.code,
									map: compiledCode.sourceMap
								};
							}
						}
					}
				]
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
					if (code.includes("__ROOT_PATH__")) {
						console.log("boo");
						return code.replace(`"__ROOT_PATH__"`, imports);
					}
				}
			}
		]
	});

	await server.listen();

	server.printUrls();
}

function get_components_from_dir(dir: string): string[] {
	try {
		const path = join(process.cwd(), dir);
		const components = readdirSync(path);
		return components;
	} catch (e) {
		return [];
	}
}

// generate imports for each sub dir in component_dir
// like this:
// `component_name: {
///  interactive: () => import("./components/component_name/interactive"),`
//   static: () => import("./components/component_name/static")
// }`
function generate_imports(component_dir: string): string {
	const components = get_components_from_dir(component_dir);

	const imports = components.reduce((acc, component) => {
		// return `${component}: {
		//   interactive: () => import("./components/js/${component}/interactive"),
		//   static: () => import("./components/js/${component}/static")
		// },\n`;

		const x = {
			interactive: join(
				process.cwd(),
				component_dir,
				component,
				"frontend",
				"interactive"
			),
			static: join(
				process.cwd(),
				component_dir,
				component,
				"frontend",
				"static"
			)
		};
		return `${acc}${component}: {
			interactive: () => import("${x.interactive}"),
			static: () => import("${x.static}")
			},\n`;
	}, "");

	return `{${imports}}`;
}
