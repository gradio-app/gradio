let supports_adopted_stylesheets = false;

if (
	"attachShadow" in Element.prototype &&
	"adoptedStyleSheets" in Document.prototype
) {
	// Both Shadow DOM and adoptedStyleSheets are supported
	const shadow_root_test = document
		.createElement("div")
		.attachShadow({ mode: "open" });
	supports_adopted_stylesheets = "adoptedStyleSheets" in shadow_root_test;
}

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
): HTMLStyleElement | null {
	if (!supports_adopted_stylesheets) return null;
	style_element.remove();

	const stylesheet = new CSSStyleSheet();
	stylesheet.replaceSync(string);

	let importString = "";
	string = string.replace(/@import\s+url\((.*?)\);\s*/g, (match, url) => {
		importString += `@import url(${url});\n`;
		return ""; // remove and store any @import statements from the CSS
	});

	const rules = stylesheet.cssRules;

	let css_string = "";
	let gradio_css_infix = `gradio-app .gradio-container.gradio-container-${version} .contain `;

	for (let i = 0; i < rules.length; i++) {
		const rule = rules[i];

		let is_dark_rule = rule.cssText.includes(".dark");
		if (rule instanceof CSSStyleRule) {
			const selector = rule.selectorText;
			if (selector) {
				const new_selector = selector
					.replace(".dark", "")
					.split(",")
					.map(
						(s) =>
							`${is_dark_rule ? ".dark" : ""} ${gradio_css_infix} ${s.trim()} `
					)
					.join(",");

				css_string += rule.cssText;
				css_string += rule.cssText.replace(selector, new_selector);
			}
		} else if (rule instanceof CSSMediaRule) {
			let mediaCssString = `@media ${rule.media.mediaText} {`;
			for (let j = 0; j < rule.cssRules.length; j++) {
				const innerRule = rule.cssRules[j];
				if (innerRule instanceof CSSStyleRule) {
					let is_dark_rule = innerRule.cssText.includes(".dark ");
					const selector = innerRule.selectorText;
					const new_selector = selector
						.replace(".dark", "")
						.split(",")
						.map(
							(s) =>
								`${
									is_dark_rule ? ".dark" : ""
								} ${gradio_css_infix} ${s.trim()} `
						)
						.join(",");
					mediaCssString += innerRule.cssText.replace(selector, new_selector);
				}
			}
			mediaCssString += "}";
			css_string += mediaCssString;
		} else if (rule instanceof CSSKeyframesRule) {
			css_string += `@keyframes ${rule.name} {`;
			for (let j = 0; j < rule.cssRules.length; j++) {
				const innerRule = rule.cssRules[j];
				if (innerRule instanceof CSSKeyframeRule) {
					css_string += `${innerRule.keyText} { ${innerRule.style.cssText} }`;
				}
			}
			css_string += "}";
		} else if (rule instanceof CSSFontFaceRule) {
			css_string += `@font-face { ${rule.style.cssText} }`;
		}
	}
	css_string = importString + css_string;
	style_element.textContent = css_string;

	document.head.appendChild(style_element);
	return style_element;
}
