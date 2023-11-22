// @ts-nocheck

export async function load_component({ api_url, name, id, variant }) {
	const comps = window.__GRADIO__CC__;

	const _component_map = {
		// eslint-disable-next-line no-undef
		...component_map,
		...(!comps ? {} : comps)
	};

	try {
		const c = await (
			_component_map?.[id]?.[variant] || // for dev mode custom components
			_component_map?.[name]?.[variant]
		)();
		return {
			name,
			component: c
		};
	} catch (e) {
		console.error(e);
		try {
			await load_css(`${api_url}/custom_component/${id}/${variant}/style.css`);
			const c = await import(
				/* @vite-ignore */ `${api_url}/custom_component/${id}/${variant}/index.js`
			);
			return {
				name,
				component: c
			};
		} catch (e) {
			if (variant === "example") {
				return {
					name,
					component: await import("@gradio/fallback/example")
				};
			}
			console.error(`failed to load: ${name}`);
			console.error(e);
			throw e;
		}
	}
}

function load_css(url) {
	return new Promise((resolve, reject) => {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		document.head.appendChild(link);
		link.onload = () => resolve();
		link.onerror = () => reject();
	});
}
