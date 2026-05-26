import type Canvas3D from "./Canvas3D.svelte";
import type Canvas3DGS from "./Canvas3DGS.svelte";
import type Canvas3DPLY from "./Canvas3DPLY.svelte";

export type Model3DRenderer = "mesh" | "ply" | "splat";
export type Canvas3DLike = Canvas3D | Canvas3DPLY;
export type Canvas3DComponentType = typeof Canvas3D;
export type Canvas3DGSComponentType = typeof Canvas3DGS;
export type Canvas3DPLYComponentType = typeof Canvas3DPLY;
export type Model3DCanvasComponent =
	| Canvas3DComponentType
	| Canvas3DGSComponentType
	| Canvas3DPLYComponentType;

export async function loadCanvas3D(): Promise<Canvas3DComponentType> {
	const module = await import("./Canvas3D.svelte");
	return module.default;
}

export async function loadCanvas3DGS(): Promise<Canvas3DGSComponentType> {
	const module = await import("./Canvas3DGS.svelte");
	return module.default;
}

export async function loadCanvas3DPLY(): Promise<Canvas3DPLYComponentType> {
	const module = await import("./Canvas3DPLY.svelte");
	return module.default;
}

export const model3d_renderer_loaders: Record<
	Model3DRenderer,
	() => Promise<Model3DCanvasComponent>
> = {
	mesh: loadCanvas3D,
	ply: loadCanvas3DPLY,
	splat: loadCanvas3DGS
};

export function renderer_for_model3d_path(path: string): Model3DRenderer {
	if (path.endsWith(".ply")) {
		return "ply";
	}
	if (path.endsWith(".splat")) {
		return "splat";
	}
	return "mesh";
}

export function load_renderer_component<T>(
	renderer: Model3DRenderer,
	loaders: Record<Model3DRenderer, () => Promise<T>>,
	assign: (renderer: Model3DRenderer, component: T) => void,
	on_error?: (error: unknown) => void
): () => void {
	let active = true;

	loaders[renderer]()
		.then((component) => {
			if (active) {
				assign(renderer, component);
			}
		})
		.catch((error) => {
			if (active) {
				on_error?.(error);
			}
		});

	return () => {
		active = false;
	};
}
