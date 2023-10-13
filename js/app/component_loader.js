// @ts-nocheck

export async function load_component(api_url, name, mode, id) {
	const comps = window.__GRADIO__CC__;

	const _component_map = {
		// eslint-disable-next-line no-undef
		...component_map,
		...(!comps ? {} : comps)
	};
	try {
		//@ts-ignore
		const c = await (
			_component_map?.[id]?.[mode] || // for dev mode custom components
			_component_map?.[name]?.[mode] ||
			_component_map?.[name]?.["static"]
		)();
		return {
			name,
			component: c
		};
	} catch (e) {
		try {
			await load_css(`${api_url}/custom_component/${id}/${mode}/style.css`);
			const c = await import(
				/* @vite-ignore */ `${api_url}/custom_component/${id}/${mode}/index.js`
			);
			return {
				name,
				component: c
			};
		} catch (e) {
			if (mode === "example") {
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
