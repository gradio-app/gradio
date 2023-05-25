export function mount_css(url: string): Promise<void> {
	const existing_link = document.querySelector(`link[href='${url}']`);

	if (existing_link) return Promise.resolve();

	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = url;
	document.head.appendChild(link);

	return new Promise((res, rej) => {
		link.addEventListener("load", () => res());
		link.addEventListener("error", () =>
			rej(new Error(`Unable to preload CSS for ${url}`))
		);
	});
}
