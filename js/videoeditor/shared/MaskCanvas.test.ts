import { describe, test, expect, afterEach } from "vitest";
import { tick, mount, unmount } from "svelte";
import MaskCanvas from "./MaskCanvas.svelte";

const mounted: { component: any; target: HTMLElement }[] = [];

function render_mask(props: {
	width?: number;
	height?: number;
	active?: boolean;
	brush_color?: string;
	brush_size?: number;
}): {
	component: any;
	canvas: HTMLCanvasElement;
	target: HTMLElement;
} {
	const target = document.body.appendChild(document.createElement("div"));
	const component = mount(MaskCanvas, {
		target,
		props: {
			width: 100,
			height: 100,
			active: true,
			brush_color: "rgba(255, 0, 0, 0.5)",
			brush_size: 20,
			...props
		}
	}) as any;
	mounted.push({ component, target });
	const canvas = target.querySelector("canvas") as HTMLCanvasElement;
	return { component, canvas, target };
}

afterEach(() => {
	while (mounted.length) {
		const { component, target } = mounted.pop()!;
		unmount(component);
		target.remove();
	}
});

describe("MaskCanvas", () => {
	test("renders a canvas with the given dimensions", async () => {
		const { canvas } = render_mask({ width: 200, height: 150 });
		await tick();
		expect(canvas).toBeTruthy();
		expect(canvas.width).toBe(200);
		expect(canvas.height).toBe(150);
	});

	test("shows the toolbar only when active=true", async () => {
		const { target } = render_mask({ active: true });
		await tick();
		expect(target.querySelector(".toolbar")).not.toBeNull();
	});

	test("hides the toolbar when active=false", async () => {
		const { target } = render_mask({ active: false });
		await tick();
		expect(target.querySelector(".toolbar")).toBeNull();
	});
});

describe("is_empty / clear", () => {
	test("is_empty() returns true on a fresh canvas", async () => {
		const { component } = render_mask({});
		await tick();
		expect(component.is_empty()).toBe(true);
	});

	test("is_empty() returns false after manually painting on the canvas", async () => {
		const { component, canvas } = render_mask({});
		await tick();
		const ctx = canvas.getContext("2d")!;
		ctx.fillStyle = "rgba(255, 0, 0, 1)";
		ctx.fillRect(10, 10, 30, 30);
		expect(component.is_empty()).toBe(false);
	});

	test("clear() empties a painted canvas", async () => {
		const { component, canvas } = render_mask({});
		await tick();
		const ctx = canvas.getContext("2d")!;
		ctx.fillStyle = "rgba(0, 0, 255, 1)";
		ctx.fillRect(0, 0, 50, 50);
		expect(component.is_empty()).toBe(false);
		component.clear();
		expect(component.is_empty()).toBe(true);
	});
});

describe("get_blob", () => {
	test("get_blob() returns a PNG Blob from the canvas", async () => {
		const { component, canvas } = render_mask({});
		await tick();
		const ctx = canvas.getContext("2d")!;
		ctx.fillStyle = "rgba(255, 0, 0, 1)";
		ctx.fillRect(0, 0, 10, 10);
		const blob = await component.get_blob();
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.type).toBe("image/png");
	});
});

describe("undo / redo", () => {
	test("undo() and redo() are exposed and don't throw on empty stacks", async () => {
		const { component } = render_mask({});
		await tick();
		expect(() => component.undo()).not.toThrow();
		expect(() => component.redo()).not.toThrow();
	});

	function draw_dot(canvas: HTMLCanvasElement): void {
		const rect = canvas.getBoundingClientRect();
		canvas.dispatchEvent(
			new MouseEvent("mousedown", {
				bubbles: true,
				clientX: rect.left + 20,
				clientY: rect.top + 20
			})
		);
		canvas.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
	}

	test("undo() reverts a draw stroke", async () => {
		const { component, canvas } = render_mask({});
		await tick();
		draw_dot(canvas);
		await tick();

		expect(component.is_empty()).toBe(false);
		component.undo();
		expect(component.is_empty()).toBe(true);
	});

	test("redo() reapplies an undone stroke", async () => {
		const { component, canvas } = render_mask({});
		await tick();
		draw_dot(canvas);
		await tick();

		component.undo();
		expect(component.is_empty()).toBe(true);
		component.redo();
		expect(component.is_empty()).toBe(false);
	});

	test("clear() is undoable", async () => {
		const { component, canvas } = render_mask({});
		await tick();
		const ctx = canvas.getContext("2d")!;
		ctx.fillStyle = "rgba(255, 0, 0, 1)";
		ctx.fillRect(0, 0, 30, 30);
		expect(component.is_empty()).toBe(false);

		component.clear();
		expect(component.is_empty()).toBe(true);

		component.undo();
		expect(component.is_empty()).toBe(false);
	});
});
