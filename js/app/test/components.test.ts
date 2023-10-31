import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { render, cleanup } from "@gradio/tootils";
import { setupi18n } from "../src/i18n";
import { Gradio } from "../src/gradio_helper";

import StaticAnnotatedImage from "@gradio/annotatedimage";
import StaticAudio from "@gradio/audio";
import StaticChatbot from "@gradio/chatbot";
import StaticCheckbox from "@gradio/checkbox";
import StaticCheckboxGroup from "@gradio/checkboxgroup";
import StaticColorPicker from "@gradio/colorpicker";
import StaticDataframe from "@gradio/dataframe";
import StaticDropdown from "@gradio/dropdown";
import StaticFile from "@gradio/file";
import StaticGallery from "@gradio/gallery";
import StaticHTML from "@gradio/html";
import StaticHighlightedText from "@gradio/highlightedtext";
import StaticJson from "@gradio/json";
import StaticLabel from "@gradio/label";
import StaticMarkdown from "@gradio/markdown";
import StaticModel3D from "@gradio/model3d";
import StaticNumber from "@gradio/number";
import StaticRadio from "@gradio/radio";
import StaticSlider from "@gradio/slider";
import StaticTextbox from "@gradio/textbox";
import StaticUploadButton from "@gradio/uploadbutton";
import StaticVideo from "@gradio/video";

import InteractiveAudio from "@gradio/audio";
import InteractiveCheckbox from "@gradio/checkbox";
import InteractiveCheckboxGroup from "@gradio/checkboxgroup";
import InteractiveColorPicker from "@gradio/colorpicker";
import InteractiveDataframe from "@gradio/dataframe";
import InteractiveDropdown from "@gradio/dropdown";
import InteractiveFile from "@gradio/file";
import InteractiveModel3D from "@gradio/model3d";
import InteractiveNumber from "@gradio/number";
import InteractiveRadio from "@gradio/radio";
import InteractiveSlider from "@gradio/slider";
import InteractiveTextbox from "@gradio/textbox";
import InteractiveUploadButton from "@gradio/uploadbutton";
import InteractiveVideo from "@gradio/video";
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
		{ height: 100, width: 100, value: null, interactive: false }
	],
	["InteractiveAudio", InteractiveAudio, { interactive: true }],
	["StaticAudio", StaticAudio, { interactive: false }],

	["StaticChatbot", StaticChatbot, { interactive: false }],
	["InteractiveCheckbox", InteractiveCheckbox, { interactive: true }],
	["StaticCheckbox", StaticCheckbox, { interactive: false }],
	[
		"InteractiveCheckboxGroup",
		InteractiveCheckboxGroup,
		{ choices: ["a", "b", "c"], interactive: true }
	],
	[
		"StaticCheckboxGroup",
		StaticCheckboxGroup,
		{ choices: ["a", "b", "c"], interactive: false }
	],
	["InteractiveColorPicker", InteractiveColorPicker, { interactive: true }],
	["StaticColorPicker", StaticColorPicker, { interactive: false }],
	[
		"InteractiveDataFrame",
		InteractiveDataframe,
		{
			value: [[1, 2, 3]],
			col_count: [3, "fixed"],
			row_count: [3, "fixed"],
			interactive: true
		}
	],
	[
		"StaticDataFrame",
		StaticDataframe,
		{
			value: [[1, 2, 3]],
			col_count: [3, "fixed"],
			row_count: [3, "fixed"],
			interactive: false
		}
	],
	[
		"InteractiveDropdown",
		InteractiveDropdown,
		{ choices: ["a", "b", "c"], interactive: true }
	],
	[
		"StaticDropdown",
		StaticDropdown,
		{ choices: ["a", "b", "c"], interactive: false }
	],
	["InteractiveFile", InteractiveFile, { interactive: true }],
	["StaticFile", StaticFile, { interactive: false }],

	["StaticGallery", StaticGallery, { interactive: false }],

	["StaticHTML", StaticHTML, { interactive: false }],

	["StaticHighlightedText", StaticHighlightedText, { interactive: false }],

	["StaticJson", StaticJson, { interactive: false }],

	["StaticLabel", StaticLabel, { interactive: false }],

	["StaticMarkdown", StaticMarkdown, { interactive: false }],
	["InteractiveModel3D", InteractiveModel3D, { interactive: true }],
	["StaticModel3D", StaticModel3D, { interactive: false }],
	["InteractiveNumber", InteractiveNumber, { interactive: true }],
	["StaticNumber", StaticNumber, { interactive: false }],
	["InteractiveRadio", InteractiveRadio, { interactive: true }],
	["StaticRadio", StaticRadio, { interactive: false }],
	["InteractiveSlider", InteractiveSlider, { interactive: true }],
	["StaticSlider", StaticSlider, { interactive: false }],
	[
		"InteractiveTextbox",
		InteractiveTextbox,
		{ container: false, interactive: true }
	],
	["StaticTextbox", StaticTextbox, { container: false, interactive: false }],
	// ["InteractiveTimeSeries", InteractiveTimeSeries, {}],
	// ["StaticTimeSeries", StaticTimeSeries, {}],
	["InteractiveUploadButton", InteractiveUploadButton, { interactive: true }],
	["StaticUploadButton", StaticUploadButton, { interactive: false }],
	["InteractiveVideo", InteractiveVideo, { interactive: true }],
	["StaticVideo", StaticVideo, { interactive: false }]
] as const;

describe("all components should apply provided class names", () => {
	beforeAll(async () => {
		await setupi18n();
	});

	afterEach(() => {
		cleanup();
	});

	components.forEach(([name, component, props]) => {
		test(name, async () => {
			const { container } = await render(component, {
				...props,
				loading_status,
				elem_classes: ["test-class"],
				gradio: new Gradio(
					0,
					document.createElement("div"),
					"light",
					"3.1.1",
					"",
					false
				)
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
	beforeAll(async () => {
		await setupi18n();
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
	beforeAll(async () => {
		await setupi18n();
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
	beforeAll(async () => {
		await setupi18n();
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
