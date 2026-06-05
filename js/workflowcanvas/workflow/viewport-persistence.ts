export interface Viewport {
	x: number;
	y: number;
	zoom: number;
}

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

export function viewport_storage_key(name: string): string {
	return `gradio_workflow_viewport:${name}`;
}

export function load_viewport(
	name: string,
	storage: Storage | undefined = typeof localStorage !== "undefined"
		? localStorage
		: undefined
): Viewport {
	if (!storage) return { ...DEFAULT_VIEWPORT };
	try {
		const raw = storage.getItem(viewport_storage_key(name));
		if (!raw) return { ...DEFAULT_VIEWPORT };
		const v = JSON.parse(raw);
		if (
			typeof v?.x === "number" &&
			typeof v?.y === "number" &&
			typeof v?.zoom === "number"
		) {
			return { x: v.x, y: v.y, zoom: v.zoom };
		}
	} catch {}
	return { ...DEFAULT_VIEWPORT };
}

export function save_viewport(
	name: string,
	viewport: Viewport,
	storage: Storage | undefined = typeof localStorage !== "undefined"
		? localStorage
		: undefined
): void {
	if (!storage) return;
	try {
		storage.setItem(viewport_storage_key(name), JSON.stringify(viewport));
	} catch {}
}
