import { test, describe, afterEach, expect, vi } from "vitest";
import {
	cleanup,
	render,
	waitFor,
	mock_client,
	TEST_GLTF,
	TEST_PLY,
	TEST_SPLAT
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Model3D from "./Index.svelte";

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
});

describe("PLY routing", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	test("gaussian-splat .ply routes to Canvas3DGS (no undo button)", async () => {
		const gaussian_header = [
			"ply",
			"format binary_little_endian 1.0",
			"element vertex 0",
			"property float x",
			"property float y",
			"property float z",
			"property float f_dc_0",
			"property float f_dc_1",
			"property float f_dc_2",
			"property float opacity",
			"property float scale_0",
			"property float scale_1",
			"property float scale_2",
			"property float rot_0",
			"property float rot_1",
			"property float rot_2",
			"property float rot_3",
			"end_header",
			""
		].join("\n");
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(gaussian_header, { status: 200 })
		);

		const { queryByLabelText, getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_PLY
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(queryByLabelText("Undo")).not.toBeInTheDocument();
		});
	});

	test("plain mesh .ply routes to Canvas3D (undo button present)", async () => {
		const plain_header = [
			"ply",
			"format ascii 1.0",
			"element vertex 0",
			"property float x",
			"property float y",
			"property float z",
			"end_header",
			""
		].join("\n");
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(plain_header, { status: 200 })
		);

		const { getByLabelText, getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_PLY
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(getByLabelText("Undo")).toBeInTheDocument();
		});
	});

	test("header-sniff fetch failure falls back to Canvas3D", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("net"));

		const { getByLabelText, getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_PLY
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(getByLabelText("Undo")).toBeInTheDocument();
		});
	});

	test(".splat routes to Canvas3DGS without header sniff (no fetch call)", async () => {
		const fetch_spy = vi.spyOn(globalThis, "fetch");

		const { queryByLabelText, getByTestId } = await render(Model3D, {
			...base_props,
			value: TEST_SPLAT
		});

		await waitFor(() => {
			expect(getByTestId("model3d")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(queryByLabelText("Undo")).not.toBeInTheDocument();
		});
		const sniff_call = fetch_spy.mock.calls.find(
			(c) => typeof c[1] === "object" && (c[1] as any)?.headers?.Range
		);
		expect(sniff_call).toBeUndefined();
	});

	test(".gltf routes to Canvas3D (undo button present)", async () => {
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

	test("change fires when value changes via set_data", async () => {
		const { listen, set_data } = await render(Model3D, {
			...base_props,
			value: null
		});

		const change = listen("change");
		await set_data({ value: TEST_GLTF });

		expect(change).toHaveBeenCalledTimes(1);
	});
});
