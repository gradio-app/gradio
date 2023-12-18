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

export function prefix_css(
	string: string,
	version: string,
	style_element = document.createElement("style")
): HTMLStyleElement {
	style_element.remove();

	const stylesheet = new CSSStyleSheet();
	stylesheet.replaceSync(string);

	const rules = stylesheet.cssRules;

	let css_string = "";

	for (let i = 0; i < rules.length; i++) {
		const rule = rules[i];

		if (rule instanceof CSSStyleRule) {
			const selector = rule.selectorText;
			if (selector) {
				const new_selector = selector
					.split(",")
					.map(
						(s) =>
							`gradio-app .gradio-container.gradio-container-${version} .contain ${s.trim()}`
					)
					.join(",");

				css_string += rule.cssText;
				css_string += rule.cssText.replace(selector, new_selector);
			}
		}
	}
	style_element.textContent = css_string;

	document.head.appendChild(style_element);
	return style_element;
}
