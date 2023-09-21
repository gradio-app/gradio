export function is_self_host(url: URL): boolean {
	return (
		url.host === window.location.host || url.host === "localhost:7860" // Ref: https://github.com/gradio-app/gradio/blob/v3.32.0/js/app/src/Index.svelte#L194
	);
}
