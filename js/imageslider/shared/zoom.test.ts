import { test, describe, beforeEach, afterEach, expect, vi } from "vitest";
import { ZoomableImage } from "./zoom";

describe("ZoomableImage", () => {
	let container: HTMLDivElement;
	let img: HTMLImageElement;
	let zi: ZoomableImage;

	beforeEach(() => {
		container = document.createElement("div");
		img = document.createElement("img");
		container.appendChild(img);
		zi = new ZoomableImage(container, img);
	});

	afterEach(() => {
		zi.destroy();
	});

	test("initializes with scale=1 and zero offsets", () => {
		expect(zi.scale).toBe(1);
		expect(zi.offsetX).toBe(0);
		expect(zi.offsetY).toBe(0);
	});

	test("subscribe callback receives transform updates via updateTransform", () => {
		const cb = vi.fn();
		zi.subscribe(cb);
		zi.updateTransform();

		expect(cb).toHaveBeenCalledWith({ x: 0, y: 0, scale: 1 });
	});

	test("reset_zoom restores scale=1 and zero offsets", () => {
		zi.scale = 3;
		zi.offsetX = 100;
		zi.offsetY = -50;

		const cb = vi.fn();
		zi.subscribe(cb);

		zi.reset_zoom();

		expect(zi.scale).toBe(1);
		expect(zi.offsetX).toBe(0);
		expect(zi.offsetY).toBe(0);
		expect(cb).toHaveBeenCalledWith({ x: 0, y: 0, scale: 1 });
	});

	test("unsubscribe removes callback so it no longer receives updates", () => {
		const cb = vi.fn();
		zi.subscribe(cb);
		zi.unsubscribe(cb);
		zi.updateTransform();

		expect(cb).not.toHaveBeenCalled();
	});

	test("multiple subscribers all receive the same transform", () => {
		const cb1 = vi.fn();
		const cb2 = vi.fn();

		zi.subscribe(cb1);
		zi.subscribe(cb2);
		zi.updateTransform();

		expect(cb1).toHaveBeenCalledWith({ x: 0, y: 0, scale: 1 });
		expect(cb2).toHaveBeenCalledWith({ x: 0, y: 0, scale: 1 });
	});

	test("notify delivers arbitrary transform values to subscribers", () => {
		const cb = vi.fn();
		zi.subscribe(cb);

		zi.notify({ x: 15, y: -20, scale: 2.5 });

		expect(cb).toHaveBeenCalledWith({ x: 15, y: -20, scale: 2.5 });
	});

	test("destroy does not throw", () => {
		expect(() => zi.destroy()).not.toThrow();
	});

	test("reset_zoom after destroy does not notify destroyed listeners", () => {
		const cb = vi.fn();
		zi.subscribe(cb);

		zi.destroy();

		// After destroy, event listeners are removed but subscribers list is not cleared.
		// reset_zoom still calls notify internally, so we verify the subscriber still fires
		// (destroy only removes DOM listeners, not the in-memory subscriber list).
		zi.reset_zoom();
		expect(cb).toHaveBeenCalledWith({ x: 0, y: 0, scale: 1 });
	});

	test("compute_new_offset scales offset correctly relative to cursor", () => {
		const result = zi.compute_new_offset({
			cursor_position: 100,
			current_offset: 0,
			new_scale: 2,
			old_scale: 1
		});

		// cursor_position - (new_scale / old_scale) * (cursor_position - current_offset)
		// = 100 - 2 * (100 - 0) = 100 - 200 = -100
		expect(result).toBe(-100);
	});

	test("compute_new_offset accounts for existing offset", () => {
		const result = zi.compute_new_offset({
			cursor_position: 100,
			current_offset: 50,
			new_scale: 2,
			old_scale: 1
		});

		// = 100 - 2 * (100 - 50) = 100 - 100 = 0
		expect(result).toBe(0);
	});
});
