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

import AnnotatedImage from "../src/components/AnnotatedImage/AnnotatedImage.svelte";
import Audio from "../src/components/Audio/Audio.svelte";
import Chatbot from "../src/components/Chatbot/Chatbot.svelte";
import Checkbox from "../src/components/Checkbox/Checkbox.svelte";
import CheckboxGroup from "../src/components/CheckboxGroup/CheckboxGroup.svelte";
import ColorPicker from "../src/components/ColorPicker/ColorPicker.svelte";
import DataFrame from "../src/components/DataFrame/DataFrame.svelte";
import Dropdown from "../src/components/Dropdown/Dropdown.svelte";
import File from "../src/components/File/File.svelte";
import Gallery from "../src/components/Gallery/Gallery.svelte";
import HTML from "../src/components/HTML/HTML.svelte";
import HighlightedText from "../src/components/HighlightedText/HighlightedText.svelte";
import Json from "../src/components/Json/Json.svelte";
import Label from "../src/components/Label/Label.svelte";
import Markdown from "../src/components/Markdown/Markdown.svelte";
import Model3D from "../src/components/Model3D/Model3D.svelte";
import Number from "../src/components/Number/Number.svelte";
import Radio from "../src/components/Radio/Radio.svelte";
import Slider from "../src/components/Slider/Slider.svelte";
import Textbox from "../src/components/Textbox/Textbox.svelte";
import TimeSeries from "../src/components/TimeSeries/TimeSeries.svelte";
import UploadButton from "../src/components/UploadButton/UploadButton.svelte";
import Video from "../src/components/Video/Video.svelte";
import { LoadingStatus } from "../src/components/StatusTracker/types";

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
	["AnnotatedImage", AnnotatedImage, { height: 100, width: 100, value: null }],
	["Audio", Audio, {}],
	// ["Button", Button, {}],
	["Chatbot", Chatbot, {}],
	["Checkbox", Checkbox, {}],
	["CheckboxGroup", CheckboxGroup, { choices: ["a", "b", "c"] }],
	// ["Code", Code, {}],
	["ColorPicker", ColorPicker, {}],
	[
		"DataFrame",
		DataFrame,
		{ value: [[1, 2, 3]], col_count: [3, "fixed"], row_count: [3, "fixed"] }
	],
	// ["Dataset", Dataset, {}],
	["Dropdown", Dropdown, { choices: ["a", "b", "c"] }],
	["File", File, {}],
	["Gallery", Gallery, {}],
	["HTML", HTML, {}],
	["HighlightedText", HighlightedText, {}],
	// ["Image",, {} Image],
	["Json", Json, {}],
	["Label", Label, {}],
	["Markdown", Markdown, {}],
	["Model3D", Model3D, {}],
	["Number", Number, {}],
	// ["Plot", Plot, {}],
	["Radio", Radio, {}],
	["Slider", Slider, {}],
	["Textbox", Textbox, { container: false }],
	["TimeSeries", TimeSeries, {}],
	["UploadButton", UploadButton, {}],
	["Video", Video, {}]
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

			expect(elem).toHaveClass("hide-container");
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
		.filter(([name]) => name !== "Markdown" && name !== "HTML")
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
	components
		.filter(([name]) => name !== "Markdown" && name !== "HTML")
		.forEach(([name, component, props]) => {
			test.todo(name);
		});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should show their label when `show_label=true`", () => {
	components
		.filter(([name]) => name !== "Markdown" && name !== "HTML")
		.forEach(([name, component, props]) => {
			test.todo(name);
		});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});

describe("all components should hide their container when `container=false`", () => {
	components
		.filter(([name]) => name !== "Markdown" && name !== "HTML")
		.forEach(([name, component, props]) => {
			test.todo(name);
		});

	["Button", "Code", "Image", "Plot"].forEach((name) => {
		test.todo(name);
	});
});
