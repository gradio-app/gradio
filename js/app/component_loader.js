// @ts-nocheck

export async function load_component(name, mode) {
	const comps = window.__GRADIO__CC__;

	const _component_map = {
		...component_map,
		...(!comps ? {} : comps)
	};
	try {
		//@ts-ignore
		const c = await (
			_component_map[name][mode] || _component_map[name]["static"]
		)();
		return {
			name,
			component: c
		};
	} catch (e) {
		try {
			const c = await import(/* @vite-ignore */ "/custom_component/" + name);
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
