import { join } from "path";
import * as fs from "fs";
import { createServer, createLogger } from "vite";
import { plugins, make_gradio_plugin } from "./plugins";
import { examine_module } from "./index";
import type { PreprocessorGroup } from "svelte/compiler";

const vite_messages_to_ignore = [
	"Default and named imports from CSS files are deprecated.",
	"The above dynamic import cannot be analyzed by Vite."
];

const logger = createLogger();
const originalWarning = logger.warn;
logger.warn = (msg, options) => {
	if (vite_messages_to_ignore.some((m) => msg.includes(m))) return;

	originalWarning(msg, options);
};

interface ServerOptions {
	component_dir: string;
	root_dir: string;
	frontend_port: number;
	backend_port: number;
	host: string;
	python_path: string;
}

export async function create_server({
	component_dir,
	root_dir,
	frontend_port,
	backend_port,
	host,
	python_path
}: ServerOptions): Promise<void> {
	process.env.gradio_mode = "dev";
	const [imports, config] = await generate_imports(
		component_dir,
		root_dir,
		python_path
	);

	const svelte_dir = join(root_dir, "assets", "svelte");

	try {
		const server = await createServer({
			customLogger: logger,
			mode: "development",
			configFile: false,
			root: root_dir,
			server: {
				port: frontend_port,
				host: host,
				fs: {
					allow: [root_dir, component_dir]
				}
			},
			resolve: {
				conditions: ["gradio"]
			},
			build: {
				target: config.build.target
			},
			optimizeDeps: config.optimizeDeps,
			plugins: [
				...plugins(config),
				make_gradio_plugin({
					mode: "dev",
					backend_port,
					svelte_dir,
					imports
				})
			]
		});

		await server.listen();

		console.info(
			`[orange3]Frontend Server[/] (Go here): ${server.resolvedUrls?.local}`
		);
	} catch (e) {
		console.error(e);
	}
}

function find_frontend_folders(start_path: string): string[] {
	if (!fs.existsSync(start_path)) {
		console.warn("No directory found at:", start_path);
		return [];
	}

	if (fs.existsSync(join(start_path, "pyproject.toml"))) return [start_path];

	const results: string[] = [];
	const dir = fs.readdirSync(start_path);
	dir.forEach((dir) => {
		const filepath = join(start_path, dir);
		if (fs.existsSync(filepath)) {
			if (fs.existsSync(join(filepath, "pyproject.toml")))
				results.push(filepath);
		}
	});

	return results;
}

function to_posix(_path: string): string {
	const isExtendedLengthPath = /^\\\\\?\\/.test(_path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(_path);

	if (isExtendedLengthPath || hasNonAscii) {
		return _path;
	}

	return _path.replace(/\\/g, "/");
}

export interface ComponentConfig {
	plugins: any[];
	svelte: {
		preprocess: PreprocessorGroup[];
		extensions?: string[];
	};
	build: {
		target: string | string[];
	};
	optimizeDeps: object;
}

async function generate_imports(
	component_dir: string,
	root: string,
	python_path: string
): Promise<[string, ComponentConfig]> {
	const components = find_frontend_folders(component_dir);

	const component_entries = components.flatMap((component) => {
		return examine_module(component, root, python_path, "dev");
	});
	if (component_entries.length === 0) {
		console.info(
			`No custom components were found in ${component_dir}. It is likely that dev mode does not work properly. Please pass the --gradio-path and --python-path CLI arguments so that gradio uses the right executables.`
		);
	}

	let component_config: ComponentConfig = {
		plugins: [],
		svelte: {
			preprocess: []
		},
		build: {
			target: []
		},
		optimizeDeps: {}
	};

	await Promise.all(
		component_entries.map(async (component) => {
			if (
				component.frontend_dir &&
				fs.existsSync(join(component.frontend_dir, "gradio.config.js"))
			) {
				const m = await import(
					join("file://" + component.frontend_dir, "gradio.config.js")
				);

				component_config.plugins = m.default.plugins || [];
				component_config.svelte.preprocess = m.default.svelte?.preprocess || [];
				component_config.build.target = m.default.build?.target || "modules";
				component_config.optimizeDeps = m.default.optimizeDeps || {};
			} else {
			}
		})
	);

	const imports = component_entries.reduce((acc, component) => {
		const pkg = JSON.parse(
			fs.readFileSync(join(component.frontend_dir, "package.json"), "utf-8")
		);

		const exports: Record<string, any | undefined> = {
			component: pkg.exports["."],
			example: pkg.exports["./example"]
		};

		if (!exports.component)
			throw new Error(
				"Could not find component entry point. Please check the exports field of your package.json."
			);

		const example = exports.example
			? `example: () => import("/@fs/${to_posix(
					join(component.frontend_dir, exports.example.gradio)
				)}"),\n`
			: "";
		return `${acc}"${component.component_class_id}": {
			${example}
			component: () => import("/@fs/${to_posix(
				join(component.frontend_dir, exports.component.gradio)
			)}")
			},\n`;
	}, "");

	return [`{${imports}}`, component_config];
}
