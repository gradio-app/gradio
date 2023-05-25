/**
 * Loads a CSS file and appends it to the document head.
 * The optional timeout parameter will resolve the promise without error
 * if the CSS file has not loaded after the specified time.
 *
 * @param url URL to load.
 * @param timeout Optional timeout, in milliseconds.
 */
export function mount_css(url: string, timeout?: number): Promise<unknown> {
	const existing_link = document.querySelector(`link[href='${url}']`);

	if (existing_link) return Promise.resolve();

	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = url;
	document.head.appendChild(link);

	const loadPromise = new Promise((res, rej) => {
		link.addEventListener("load", res);
		link.addEventListener("error", (err) => {
			console.error(`load_css: failed to load CSS`, url, err);
			rej(err);
		});
	});

	if (timeout) {
		const timeoutPromise = new Promise((res) => setTimeout(res, timeout));
		return Promise.race([loadPromise, timeoutPromise]);
	}
	return loadPromise;
}
