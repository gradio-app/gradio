import { describe, expect, test, vi } from "vitest";
import { BrushTool } from "./brush";

type MockBrushTool = BrushTool & {
	image_editor_context: {
		image_container: {
			getLocalBounds: () => { width: number; height: number };
		};
	};
	brush_cursor: {
		set_active: ReturnType<typeof vi.fn>;
		update_state: ReturnType<typeof vi.fn>;
	};
	brush_textures: {
		textures_initialized: boolean;
		get_dimensions: () => { width: number; height: number };
		initialize_textures: ReturnType<typeof vi.fn>;
	};
};

function mock_brush_tool({
	width = 800,
	height = 600,
	texture_width = width,
	texture_height = height
}: {
	width?: number;
	height?: number;
	texture_width?: number;
	texture_height?: number;
} = {}): {
	brush: BrushTool;
	initialize_textures: ReturnType<typeof vi.fn>;
} {
	const brush = new BrushTool();
	const mock_brush = brush as unknown as MockBrushTool;
	const initialize_textures = vi.fn();

	mock_brush.image_editor_context = {
		image_container: {
			getLocalBounds: () => ({ width, height })
		}
	};
	mock_brush.brush_cursor = {
		set_active: vi.fn(),
		update_state: vi.fn()
	};
	mock_brush.brush_textures = {
		get textures_initialized() {
			return true;
		},
		get_dimensions: () => ({ width: texture_width, height: texture_height }),
		initialize_textures
	};

	return { brush, initialize_textures };
}

describe("BrushTool", () => {
	test("keeps brush textures when switching between draw and erase", () => {
		const { brush, initialize_textures } = mock_brush_tool();

		brush.set_tool("erase", null);

		expect(initialize_textures).not.toHaveBeenCalled();
	});

	test("keeps brush textures when selecting draw subtools", () => {
		const { brush, initialize_textures } = mock_brush_tool();

		brush.set_tool("draw", "size");
		brush.set_tool("draw", "color");

		expect(initialize_textures).not.toHaveBeenCalled();
	});

	test("reinitializes brush textures when canvas dimensions change", () => {
		const { brush, initialize_textures } = mock_brush_tool({
			width: 1024,
			texture_width: 800
		});

		brush.set_tool("draw", null);

		expect(initialize_textures).toHaveBeenCalledTimes(1);
	});
});
