export function is_self_origin(url: URL): boolean {
	return (
		url.origin === window.location.origin ||
		url.origin === "http://localhost:7860" // Ref: https://github.com/gradio-app/gradio/blob/v3.32.0/js/app/src/Index.svelte#L194
	);
}
