import themeCSS from "$lib/assets/theme.css?raw";

export function clickOutside(
	element: HTMLDivElement,
	callbackFunction: () => void
) {
	function onClick(event: MouseEvent) {
		if (!element.contains(event.target as Node)) {
			callbackFunction();
		}
	}

	document.body.addEventListener("click", onClick);

	return {
		update(newCallbackFunction: () => void) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener("click", onClick);
		}
	};
}

/**
 * Returns true if the component's CSS uses `position: fixed`,
 * meaning it needs iframe isolation to render correctly in the gallery.
 */
export function needs_iframe(css_template: string | undefined): boolean {
	if (!css_template) return false;
	return /position\s*:\s*fixed/i.test(css_template);
}

/**
 * Render a component's template string (Handlebars + JS template literals)
 * the same way BaseHTML does, but synchronously in the parent page.
 */
function render_template(template: string, props: Record<string, any>): string {
	try {
		const keys = Object.keys(props);
		const values = Object.values(props);
		const fn = new Function(...keys, `return \`${template}\``);
		return fn(...values);
	} catch (e) {
		console.error("Template rendering error:", e);
		return "";
	}
}

/**
 * Build a self-contained HTML document string for rendering a component
 * inside an iframe. Includes theme CSS, component CSS, rendered HTML,
 * and js_on_load with a reactive props proxy.
 */
export function build_srcdoc(
	component: {
		html_template: string;
		css_template: string;
		js_on_load?: string | null;
		head?: string | null;
		default_props: Record<string, any>;
	},
	props: Record<string, any>,
	dark: boolean = false
): string {
	const html = render_template(component.html_template, props);
	const css = render_template(component.css_template, props);

	// Escape </script in JS content to prevent premature script tag closure
	const safe_props = JSON.stringify(props).replace(/<\/script/gi, "<\\/script");
	const safe_js = (component.js_on_load || "").replace(
		/<\/script/gi,
		"<\\/script"
	);

	return `<!DOCTYPE html>
<html class="${dark ? "dark" : ""}">
<head>
<meta charset="utf-8">
<style>${themeCSS}</style>
<style>
html, body {
	margin: 0;
	padding: 0;
	height: 100%;
	background: var(--background-fill-primary, #0b0f19);
	color: var(--body-text-color, #c5c7cb);
	font-family: var(--font, system-ui, -apple-system, sans-serif);
}
#comp { ${css} }
</style>
${component.head || ""}
</head>
<body>
<div id="comp">${html}</div>
<script>
(function(){
var element = document.getElementById("comp");
var props = new Proxy(${safe_props}, {
	set: function(t, k, v) { t[k] = v; return true; }
});
function trigger() {}
${safe_js}
})();
<\/script>
</body>
</html>`;
}

export { themeCSS };
