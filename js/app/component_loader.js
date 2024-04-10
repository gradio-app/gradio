// @ts-nocheck

const request_map = {};

export function load_component({ api_url, name, id, variant }) {
	const comps = window.__GRADIO__CC__;

	const _component_map = {
		// eslint-disable-next-line no-undef
		...component_map,
		...(!comps ? {} : comps)
	};

	if (request_map[`${id}-${variant}`]) {
		return { component: request_map[`${id}-${variant}`], name };
	}
	try {
		if (!_component_map?.[id]?.[variant] && !_component_map?.[name]?.[variant])
			throw new Error();

		request_map[`${id}-${variant}`] = (
			_component_map?.[id]?.[variant] || // for dev mode custom components
			_component_map?.[name]?.[variant]
		)();

		return {
			name,
			component: request_map[`${id}-${variant}`]
		};
	} catch (e) {
		try {
			request_map[`${id}-${variant}`] = get_component_with_css(
				api_url,
				id,
				variant
			);

			return {
				name,
				component: request_map[`${id}-${variant}`]
			};
		} catch (e) {
			if (variant === "example") {
				request_map[`${id}-${variant}`] = import("@gradio/fallback/example");

				return {
					name,
					component: request_map[`${id}-${variant}`]
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

function get_component_with_css(api_url, id, variant) {
	return Promise.all([
		load_css(`${api_url}/custom_component/${id}/${variant}/style.css`),
		import(
			/* @vite-ignore */ `${api_url}/custom_component/${id}/${variant}/index.js`
		)
	]).then(([_, module]) => {
		return module;
	});
}
