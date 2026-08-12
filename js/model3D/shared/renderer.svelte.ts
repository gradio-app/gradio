import type { FileData } from "@gradio/client";
import type Canvas3DGS from "./Canvas3DGS.svelte";
import type Canvas3D from "./Canvas3D.svelte";
import { resolve_ply_source, type PlySource } from "./ply";

/**
 * Picks the renderer for a value and lazily loads the matching canvas.
 *
 * `renderer` stays `undefined` while a `.ply` header is being read. Guessing
 * gsplat for that round trip would hand a mesh to gsplat on any instance that
 * had already shown a splat, which downloads the whole file and throws the
 * unhandled rejection this module exists to remove.
 */
export function create_renderer(get_value: () => FileData | null | undefined) {
	let renderer = $state<"gsplat" | "babylon">();
	let data = $state<Uint8Array<ArrayBuffer>>();
	let gsplat_component = $state<typeof Canvas3DGS>();
	let babylon_component = $state<typeof Canvas3D>();

	$effect(() => {
		const file = get_value();
		renderer = undefined;
		data = undefined;
		if (!file) return;

		const is_splat = file.path.endsWith(".splat");
		const is_ply = file.path.endsWith(".ply");

		let stale = false;
		const use = (source: PlySource): void => {
			if (stale) return;
			renderer = source.renderer;
			data = source.renderer === "babylon" ? source.data : undefined;
			if (source.renderer === "gsplat") {
				void import("./Canvas3DGS.svelte").then((module) => {
					if (!stale) gsplat_component = module.default;
				});
			} else {
				void import("./Canvas3D.svelte").then((module) => {
					if (!stale) babylon_component = module.default;
				});
			}
		};

		if (is_ply && file.url) {
			void resolve_ply_source(file.url).then(use);
		} else {
			use({ renderer: is_splat || is_ply ? "gsplat" : "babylon" });
		}

		return () => {
			stale = true;
		};
	});

	return {
		get renderer() {
			return renderer;
		},
		get data() {
			return data;
		},
		get gsplat_component() {
			return gsplat_component;
		},
		get babylon_component() {
			return babylon_component;
		}
	};
}
