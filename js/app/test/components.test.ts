import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test
} from "vitest";
import { render, cleanup } from "@gradio/tootils";
import { setupi18n } from "../src/i18n";

import StaticAnnotatedImage from "@gradio/annotatedimage/static";
import StaticAudio from "@gradio/audio/static";
import StaticChatbot from "@gradio/chatbot/static";
import StaticCheckbox from "@gradio/checkbox/static";
import StaticCheckboxGroup from "@gradio/checkboxgroup/static";
import StaticColorPicker from "@gradio/colorpicker/static";
import StaticDataframe from "@gradio/dataframe/static";
import StaticDropdown from "@gradio/dropdown/static";
import StaticFile from "@gradio/file/static";
import StaticGallery from "@gradio/gallery/static";
import StaticHTML from "@gradio/html/static";
import StaticHighlightedText from "@gradio/highlightedtext/static";
import StaticJson from "@gradio/json/static";
import StaticLabel from "@gradio/label/static";
import StaticMarkdown from "@gradio/markdown/static";
import StaticModel3D from "@gradio/model3d/static";
import StaticNumber from "@gradio/number/static";
import StaticRadio from "@gradio/radio/static";
import StaticSlider from "@gradio/slider/static";
import StaticTextbox from "@gradio/textbox/static";
// import StaticTimeSeries from "@gradio/timeseries/static";
import StaticUploadButton from "@gradio/uploadbutton/static";
import StaticVideo from "@gradio/video/static";

import InteractiveAudio from "@gradio/audio/interactive";
import InteractiveCheckbox from "@gradio/checkbox/interactive";
import InteractiveCheckboxGroup from "@gradio/checkboxgroup/interactive";
import InteractiveColorPicker from "@gradio/colorpicker/interactive";
import InteractiveDataframe from "@gradio/dataframe/interactive";
import InteractiveDropdown from "@gradio/dropdown/interactive";
import InteractiveFile from "@gradio/file/interactive";
import InteractiveModel3D from "@gradio/model3d/interactive";
import InteractiveNumber from "@gradio/number/interactive";
import InteractiveRadio from "@gradio/radio/interactive";
import InteractiveSlider from "@gradio/slider/interactive";
import InteractiveTextbox from "@gradio/textbox/interactive";
// import InteractiveTimeSeries from "@gradio/timeseries/interactive";
import InteractiveUploadButton from "@gradio/uploadbutton/interactive";
import InteractiveVideo from "@gradio/video/interactive";
import { LoadingStatus } from "@gradio/statustracker";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete",
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

const components = [
	[
		"StaticAnnotatedImage",
		StaticAnnotatedImage,
		{ height: 100, width: 100, value: null }
	],
	["InteractiveAudio", InteractiveAudio, {}],
	["StaticAudio", StaticAudio, {}],

	["StaticChatbot", StaticChatbot, {}],
	["InteractiveCheckbox", InteractiveCheckbox, {}],
	["StaticCheckbox", StaticCheckbox, {}],
	[
		"InteractiveCheckboxGroup",
		InteractiveCheckboxGroup,
		{ choices: ["a", "b", "c"] }
	],
	["StaticCheckboxGroup", StaticCheckboxGroup, { choices: ["a", "b", "c"] }],
	["InteractiveColorPicker", InteractiveColorPicker, {}],
	["StaticColorPicker", StaticColorPicker, {}],
	[
		"InteractiveDataFrame",
		InteractiveDataframe,
		{ value: [[1, 2, 3]], col_count: [3, "fixed"], row_count: [3, "fixed"] }
	],
	[
		"StaticDataFrame",
		StaticDataframe,
		{ value: [[1, 2, 3]], col_count: [3, "fixed"], row_count: [3, "fixed"] }
	],
	["InteractiveDropdown", InteractiveDropdown, { choices: ["a", "b", "c"] }],
	["StaticDropdown", StaticDropdown, { choices: ["a", "b", "c"] }],
	["InteractiveFile", InteractiveFile, {}],
	["StaticFile", StaticFile, {}],

	["StaticGallery", StaticGallery, {}],

	["StaticHTML", StaticHTML, {}],

	["StaticHighlightedText", StaticHighlightedText, {}],

	["StaticJson", StaticJson, {}],

	["StaticLabel", StaticLabel, {}],

	["StaticMarkdown", StaticMarkdown, {}],
	["InteractiveModel3D", InteractiveModel3D, {}],
	["StaticModel3D", StaticModel3D, {}],
	["InteractiveNumber", InteractiveNumber, {}],
	["StaticNumber", StaticNumber, {}],
	["InteractiveRadio", InteractiveRadio, {}],
	["StaticRadio", StaticRadio, {}],
	["InteractiveSlider", InteractiveSlider, {}],
	["StaticSlider", StaticSlider, {}],
	["InteractiveTextbox", InteractiveTextbox, { container: false }],
	["StaticTextbox", StaticTextbox, { container: false }],
	// ["InteractiveTimeSeries", InteractiveTimeSeries, {}],
	// ["StaticTimeSeries", StaticTimeSeries, {}],
	["InteractiveUploadButton", InteractiveUploadButton, {}],
	["StaticUploadButton", StaticUploadButton, {}],
	["InteractiveVideo", InteractiveVideo, {}],
	["StaticVideo", StaticVideo, {}]
] as const;

describe("all components should apply provided class names", () => {
	beforeAll(() => {
		setupi18n();
	});

	afterEach(() => {
		cleanup();
	});

	components.forEach(([name, component, props]) => {
		test(name, async () => {
			const { container } = await render(component, {
				...props,
				loading_status,
				elem_classes: ["test-class"]
			});

			const elem = container.querySelector(`.test-class`);
			expect(elem).not.toBeNull();
		});
	});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should apply provided id", () => {
	beforeAll(() => {
		setupi18n();
	});

	afterEach(() => {
		cleanup();
	});

	components.forEach(([name, component, props]) => {
		test(name, async () => {
			const { container } = await render(component, {
				...props,
				loading_status,
				elem_id: "test-id"
			});

			const elem = container.querySelector(`#test-id`);
			expect(elem).not.toBeNull();
		});
	});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should be invisible when visible=false", () => {
	beforeAll(() => {
		setupi18n();
	});

	afterEach(() => {
		cleanup();
	});

	components.forEach(([name, component, props]) => {
		test(name, async () => {
			const { container } = await render(component, {
				...props,
				loading_status,
				elem_id: "test-id",
				visible: false
			});

			const elem = container.querySelector(`#test-id`);

			expect(elem).toHaveClass("hidden");
		});
	});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should have the appropriate label when set via the `label` prop", () => {
	beforeAll(() => {
		setupi18n();
	});

	afterEach(() => {
		cleanup();
	});

	components
		.filter(([name]) => name !== "StaticMarkdown" && name !== "StaticHTML")
		.forEach(([name, component, props]) => {
			test(name, async () => {
				const { getAllByText } = await render(component, {
					...props,
					loading_status,
					label: name + "LABEL_TEST"
				});

				const elems = getAllByText(name + "LABEL_TEST");

				expect(elems.length).toBeGreaterThan(0);
			});
		});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should hide their label when `show_label=false`", () => {
	components.forEach(([name, component, props]) => {
		test.todo(name);
	});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should show their label when `show_label=true`", () => {
	components.forEach(([name, component, props]) => {
		test.todo(name);
	});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should hide their container when `container=false`", () => {
	components.forEach(([name, component, props]) => {
		test.todo(name);
	});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});
