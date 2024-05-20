import { onDestroy } from "svelte";
import { writable } from "svelte/store";

const sizes = {
	sm: "(min-width: 640px)",
	md: "(min-width: 768px)",
	lg: "(min-width: 1024px)",
	xl: "(min-width: 1280px)",
	"2xl": "(min-width: 1536px)"
} as const;

const _default = {
	sm: false,
	md: false,
	lg: false,
	xl: false,
	"2xl": false
};

export const media_query = () => {
	const { subscribe, update } = writable(_default);

	const listeners: {
		[key: string]: [MediaQueryList, (ev: MediaQueryListEvent) => any];
	} = {};
	const onChange = (key: string) => () =>
		update((s) => ({ ...s, [key]: !!listeners[key][0].matches }));

	if (typeof window !== "undefined") {
		for (const key in sizes) {
			const mql = window.matchMedia(sizes[key as keyof typeof sizes]);
			const listener = onChange(key);

			mql.addEventListener("change", listener);

			listeners[key] = [mql, listener];
		}

		onDestroy(() => {
			for (const key in listeners) {
				const [_mql, _listener] = listeners[key];
				_mql.removeEventListener("change", _listener);
			}
		});
	}

	return { subscribe };
};

import slugify from "@sindresorhus/slugify";

export function make_slug_processor() {
	const seen_slugs = new Map();

	return function (name: string) {
		const slug = slugify(name, { separator: "-", lowercase: true });
		let count = seen_slugs.get(slug);
		if (count) {
			seen_slugs.set(slug, count + 1);
			return `${slug}-${count + 1}`;
		} else {
			seen_slugs.set(slug, 1);
			return slug;
		}
	};
}

export const gradio_templates = {
	interface: () =>
		import("/src/lib/templates/gradio/01_building-demos/01_interface.svx"),
	chatinterface: () =>
		import("/src/lib/templates/gradio/01_building-demos/02_chatinterface.svx"),
	tabbedinterface: () =>
		import(
			"/src/lib/templates/gradio/01_building-demos/03_tabbedinterface.svx"
		),
	blocks: () =>
		import("/src/lib/templates/gradio/01_building-demos/04_blocks.svx"),
	accordion: () =>
		import("/src/lib/templates/gradio/02_blocks-layout/accordion.svx"),
	column: () => import("/src/lib/templates/gradio/02_blocks-layout/column.svx"),
	row: () => import("/src/lib/templates/gradio/02_blocks-layout/row.svx"),
	group: () => import("/src/lib/templates/gradio/02_blocks-layout/group.svx"),
	tab: () => import("/src/lib/templates/gradio/02_blocks-layout/tab.svx"),
	introduction: () =>
		import("/src/lib/templates/gradio/03_components/01_introduction.svx"),
	annotatedimage: () =>
		import("/src/lib/templates/gradio/03_components/annotatedimage.svx"),
	audio: () => import("/src/lib/templates/gradio/03_components/audio.svx"),
	plot: () => import("/src/lib/templates/gradio/03_components/plot.svx"),
	barplot: () => import("/src/lib/templates/gradio/03_components/barplot.svx"),
	button: () => import("/src/lib/templates/gradio/03_components/button.svx"),
	chatbot: () => import("/src/lib/templates/gradio/03_components/chatbot.svx"),
	checkbox: () =>
		import("/src/lib/templates/gradio/03_components/checkbox.svx"),
	checkboxgroup: () =>
		import("/src/lib/templates/gradio/03_components/checkboxgroup.svx"),
	clearbutton: () =>
		import("/src/lib/templates/gradio/03_components/clearbutton.svx"),
	code: () => import("/src/lib/templates/gradio/03_components/code.svx"),
	colorpicker: () =>
		import("/src/lib/templates/gradio/03_components/colorpicker.svx"),
	dataframe: () =>
		import("/src/lib/templates/gradio/03_components/dataframe.svx"),
	dataset: () => import("/src/lib/templates/gradio/03_components/dataset.svx"),
	downloadbutton: () =>
		import("/src/lib/templates/gradio/03_components/downloadbutton.svx"),
	dropdown: () =>
		import("/src/lib/templates/gradio/03_components/dropdown.svx"),
	duplicatebutton: () =>
		import("/src/lib/templates/gradio/03_components/duplicatebutton.svx"),
	file: () => import("/src/lib/templates/gradio/03_components/file.svx"),
	fileexplorer: () =>
		import("/src/lib/templates/gradio/03_components/fileexplorer.svx"),
	gallery: () => import("/src/lib/templates/gradio/03_components/gallery.svx"),
	highlightedtext: () =>
		import("/src/lib/templates/gradio/03_components/highlightedtext.svx"),
	html: () => import("/src/lib/templates/gradio/03_components/html.svx"),
	image: () => import("/src/lib/templates/gradio/03_components/image.svx"),
	imageeditor: () =>
		import("/src/lib/templates/gradio/03_components/imageeditor.svx"),
	json: () => import("/src/lib/templates/gradio/03_components/json.svx"),
	label: () => import("/src/lib/templates/gradio/03_components/label.svx"),
	lineplot: () =>
		import("/src/lib/templates/gradio/03_components/lineplot.svx"),
	loginbutton: () =>
		import("/src/lib/templates/gradio/03_components/loginbutton.svx"),
	logoutbutton: () =>
		import("/src/lib/templates/gradio/03_components/logoutbutton.svx"),
	markdown: () =>
		import("/src/lib/templates/gradio/03_components/markdown.svx"),
	model3d: () => import("/src/lib/templates/gradio/03_components/model3d.svx"),
	multimodaltextbox: () =>
		import("/src/lib/templates/gradio/03_components/multimodaltextbox.svx"),
	number: () => import("/src/lib/templates/gradio/03_components/number.svx"),
	paramviewer: () =>
		import("/src/lib/templates/gradio/03_components/paramviewer.svx"),
	radio: () => import("/src/lib/templates/gradio/03_components/radio.svx"),
	scatterplot: () =>
		import("/src/lib/templates/gradio/03_components/scatterplot.svx"),
	slider: () => import("/src/lib/templates/gradio/03_components/slider.svx"),
	state: () => import("/src/lib/templates/gradio/03_components/state.svx"),
	textbox: () => import("/src/lib/templates/gradio/03_components/textbox.svx"),
	uploadbutton: () =>
		import("/src/lib/templates/gradio/03_components/uploadbutton.svx"),
	video: () => import("/src/lib/templates/gradio/03_components/video.svx"),
	simpleimage: () =>
		import("/src/lib/templates/gradio/03_components/simpleimage.svx"),
	set_static_paths: () =>
		import("/src/lib/templates/gradio/04_helpers/set_static_paths.svx"),
	eventdata: () => import("/src/lib/templates/gradio/04_helpers/eventdata.svx"),
	examples: () => import("/src/lib/templates/gradio/04_helpers/examples.svx"),
	progress: () => import("/src/lib/templates/gradio/04_helpers/progress.svx"),
	make_waveform: () =>
		import("/src/lib/templates/gradio/04_helpers/make_waveform.svx"),
	load: () => import("/src/lib/templates/gradio/04_helpers/load.svx"),
	error: () => import("/src/lib/templates/gradio/05_modals/error.svx"),
	warning: () => import("/src/lib/templates/gradio/05_modals/warning.svx"),
	info: () => import("/src/lib/templates/gradio/05_modals/info.svx"),
	request: () => import("/src/lib/templates/gradio/06_routes/request.svx"),
	mount_gradio_app: () =>
		import("/src/lib/templates/gradio/06_routes/mount_gradio_app.svx"),
	flagging: () => import("/src/lib/templates/gradio/other/01_flagging.svx"),
	themes: () => import("/src/lib/templates/gradio/other/02_themes.svx"),
	NO_RELOAD: () => import("/src/lib/templates/gradio/other/NO_RELOAD.svx")
};

export const python_client_templates = {
	introduction: () =>
		import(
			"/src/lib/templates/python-client/gradio_client/01_introduction.svx"
		),
	client: () =>
		import("/src/lib/templates/python-client/gradio_client/client.svx"),
	job: () => import("/src/lib/templates/python-client/gradio_client/job.svx")
};
