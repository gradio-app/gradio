import { test, describe, afterEach, beforeAll, afterAll, expect, vi } from "vitest";
import {
	cleanup,
	render,
	waitFor,
	mock_client,
	upload_file,
	drop_file,
	TEST_GLTF,
	TEST_PLY,
	TEST_SPLAT
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Model3D from "./Index.svelte";

// BabylonJS and gsplat perform async initialization (canvas setup, model loading)
// that can complete after component cleanup, causing unhandled rejections.
// These are harmless race conditions in the 3D rendering libraries, not test bugs.
function suppress_3d_library_errors(e: PromiseRejectionEvent): void {
	const msg = e.reason?.message ?? "";
	if (
		msg.includes("addEventListener") ||
		msg.includes("Viewer is disposed") ||
		msg.includes("Invalid URL") ||
		msg.includes("Unsupported property type")
	) {
		e.preventDefault();
	}
}

beforeAll(() => {
	window.addEventListener("unhandledrejection", suppress_3d_library_errors);
});

afterAll(() => {
	window.removeEventListener("unhandledrejection", suppress_3d_library_errors);
});

const base_props = {
	label: "3D Model",
	show_label: true,
	interactive: false,
	value: null as any,
	display_mode: "solid" as "solid" | "point_cloud" | "wireframe",
	clear_color: [0, 0, 0, 0] as [number, number, number, number],
	zoom_speed: 1,
	camera_position: [null, null, null] as [
		number | null,
		number | null,
		number | null
	],
	has_change_history: false,
	buttons: null as any,
	height: undefined
};

const interactive_props = {
	...base_props,
	interactive: true,
	client: mock_client()
};

run_shared_prop_tests({
	component: Model3D,
	name: "Model3D",
	base_props,
	has_label: false
});

describe("Model3D", () => {
	afterEach(() => cleanup());

	test("renders empty placeholder when value is null (static)", async () => {
		const { queryByTestId } = await render(Model3D, {
			...base_props,
			value: null
		});

		expect(queryByTestId("model3d")).not.toBeInTheDocument();
	});

	test("renders viewer when value is set (static)", async () => {
		const { getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
	});

	test("default label is '3D Model' when label is empty", async () => {
		const { getByText } = await render(Model3D, {
			...base_props,
			label: "",
			show_label: true
		});

		expect(getByText("3D Model")).toBeInTheDocument();
	});

	test("custom label is rendered", async () => {
		const { getByText } = await render(Model3D, {
			...base_props,
			label: "My Fancy Model",
			show_label: true
		});

		expect(getByText("My Fancy Model")).toBeVisible();
	});

	test("show_label: false hides the label visually", async () => {
		const { getByText } = await render(Model3D, {
			...base_props,
			label: "Hidden Label",
			show_label: false
		});

		expect(getByText("Hidden Label")).not.toBeVisible();
	});
});

describe("Static mode", () => {
	afterEach(() => cleanup());

	test("download link href matches value.url", async () => {
		const { getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		await waitFor(() => {
			expect(getByTestId("model3d-download-link")).toHaveAttribute(
				"href",
				TEST_GLTF.url
			);
		});
	});

	test("download attribute uses orig_name", async () => {
		const { getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		await waitFor(() => {
			expect(getByTestId("model3d-download-link")).toHaveAttribute(
				"download",
				TEST_GLTF.orig_name!
			);
		});
	});

	test("download attribute falls back to path when orig_name is missing", async () => {
		const value_no_orig = {
			path: "/tmp/mymodel.gltf",
			url: "https://example.com/mymodel.gltf",
			orig_name: undefined,
			size: 100,
			mime_type: "model/gltf+json"
		};
		const { getByTestId } = await render(Model3D, {
			...base_props,
			value: value_no_orig as any
		});

		await waitFor(() => {
			expect(getByTestId("model3d-download-link")).toHaveAttribute(
				"download",
				"/tmp/mymodel.gltf"
			);
		});
	});

	test("undo button is disabled when has_change_history is false", async () => {
		const { getByLabelText } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF,
			has_change_history: false
		});

		await waitFor(() => {
			expect(getByLabelText("Undo")).toBeDisabled();
		});
	});

	test(".ply value skips undo button (Canvas3DGS branch)", async () => {
		const { queryByLabelText, getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_PLY
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
		expect(queryByLabelText("Undo")).not.toBeInTheDocument();
	});

	test(".splat value skips undo button (Canvas3DGS branch)", async () => {
		const { queryByLabelText, getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_SPLAT
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
		expect(queryByLabelText("Undo")).not.toBeInTheDocument();
	});

	test(".gltf value shows undo button (Canvas3D branch)", async () => {
		const { getByLabelText } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		await waitFor(() => {
			expect(getByLabelText("Undo")).toBeInTheDocument();
		});
	});

});

describe("Interactive mode", () => {
	afterEach(() => cleanup());

	test("renders upload dropzone when value is null", async () => {
		const { getByLabelText } = await render(Model3D, {
			...interactive_props,
			value: null
		});

		expect(getByLabelText("model3d.drop_to_upload")).toBeInTheDocument();
	});

	test("renders viewer with clear button when value is set", async () => {
		const { getByLabelText, queryByLabelText } = await render(Model3D, {
			...interactive_props,
			value: TEST_GLTF
		});

		expect(getByLabelText("common.clear")).toBeInTheDocument();
		expect(queryByLabelText("model3d.drop_to_upload")).not.toBeInTheDocument();
	});

	test("clicking clear transitions back to upload dropzone", async () => {
		const { getByLabelText, queryByTestId } = await render(Model3D, {
			...interactive_props,
			value: TEST_GLTF
		});

		const clear_btn = await waitFor(() => getByLabelText("common.clear"));
		await event.click(clear_btn);

		await waitFor(() => {
			expect(queryByTestId("model3d")).not.toBeInTheDocument();
		});
		expect(getByLabelText("model3d.drop_to_upload")).toBeInTheDocument();
	});

	test("undo is available for .gltf files", async () => {
		const { getByLabelText } = await render(Model3D, {
			...interactive_props,
			value: TEST_GLTF
		});

		expect(getByLabelText("common.undo")).toBeInTheDocument();
	});

	test("undo is not available for .ply files", async () => {
		const { getByLabelText, queryByLabelText } = await render(Model3D, {
			...interactive_props,
			value: TEST_PLY
		});

		expect(getByLabelText("common.clear")).toBeInTheDocument();
		expect(queryByLabelText("common.undo")).not.toBeInTheDocument();
	});

	test("undo is not available for .splat files", async () => {
		const { getByLabelText, queryByLabelText } = await render(Model3D, {
			...interactive_props,
			value: TEST_SPLAT
		});

		expect(getByLabelText("common.clear")).toBeInTheDocument();
		expect(queryByLabelText("common.undo")).not.toBeInTheDocument();
	});

	test("set_data to null shows upload dropzone", async () => {
		const { set_data, getByLabelText } = await render(Model3D, {
			...interactive_props,
			value: TEST_GLTF
		});

		await set_data({ value: null });

		await waitFor(() => {
			expect(
				getByLabelText("model3d.drop_to_upload")
			).toBeInTheDocument();
		});
	});

	test("set_data with value shows viewer and clear button", async () => {
		const { set_data, getByLabelText, queryByLabelText } = await render(
			Model3D,
			{
				...interactive_props,
				value: null
			}
		);

		await set_data({ value: TEST_GLTF });

		await waitFor(() => {
			expect(getByLabelText("common.clear")).toBeInTheDocument();
		});
		expect(queryByLabelText("model3d.drop_to_upload")).not.toBeInTheDocument();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("mounting with a null value does not fire change", async () => {
		const { listen } = await render(Model3D, {
			...base_props,
			value: null
		});

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("mounting with an initial value does not fire change", async () => {
		const { listen } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("change fires when value changes via set_data", async () => {
		const { listen, set_data } = await render(Model3D, {
			...base_props,
			value: null
		});

		const change = listen("change");
		await set_data({ value: TEST_GLTF });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change deduplicates when set_data called with same value", async () => {
		const { listen, set_data } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		const change = listen("change");
		await set_data({ value: TEST_GLTF });
		await set_data({ value: TEST_GLTF });

		expect(change).not.toHaveBeenCalled();
	});

	test("change fires when set_data clears the value", async () => {
		const { listen, set_data } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		const change = listen("change");
		await set_data({ value: null });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("clear event fires when clear button clicked (interactive)", async () => {
		const { getByLabelText, listen } = await render(Model3D, {
			...interactive_props,
			value: TEST_GLTF
		});

		const clear = listen("clear");
		const change = listen("change");

		const clear_btn = await waitFor(() => getByLabelText("common.clear"));
		await event.click(clear_btn);

		expect(clear).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalled();
	});

	test("custom_button_click fires with id when toolbar button clicked", async () => {
		const { getByLabelText, listen } = await render(Model3D, {
			...base_props,
			value: null,
			show_label: true,
			buttons: [{ value: "Action", id: 42, icon: null }] as any
		});

		const custom_click = listen("custom_button_click");
		await event.click(getByLabelText("Action"));

		expect(custom_click).toHaveBeenCalledTimes(1);
		expect(custom_click).toHaveBeenCalledWith({ id: 42 });
	});

	test("change fires when switching file types via set_data", async () => {
		const { listen, set_data } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		const change = listen("change");
		await set_data({ value: TEST_PLY });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("upload event fires when file is uploaded", async () => {
		const { listen } = await render(Model3D, {
			...interactive_props,
			value: null
		});

		const upload = listen("upload");
		const change = listen("change");

		await upload_file(TEST_GLTF);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(change).toHaveBeenCalled();
	});

	test("drag and drop triggers upload and change events", async () => {
		const { listen } = await render(Model3D, {
			...interactive_props,
			value: null
		});

		const upload = listen("upload");
		const change = listen("change");

		await drop_file(
			TEST_GLTF,
			"[aria-label='model3d.drop_to_upload']"
		);

		await waitFor(() => {
			expect(upload).toHaveBeenCalledTimes(1);
		});
		expect(change).toHaveBeenCalled();
	});

	test("upload failure dispatches error event", async () => {
		const failing_upload = vi
			.fn()
			.mockRejectedValue(new Error("File too large"));
		const { listen } = await render(Model3D, {
			...interactive_props,
			client: {
				upload: failing_upload,
				stream: async () => ({ onmessage: null, close: () => {} })
			}
		});

		const error = listen("error");

		await upload_file(TEST_GLTF);

		await waitFor(() => {
			expect(failing_upload).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(error).toHaveBeenCalledTimes(1);
		});
		expect(error).toHaveBeenCalledWith("File too large");
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("renders buttons when show_label is true and buttons is non-empty", async () => {
		const { getByLabelText } = await render(Model3D, {
			...base_props,
			value: null,
			show_label: true,
			buttons: [{ value: "MyBtn", id: 1, icon: null }] as any
		});

		expect(getByLabelText("MyBtn")).toBeInTheDocument();
	});

	test("does not render buttons when show_label is false", async () => {
		const { queryByLabelText } = await render(Model3D, {
			...base_props,
			value: null,
			show_label: false,
			buttons: [{ value: "HiddenBtn", id: 1, icon: null }] as any
		});

		expect(queryByLabelText("HiddenBtn")).not.toBeInTheDocument();
	});

	test("does not render custom button when buttons is null", async () => {
		const { queryByLabelText } = await render(Model3D, {
			...base_props,
			value: null,
			show_label: true,
			buttons: null
		});

		expect(queryByLabelText("Custom action")).not.toBeInTheDocument();
	});

	test("does not render custom button when buttons is empty array", async () => {
		const { queryByLabelText } = await render(Model3D, {
			...base_props,
			value: null,
			show_label: true,
			buttons: []
		});

		expect(queryByLabelText("Custom action")).not.toBeInTheDocument();
	});

	test("renders multiple custom buttons", async () => {
		const { getByLabelText } = await render(Model3D, {
			...base_props,
			value: null,
			show_label: true,
			buttons: [
				{ value: "First", id: 1, icon: null },
				{ value: "Second", id: 2, icon: null }
			] as any
		});

		expect(getByLabelText("First")).toBeInTheDocument();
		expect(getByLabelText("Second")).toBeInTheDocument();
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns null when value is null", async () => {
		const { get_data } = await render(Model3D, {
			...base_props,
			value: null
		});

		const data = await get_data();
		expect(data.value).toBeNull();
	});

	test("get_data returns FileData when value is set", async () => {
		const { get_data } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		const data = await get_data();
		expect(data.value).toEqual(TEST_GLTF);
	});

	test("set_data populates the viewer", async () => {
		const { set_data, getByTestId } = await render(Model3D, {
			...base_props,
			value: null
		});

		await set_data({ value: TEST_GLTF });

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
	});

	test("set_data to null removes the viewer (static)", async () => {
		const { set_data, queryByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		await set_data({ value: null });

		await waitFor(() => {
			expect(queryByTestId("model3d")).not.toBeInTheDocument();
		});
	});

	test("round-trip: set_data then get_data returns same value", async () => {
		const { set_data, get_data } = await render(Model3D, {
			...base_props,
			value: null
		});

		await set_data({ value: TEST_GLTF });
		const data = await get_data();
		expect(data.value).toEqual(TEST_GLTF);
	});

	test("user clear reflected in get_data (interactive)", async () => {
		const { getByLabelText, get_data } = await render(Model3D, {
			...interactive_props,
			value: TEST_GLTF
		});

		const clear_btn = await waitFor(() => getByLabelText("common.clear"));
		await event.click(clear_btn);

		const data = await get_data();
		expect(data.value).toBeNull();
	});

	test("set_data switches file type and get_data reflects it", async () => {
		const { set_data, get_data } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		await set_data({ value: TEST_PLY });
		const data = await get_data();
		expect(data.value).toEqual(TEST_PLY);
	});

	test("set_data in interactive mode reflects in get_data", async () => {
		const { set_data, get_data } = await render(Model3D, {
			...interactive_props,
			value: null
		});

		await set_data({ value: TEST_GLTF });
		const data = await get_data();
		expect(data.value).toEqual(TEST_GLTF);
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("value transition null → set → null renders correctly", async () => {
		const { set_data, getByTestId, queryByTestId } = await render(Model3D, {
			...base_props,
			value: null
		});

		await set_data({ value: TEST_GLTF });
		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});

		await set_data({ value: null });
		await waitFor(() => {
			expect(queryByTestId("model3d")).not.toBeInTheDocument();
		});
	});

	test("switching file types re-renders the canvas wrapper", async () => {
		const { set_data, getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_GLTF
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});

		await set_data({ value: TEST_PLY });
		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
	});
});

test.todo(
	"VISUAL: display_mode='solid' renders a solid-shaded mesh — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: display_mode='point_cloud' renders the mesh as points — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: display_mode='wireframe' renders the mesh as wireframe — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: clear_color sets the scene background colour — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: zoom_speed affects wheel zoom sensitivity — needs Playwright interaction + screenshot comparison"
);

test.todo(
	"VISUAL: camera_position sets initial alpha/beta/radius of the camera — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: height prop resizes the Block containing the viewer — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: pan_speed affects drag pan sensitivity — needs Playwright interaction + screenshot comparison"
);
