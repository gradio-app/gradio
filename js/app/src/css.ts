export function mount_css(url: string, target: HTMLElement): Promise<void> {
	const base = new URL(import.meta.url).origin;
	const _url = new URL(url, base).href;
	const existing_link = document.querySelector(`link[href='${_url}']`);

	if (existing_link) return Promise.resolve();

	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = _url;

	return new Promise((res, rej) => {
		link.addEventListener("load", () => res());
		link.addEventListener("error", () => {
			console.error(`Unable to preload CSS for ${_url}`);
			res();
		});
		target.appendChild(link);
	});
}
