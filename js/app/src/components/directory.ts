export const component_map = {
	accordion: {
		static: () => import("@gradio/accordion/static")
	},
	annotatedimage: {
		static: () => import("@gradio/annotatedimage/static")
	},
	audio: {
		static: () => import("@gradio/audio/static"),
		interactive: () => import("@gradio/audio/interactive"),
		example: () => import("@gradio/audio/example")
	},
	box: {
		static: () => import("@gradio/box/static")
	},
	button: {
		static: () => import("@gradio/button/static")
	},
	chatbot: {
		static: () => import("@gradio/chatbot/static")
	},
	checkbox: {
		static: () => import("@gradio/checkbox/static"),
		interactive: () => import("@gradio/checkbox/interactive"),
		example: () => import("@gradio/checkbox/example")
	},
	checkboxgroup: {
		static: () => import("@gradio/checkboxgroup/static"),
		interactive: () => import("@gradio/checkboxgroup/interactive"),
		example: () => import("@gradio/checkboxgroup/example")
	},
	code: {
		static: () => import("@gradio/code/static"),
		interactive: () => import("@gradio/code/interactive"),
		example: () => import("@gradio/code/example")
	},
	colorpicker: {
		static: () => import("@gradio/colorpicker/static"),
		interactive: () => import("@gradio/colorpicker/interactive"),
		example: () => import("@gradio/colorpicker/example")
	},
	column: {
		static: () => import("@gradio/column/static")
	},
	dataframe: {
		static: () => import("@gradio/dataframe/static"),
		interactive: () => import("@gradio/dataframe/interactive"),
		example: () => import("@gradio/dataframe/example")
	},
	dataset: {
		static: () => import("./Dataset")
	},
	dropdown: {
		static: () => import("@gradio/dropdown/static"),
		interactive: () => import("@gradio/dropdown/interactive"),
		example: () => import("@gradio/dropdown/example")
	},
	file: {
		static: () => import("@gradio/file/static"),
		interactive: () => import("@gradio/file/interactive"),
		example: () => import("@gradio/file/example")
	},
	form: {
		static: () => import("@gradio/form/static")
	},
	gallery: {
		static: () => import("@gradio/gallery/static")
	},
	group: {
		static: () => import("@gradio/group/static")
	},
	highlightedtext: {
		static: () => import("@gradio/highlightedtext/static"),
		interactive: () => import("@gradio/highlightedtext/interactive")
	},
	fileexplorer: {
		static: () => import("@gradio/fileexplorer/static"),
		interactive: () => import("@gradio/fileexplorer/interactive")
	},
	html: {
		static: () => import("@gradio/html/static"),
		example: () => import("@gradio/html/example")
	},
	image: {
		static: () => import("@gradio/image/static"),
		interactive: () => import("@gradio/image/interactive"),
		example: () => import("@gradio/image/example")
	},
	interpretation: {
		static: () => import("./Interpretation"),
		interactive: () => import("./Interpretation")
	},
	json: {
		static: () => import("@gradio/json/static")
	},
	label: {
		static: () => import("@gradio/label/static")
	},
	markdown: {
		static: () => import("@gradio/markdown/static"),
		example: () => import("@gradio/markdown/example")
	},
	model3d: {
		static: () => import("@gradio/model3d/static"),
		interactive: () => import("@gradio/model3d/interactive"),
		example: () => import("@gradio/model3d/example")
	},
	number: {
		static: () => import("@gradio/number/static"),
		interactive: () => import("@gradio/number/interactive"),
		example: () => import("@gradio/number/example")
	},
	plot: {
		static: () => import("@gradio/plot/static")
	},
	radio: {
		static: () => import("@gradio/radio/static"),
		interactive: () => import("@gradio/radio/interactive"),
		example: () => import("@gradio/radio/example")
	},
	row: {
		static: () => import("@gradio/row/static")
	},
	slider: {
		static: () => import("@gradio/slider/static"),
		interactive: () => import("@gradio/slider/interactive"),
		example: () => import("@gradio/slider/example")
	},
	state: {
		static: () => import("./State")
	},
	statustracker: {
		static: () => import("@gradio/statustracker/static")
	},
	tabs: {
		static: () => import("@gradio/tabs/static")
	},
	tabitem: {
		static: () => import("@gradio/tabitem/static")
	},
	textbox: {
		static: () => import("@gradio/textbox/static"),
		interactive: () => import("@gradio/textbox/interactive"),
		example: () => import("@gradio/textbox/example")
	},
	uploadbutton: {
		static: () => import("@gradio/uploadbutton/static"),
		interactive: () => import("@gradio/uploadbutton/interactive")
	},
	video: {
		static: () => import("@gradio/video/static"),
		interactive: () => import("@gradio/video/interactive"),
		example: () => import("@gradio/video/example")
	}
};

import InteractiveFallback from "@gradio/fallback/interactive";
import StaticFallback from "@gradio/fallback/static";
import ExampleFallback from "@gradio/fallback/example";

export const fallback_component_map = {
	interactive: InteractiveFallback,
	static: StaticFallback,
	example: ExampleFallback
};
