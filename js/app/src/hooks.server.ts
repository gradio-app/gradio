import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";

let gradio_import_map: null | string = null;

export const handle: Handle = async ({ event, resolve }) => {
	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			event.request.headers.forEach((value, key) => {
				console.error(
					`%c[Gradio Header] %c${key}: ${value}`,
					"color: #6f42c1; font-weight: bold;",
					"color: #0366d6;"
				);
			});
			const server =
				event.request.headers.get("x-gradio-server") || "http://127.0.0.1:7860";

			const mount_path =
				event.request.headers.get("x-gradio-mounted-path") || "/";
			const real_url = new URL(
				event.request.headers.get("x-gradio-original-url") || server
			).origin;

			if (!gradio_import_map) {
				gradio_import_map = make_import_map_script(real_url + mount_path);
			}

			return html.replace("%gradio.import_map%", gradio_import_map);
		}
	});
};

const svelte_imports = [
	"svelte",
	"svelte/animate",
	"svelte/attachments",
	"svelte/compiler",
	"svelte/easing",
	"svelte/events",
	"svelte/internal/client",
	"svelte/internal/disclose-version",
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

function make_import_map_script(base_url: string): string {
	const imports = svelte_imports.reduce(
		(map, specifier) => {
			map[`${specifier}`] =
				`${base_url}svelte/${specifier.split("/").join("_")}.js`;

			return map;
		},
		{} as Record<string, string>
	);

	imports["svelte"] = `${base_url}svelte/svelte_svelte.js`;

	return `<script type="importmap">{"imports": ${JSON.stringify(imports)} }</script>`;
}
