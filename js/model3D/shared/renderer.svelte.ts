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
	// Deliberately not reactive: the effect reads it to recognise a value it has
	// already resolved, and tracking it would make the effect re-run itself.
	let resolved: string | undefined;

	$effect(() => {
		const file = get_value();
		const key = file ? `${file.path}\n${file.url ?? ""}` : "";
		// Re-resolving a value already on screen would tear the canvas down and
		// cost Babylon an engine.
		if (key === resolved) return;

		resolved = undefined;
		renderer = undefined;
		data = undefined;
		if (!file) return;

		// Babylon lowercases the extension before it picks a loader, so an
		// upper-case one has to be recognised here too or it reaches the splat
		// loader without its header ever being read.
		const path = file.path.toLowerCase();
		const is_splat = path.endsWith(".splat");
		const is_ply = path.endsWith(".ply");

		let stale = false;
		const use = (source: PlySource): void => {
			if (stale) return;
			// Only now, so an effect re-run while the header is still in flight
			// starts over rather than settling on nothing.
			resolved = key;
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
