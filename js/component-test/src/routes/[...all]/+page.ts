import config from "$lib/component_json";

// @ts-ignore
const comps = {
	// @ts-ignore
	accordion: () => import("@gradio/accordion"),
	audio: () => import("@gradio/audio"),
	// @ts-ignore
	button: () => import("@gradio/button"),
	// @ts-ignore
	chatbot: () => import("@gradio/chatbot"),
	// @ts-ignore
	checkbox: () => import("@gradio/checkbox"),
	// @ts-ignore
	checkboxgroup: () => import("@gradio/checkboxgroup"),
	// @ts-ignore
	code: () => import("@gradio/code"),
	// @ts-ignore
	colorpicker: () => import("@gradio/colorpicker"),
	// @ts-ignore
	dataframe: () => import("@gradio/dataframe"),
	// @ts-ignore
	dataset: () => import("@gradio/dataset"),
	// @ts-ignore
	datetime: () => import("@gradio/datetime"),
	// @ts-ignore
	downloadbutton: () => import("@gradio/downloadbutton"),
	// @ts-ignore
	dropdown: () => import("@gradio/dropdown"),
	// @ts-ignore
	file: () => import("@gradio/file"),
	// @ts-ignore
	gallery: () => import("@gradio/gallery"),
	// @ts-ignore
	highlightedtext: () => import("@gradio/highlightedtext"),
	// @ts-ignore
	html: () => import("@gradio/html"),
	// @ts-ignore
	image: () => import("@gradio/image"),
	// @ts-ignore
	imageeditor: () => import("@gradio/imageeditor"),
	// @ts-ignore
	json: () => import("@gradio/json"),
	// @ts-ignore
	label: () => import("@gradio/label"),
	// @ts-ignore
	markdown: () => import("@gradio/markdown"),
	// @ts-ignore
	model3d: () => import("@gradio/model3d"),
	// @ts-ignore
	multimodaltextbox: () => import("@gradio/multimodaltextbox"),
	// @ts-ignore
	number: () => import("@gradio/number"),
	// @ts-ignore
	paramviewer: () => import("@gradio/paramviewer"),
	// @ts-ignore
	plot: () => import("@gradio/plot"),
	// @ts-ignore
	radio: () => import("@gradio/radio"),
	// @ts-ignore
	simpleimage: () => import("@gradio/simpleimage"),
	// @ts-ignore
	slider: () => import("@gradio/slider"),
	// @ts-ignore
	state: () => import("@gradio/state"),
	// @ts-ignore
	textbox: () => import("@gradio/textbox"),
	// @ts-ignore
	timer: () => import("@gradio/timer"),
	// @ts-ignore
	uploadbutton: () => import("@gradio/uploadbutton"),
	// @ts-ignore
	video: () => import("@gradio/video")
};

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
	const route_name = url.pathname.split("/").slice(-1)[0];
	const interactive_component = config.find(
		(c) => c.name === route_name && c.props.interactive
	);
	const non_interactive_component = config.find(
		(c) => c.name === route_name && !c.props.interactive
	);

	const comp =
		route_name in comps
			? // @ts-ignore
				await comps[route_name]()
			: // @ts-ignore
				await import("@gradio/label");

	return {
		component: comp,
		interactive_component: interactive_component,
		non_interactive_component: non_interactive_component,
		name: route_name
	};
};
