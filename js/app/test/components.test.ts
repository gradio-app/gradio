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

import AnnotatedImage from "@gradio/annotatedimage";
import Audio from "@gradio/audio";
import Chatbot from "@gradio/chatbot";
import Checkbox from "@gradio/checkbox";
import CheckboxGroup from "@gradio/checkboxgroup";
import ColorPicker from "@gradio/colorpicker";
import DataFrame from "@gradio/dataframe";
import Dropdown from "@gradio/dropdown";
import File from "@gradio/file";
import Gallery from "@gradio/gallery";
import HTML from "@gradio/html";
import HighlightedText from "@gradio/highlightedtext";
import Json from "@gradio/json";
import Label from "@gradio/label";
import Markdown from "@gradio/markdown";
import Model3D from "@gradio/model3d";
import Number from "@gradio/number";
import Radio from "@gradio/radio";
import Slider from "@gradio/slider";
import Textbox from "@gradio/textbox";
import TimeSeries from "@gradio/timeseries";
import UploadButton from "@gradio/uploadbutton";
import Video from "@gradio/video";
import { LoadingStatus } from "@gradio/statustracker/types";

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
