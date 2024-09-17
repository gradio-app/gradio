import config from "$lib/component_json";

const comps = {
	accordion: () => import("@gradio/accordion"),
	annotatedimage: () => import("@gradio/annotatedimage"),
	audio: () => import("@gradio/audio"),
	button: () => import("@gradio/button"),
	chatbot: () => import("@gradio/chatbot"),
	checkbox: () => import("@gradio/checkbox"),
	checkboxgroup: () => import("@gradio/checkboxgroup"),
	code: () => import("@gradio/code"),
	colorpicker: () => import("@gradio/colorpicker"),
	dataframe: () => import("@gradio/dataframe"),
	dataset: () => import("@gradio/dataset"),
	datetime: () => import("@gradio/datetime"),
	downloadbutton: () => import("@gradio/downloadbutton"),
	dropdown: () => import("@gradio/dropdown"),
	file: () => import("@gradio/file"),
	form: () => import("@gradio/form"),
	gallery: () => import("@gradio/gallery"),
	highlightedtext: () => import("@gradio/highlightedtext"),
	html: () => import("@gradio/html"),
	image: () => import("@gradio/image"),
	imageeditor: () => import("@gradio/imageeditor"),
	json: () => import("@gradio/json"),
	label: () => import("@gradio/label"),
	markdown: () => import("@gradio/markdown"),
	model3d: () => import("@gradio/model3d"),
	multimodaltextbox: () => import("@gradio/multimodaltextbox"),
	nativeplot: () => import("@gradio/nativeplot"),
	number: () => import("@gradio/number"),
	paramviewer: () => import("@gradio/paramviewer"),
	plot: () => import("@gradio/plot"),
	radio: () => import("@gradio/radio"),
	simpleimage: () => import("@gradio/simpleimage"),
	slider: () => import("@gradio/slider"),
	state: () => import("@gradio/state"),
	textbox: () => import("@gradio/textbox"),
	timer: () => import("@gradio/timer"),
	uploadbutton: () => import("@gradio/uploadbutton"),
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
			? await comps[route_name as keyof typeof comps]()
			: await import("@gradio/label");

	return {
		component: comp,
		interactive_component: interactive_component,
		non_interactive_component: non_interactive_component,
		name: route_name
	};
};
