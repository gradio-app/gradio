import { afterEach, describe, expect, test, vi } from "vitest";
import {
	cleanup,
	fireEvent,
	mock_client,
	render,
	TEST_PNG,
	waitFor
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import es from "../core/src/lang/es.json";
import ImageEditor from "./Index.svelte";
import ImageEditorTestWrapper from "./ImageEditorTestWrapper.svelte";

const default_props = {
	sources: ["upload"] as const,
	interactive: true,
	label: "Image Editor",
	show_label: true,
	value: null,
	canvas_size: [800, 600] as [number, number],
	transforms: [] as const,
	layers: { allow_additional_layers: true, layers: ["Layer 1"] },
	brush: {
		default_size: "auto" as const,
		colors: ["#000000"],
		default_color: "#000000",
		color_mode: "defaults" as const
	},
	eraser: { default_size: "auto" as const },
	webcam_options: { mirror: true, constraints: {} },
	buttons: []
};

const spanish_i18n = (key: string): string => {
	const [namespace, message] = key.split(".");
	return (
		(es as Record<string, Record<string, string>>)[namespace]?.[message] ?? key
	);
};

run_shared_prop_tests({
	component: ImageEditor,
	name: "ImageEditor",
	base_props: { ...default_props, interactive: false },
	has_label: false,
	has_validation_error: true
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("an untouched editor uploads the original image bytes", async () => {
		const background = { ...TEST_PNG, orig_name: "background.png" };
		const layer = { ...TEST_PNG, orig_name: "layer.png" };
		const composite = { ...TEST_PNG, orig_name: "composite.png" };
		const value = { background, layers: [layer], composite };
		const { getByRole, get_data, listen } = await render(ImageEditor, {
			...default_props,
			client: mock_client(),
			value
		});
		const uploaded = listen("upload", { retrospective: true });
		await waitFor(
			() => {
				expect(getByRole("button", { name: "image_editor.pan" })).toBeVisible();
				expect(uploaded).toHaveBeenCalled();
			},
			{ timeout: 5000 }
		);

		const result = (await get_data()).value;
		const original_bytes = await (await fetch(TEST_PNG.url!)).arrayBuffer();

		expect(result.background.orig_name).toBe("background.png");
		expect(result.layers[0].orig_name).toBe("layer.png");
		expect(result.composite.orig_name).toBe("composite.png");
		expect(await result.background.blob.arrayBuffer()).toEqual(original_bytes);
		expect(await result.layers[0].blob.arrayBuffer()).toEqual(original_bytes);
		expect(await result.composite.blob.arrayBuffer()).toEqual(original_bytes);
	});
});

describe("Internationalization", () => {
	afterEach(() => cleanup());

	test("canvas controls use translated accessible names", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			i18n: spanish_i18n
		});

		expect(getByRole("button", { name: "Descargar" })).toBeVisible();
		expect(getByRole("button", { name: "Desplazar" })).toBeVisible();
		expect(getByRole("button", { name: "Alejar" })).toBeVisible();
		expect(getByRole("button", { name: "Deshacer" })).toBeVisible();
		expect(getByRole("button", { name: "Guardar cambios" })).toBeVisible();
	});

	test("editing tools use translated accessible names", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			i18n: spanish_i18n
		});

		expect(getByRole("button", { name: "Imagen" })).toBeVisible();
		expect(getByRole("button", { name: "Pincel" })).toBeVisible();
		expect(getByRole("button", { name: "Borrar" })).toBeVisible();
		expect(getByRole("button", { name: "Cargar" })).toBeVisible();
		expect(getByRole("button", { name: "Pegar" })).toBeVisible();
	});

	test("layer controls use translated accessible names", async () => {
		const { getByRole, getByText } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			i18n: spanish_i18n
		});
		const show_layers = getByRole("button", {
			name: "Mostrar capas"
		});
		expect(getByText("Capa 1")).toBeVisible();

		await fireEvent.click(show_layers);

		expect(getByText("Capas")).toBeVisible();
		expect(getByRole("button", { name: "Añadir capa" })).toBeVisible();
	});
});

describe("Static mode", () => {
	afterEach(() => cleanup());

	const static_props = { ...default_props, interactive: false };

	test("renders the composite image", async () => {
		const { getByRole } = await render(ImageEditor, {
			...static_props,
			value: { background: null, layers: [], composite: TEST_PNG }
		});

		// The static branch renders the composite through StaticImage without any
		// alt text, so the <img> is exposed as decorative rather than role="img".
		await waitFor(() => expect(getByRole("presentation")).toBeVisible());
	});

	test("renders no editing toolbar", async () => {
		const { queryByRole } = await render(ImageEditor, {
			...static_props,
			value: { background: null, layers: [], composite: TEST_PNG }
		});

		expect(
			queryByRole("button", { name: "image_editor.brush" })
		).not.toBeInTheDocument();
	});

	test("renders the label", async () => {
		const { getByText } = await render(ImageEditor, {
			...static_props,
			label: "Sketch pad",
			show_label: true,
			value: { background: null, layers: [], composite: TEST_PNG }
		});

		await waitFor(() => expect(getByText("Sketch pad")).toBeVisible());
	});

	test("renders an empty component when there is no value", async () => {
		const { queryByRole } = await render(ImageEditor, {
			...static_props,
			value: null
		});

		expect(queryByRole("presentation")).not.toBeInTheDocument();
	});

	test("clear_status is dispatched when the error status is dismissed", async () => {
		const { listen, getByLabelText } = await render(ImageEditor, {
			...static_props,
			loading_status: {
				status: "error",
				queue_position: null,
				queue_size: null,
				eta: null,
				message: "it broke",
				show_progress: "full",
				scroll_to_output: false,
				visible: true,
				fn_index: 0
			}
		});
		const clear_status = listen("clear_status");

		await fireEvent.click(getByLabelText("common.clear"));

		expect(clear_status).toHaveBeenCalledTimes(1);
	});
});

describe("Interactive mode", () => {
	afterEach(() => cleanup());

	async function render_editor(
		overrides: Record<string, any> = {}
	): Promise<Awaited<ReturnType<typeof render>>> {
		const view = await render(ImageEditor, {
			...default_props,
			client: mock_client(),
			...overrides
		});
		await waitFor(
			() => {
				expect(
					view.getByRole("button", { name: "image_editor.pan" })
				).toBeVisible();
			},
			{ timeout: 5000 }
		);
		return view;
	}

	test("renders the canvas controls", async () => {
		const { getByRole } = await render_editor();

		expect(getByRole("button", { name: "image_editor.pan" })).toBeVisible();
		expect(
			getByRole("button", { name: "image_editor.zoom_out" })
		).toBeVisible();
		expect(getByRole("button", { name: "common.undo" })).toBeVisible();
		expect(
			getByRole("button", { name: "image_editor.clear_canvas" })
		).toBeVisible();
	});

	test("renders the drawing tools", async () => {
		const { getByRole } = await render_editor();

		expect(getByRole("button", { name: "image_editor.brush" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.erase" })).toBeVisible();
	});

	test("undo and redo start disabled on a fresh canvas", async () => {
		const { getByRole } = await render_editor();

		expect(getByRole("button", { name: "common.undo" })).toBeDisabled();
		expect(getByRole("button", { name: "image_editor.redo" })).toBeDisabled();
	});

	test("renders the label", async () => {
		const { getByText } = await render_editor({
			label: "Sketch pad",
			show_label: true
		});

		expect(getByText("Sketch pad")).toBeVisible();
	});

	test("the download button is shown by default", async () => {
		const { getByRole } = await render_editor({ buttons: null });

		expect(getByRole("button", { name: "common.download" })).toBeVisible();
	});

	test("an empty buttons list hides the download button", async () => {
		const { queryByRole } = await render_editor({ buttons: [] });

		expect(
			queryByRole("button", { name: "common.download" })
		).not.toBeInTheDocument();
	});

	test("buttons: ['download'] shows the download button", async () => {
		const { getByRole } = await render_editor({ buttons: ["download"] });

		expect(getByRole("button", { name: "common.download" })).toBeVisible();
	});

	test("the save button only appears when an apply listener is attached", async () => {
		const { queryByRole } = await render_editor({ attached_events: [] });

		expect(
			queryByRole("button", { name: "image_editor.save_changes" })
		).not.toBeInTheDocument();
	});

	test("attaching an apply listener shows the save button", async () => {
		const { getByRole } = await render_editor({ attached_events: ["apply"] });

		expect(
			getByRole("button", { name: "image_editor.save_changes" })
		).toBeVisible();
	});
});

describe("Toolbar: sources", () => {
	afterEach(() => cleanup());

	test("all three sources render their own button", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			sources: ["upload", "clipboard", "webcam"]
		});

		expect(getByRole("button", { name: "image_editor.upload" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.paste" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.webcam" })).toBeVisible();
	});

	test("only the listed sources are offered", async () => {
		const { getByRole, queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			sources: ["upload"]
		});

		expect(getByRole("button", { name: "image_editor.upload" })).toBeVisible();
		expect(
			queryByRole("button", { name: "image_editor.webcam" })
		).not.toBeInTheDocument();
		expect(
			queryByRole("button", { name: "image_editor.paste" })
		).not.toBeInTheDocument();
	});

	test("no sources and no transforms hides the image tool entirely", async () => {
		const { queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			sources: [],
			transforms: []
		});

		expect(
			queryByRole("button", { name: "image.image" })
		).not.toBeInTheDocument();
	});

	test("a transform keeps the image tool available once there is a background", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			sources: [],
			transforms: ["crop"],
			background: true
		});

		expect(getByRole("button", { name: "image.image" })).toBeVisible();
	});
});

describe("Toolbar: transforms", () => {
	afterEach(() => cleanup());

	test("crop and resize are offered for an image with a background", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			transforms: ["crop", "resize"],
			background: true
		});

		expect(getByRole("button", { name: "image_editor.crop" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.resize" })).toBeVisible();
	});

	test("only the listed transforms are offered", async () => {
		const { getByRole, queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			transforms: ["crop"],
			background: true
		});

		expect(getByRole("button", { name: "image_editor.crop" })).toBeVisible();
		expect(
			queryByRole("button", { name: "image_editor.resize" })
		).not.toBeInTheDocument();
	});

	test("transforms are not offered until there is a background to transform", async () => {
		const { queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			transforms: ["crop", "resize"],
			background: false
		});

		expect(
			queryByRole("button", { name: "image_editor.crop" })
		).not.toBeInTheDocument();
	});
});

describe("Toolbar: brush and eraser", () => {
	afterEach(() => cleanup());

	test("brush: false removes the brush tool", async () => {
		const { queryByRole, getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			brush_options: false
		});

		expect(
			queryByRole("button", { name: "image_editor.brush" })
		).not.toBeInTheDocument();
		expect(getByRole("button", { name: "image_editor.erase" })).toBeVisible();
	});

	test("eraser: false removes the eraser tool", async () => {
		const { queryByRole, getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			eraser_options: false
		});

		expect(
			queryByRole("button", { name: "image_editor.erase" })
		).not.toBeInTheDocument();
		expect(getByRole("button", { name: "image_editor.brush" })).toBeVisible();
	});

	test("clicking the brush asks the editor to switch to the draw tool", async () => {
		const ontool_change = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			ontool_change
		});

		await fireEvent.click(getByRole("button", { name: "image_editor.brush" }));

		expect(ontool_change).toHaveBeenCalledWith({ tool: "draw" });
	});

	test("clicking the eraser asks the editor to switch to the erase tool", async () => {
		const ontool_change = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			ontool_change
		});

		await fireEvent.click(getByRole("button", { name: "image_editor.erase" }));

		expect(ontool_change).toHaveBeenCalledWith({ tool: "erase" });
	});

	test("the draw tool offers colour and size controls", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			tool: "draw"
		});

		expect(getByRole("button", { name: "image_editor.color" })).toBeVisible();
		expect(
			getByRole("button", { name: "image_editor.brush_size" })
		).toBeVisible();
	});

	test("the erase tool offers a size control", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			tool: "erase"
		});

		expect(
			getByRole("button", { name: "image_editor.eraser_size" })
		).toBeVisible();
	});

	test("choosing the brush size sub-tool is reported to the editor", async () => {
		const onsubtool_change = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			tool: "draw",
			onsubtool_change
		});

		await fireEvent.click(
			getByRole("button", { name: "image_editor.brush_size" })
		);

		expect(onsubtool_change).toHaveBeenCalledWith({
			tool: "draw",
			subtool: "size"
		});
	});
});

describe("Controls", () => {
	afterEach(() => cleanup());

	test("undo is disabled until there is something to undo", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			can_undo: false
		});

		expect(getByRole("button", { name: "common.undo" })).toBeDisabled();
	});

	test("undo is enabled when there is something to undo", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			can_undo: true
		});

		expect(getByRole("button", { name: "common.undo" })).toBeEnabled();
	});

	test("clicking undo calls back", async () => {
		const onundo = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			can_undo: true,
			onundo
		});

		await fireEvent.click(getByRole("button", { name: "common.undo" }));

		expect(onundo).toHaveBeenCalledTimes(1);
	});

	test("clicking redo calls back", async () => {
		const onredo = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			can_redo: true,
			onredo
		});

		await fireEvent.click(getByRole("button", { name: "image_editor.redo" }));

		expect(onredo).toHaveBeenCalledTimes(1);
	});

	test("clicking clear calls back", async () => {
		const onremove_image = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			onremove_image
		});

		await fireEvent.click(
			getByRole("button", { name: "image_editor.clear_canvas" })
		);

		expect(onremove_image).toHaveBeenCalledTimes(1);
	});

	test("enable_download: false removes the download button", async () => {
		const { queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			enable_download: false
		});

		expect(
			queryByRole("button", { name: "common.download" })
		).not.toBeInTheDocument();
	});

	test("changeable: false removes the save button", async () => {
		const { queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			changeable: false
		});

		expect(
			queryByRole("button", { name: "image_editor.save_changes" })
		).not.toBeInTheDocument();
	});

	test("save is disabled until there are changes to save", async () => {
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			changeable: true,
			can_save: false
		});

		expect(
			getByRole("button", { name: "image_editor.save_changes" })
		).toBeDisabled();
	});

	test("clicking save calls back", async () => {
		const onsave = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			changeable: true,
			can_save: true,
			onsave
		});

		await fireEvent.click(
			getByRole("button", { name: "image_editor.save_changes" })
		);

		expect(onsave).toHaveBeenCalledTimes(1);
	});

	test("clicking zoom out calls back", async () => {
		const onzoom_out = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			onzoom_out
		});

		await fireEvent.click(
			getByRole("button", { name: "image_editor.zoom_out" })
		);

		expect(onzoom_out).toHaveBeenCalledTimes(1);
	});

	test("clicking pan calls back", async () => {
		const onpan = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			onpan
		});

		await fireEvent.click(getByRole("button", { name: "image_editor.pan" }));

		expect(onpan).toHaveBeenCalledTimes(1);
	});
});

describe("Layers", () => {
	afterEach(() => cleanup());

	const named_layers = {
		active_layer: "layer-1",
		layers: [
			{ name: "Background", id: "layer-1", user_created: false, visible: true },
			{ name: "Sketch", id: "layer-2", user_created: true, visible: true }
		]
	};

	test("the active layer is named in the toolbar", async () => {
		const { getByText } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			layer_store: named_layers
		});

		expect(getByText("Background")).toBeVisible();
	});

	test("opening the layer panel lists every layer", async () => {
		const { getByRole, getAllByText } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			layer_store: named_layers
		});

		await fireEvent.click(
			getByRole("button", { name: "image_editor.show_layers" })
		);

		expect(getAllByText("Sketch").length).toBeGreaterThan(0);
	});

	test("auto-generated layer names are translated", async () => {
		const { getByText } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			i18n: spanish_i18n
		});

		expect(getByText("Capa 1")).toBeVisible();
	});

	test("a user-supplied layer name is shown verbatim", async () => {
		const { getByText } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			i18n: spanish_i18n,
			layer_store: named_layers
		});

		expect(getByText("Background")).toBeVisible();
	});

	test("a new layer can be added when additional layers are allowed", async () => {
		const onnew_layer = vi.fn();
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			enable_additional_layers: true,
			onnew_layer
		});

		await fireEvent.click(
			getByRole("button", { name: "image_editor.show_layers" })
		);
		await fireEvent.click(
			getByRole("button", { name: "image_editor.add_layer" })
		);

		expect(onnew_layer).toHaveBeenCalledTimes(1);
	});

	test("the add layer button is hidden when additional layers are disallowed", async () => {
		const { getByRole, queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			enable_additional_layers: false
		});

		await fireEvent.click(
			getByRole("button", { name: "image_editor.show_layers" })
		);

		expect(
			queryByRole("button", { name: "image_editor.add_layer" })
		).not.toBeInTheDocument();
	});

	test("enable_layers: false renders no layer controls at all", async () => {
		const { queryByRole } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			enable_layers: false
		});

		expect(
			queryByRole("button", { name: "image_editor.show_layers" })
		).not.toBeInTheDocument();
	});
});
