export type Model3DRenderer = "mesh" | "ply" | "splat";

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
