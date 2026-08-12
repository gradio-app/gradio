import { describe, expect, test, vi } from "vitest";
import {
	create_resize_state,
	next_frame_height,
	FRAME_SLACK,
	IFRAME_RESIZER_READY_EVENT,
	reset_resize_growth,
	setup_iframe_resizer
} from "./resize";
import type { ResizeState } from "./resize";

interface Content {
	(viewport: number): {
		stretched_bottom: number;
		unstretched_bottom: number;
		document_height?: number;
	};
}

/** `fill_height` content: fills the frame when it fits, overflows when it does not. */
function stretchy(needs: number, footer = 21): Content {
	return (viewport) => ({
		stretched_bottom: Math.max(needs, viewport - footer - FRAME_SLACK),
		unstretched_bottom: needs
	});
}

function rigid(needs: number): Content {
	return () => ({ stretched_bottom: needs, unstretched_bottom: needs });
}

/** `height: 100vh` content: its bottom tracks the frame, stretched or not. */
const viewport_sized: Content = (viewport) => ({
	stretched_bottom: viewport,
	unstretched_bottom: viewport
});

/** The parent does not apply a size the moment it is asked, so ticks in between
 * still see the old viewport. That delay is what makes this logic tricky. */
class Frame {
	viewport: number;
	footer: number;
	state: ResizeState = create_resize_state();
	requested: number | null = null;
	reports: number[] = [];

	constructor(viewport: number, footer = 21) {
		this.viewport = viewport;
		this.footer = footer;
	}

	tick(content: Content): number | null {
		const m = content(this.viewport);
		const next = next_frame_height(this.state, {
			stretched_bottom: m.stretched_bottom,
			measure_unstretched_bottom: () => m.unstretched_bottom,
			footer_height: this.footer,
			document_height:
				m.document_height ?? m.stretched_bottom + this.footer + FRAME_SLACK,
			viewport: this.viewport
		});
		if (next !== null) {
			this.requested = next;
			this.reports.push(next);
		}
		return next;
	}

	apply(): void {
		if (this.requested !== null) {
			this.viewport = Math.ceil(this.requested);
			this.requested = null;
		}
	}

	settle(content: Content, rounds = 8): void {
		for (let i = 0; i < rounds; i++) {
			this.tick(content);
			this.tick(content);
			this.apply();
			this.tick(content);
		}
	}
}

describe("next_frame_height", () => {
	test("follows content that grows and shrinks again", () => {
		const frame = new Frame(800);
		frame.settle(rigid(108));
		expect(frame.viewport).toBe(161);
		frame.settle(rigid(1000));
		expect(frame.viewport).toBe(1053);
		// Content that does not stretch is not held to the parent's height.
		frame.settle(rigid(108));
		expect(frame.viewport).toBe(161);
	});

	// gradio-app/gradio#8771
	test("returns to the parent's height every time content is revealed and hidden", () => {
		const frame = new Frame(800);
		frame.settle(stretchy(747));
		expect(frame.viewport).toBe(800);

		for (let i = 0; i < 5; i++) {
			frame.settle(stretchy(1127)); // an accordion opens
			expect(frame.viewport).toBeGreaterThan(1100);
			frame.settle(stretchy(747)); // and closes again
			expect(frame.viewport).toBe(800);
		}
	});

	test("does not grow back while its own shrink request is in flight", () => {
		const frame = new Frame(800);
		frame.settle(stretchy(747));
		frame.settle(stretchy(1127));
		const grown = frame.viewport;

		frame.tick(stretchy(747));
		expect(frame.requested).toBe(800);

		expect(frame.tick(stretchy(747))).toBe(null);
		expect(frame.tick(stretchy(747))).toBe(null);
		expect(frame.viewport).toBe(grown);

		frame.apply();
		expect(frame.viewport).toBe(800);
		expect(frame.tick(stretchy(747))).toBe(null);
	});

	test("never shrinks below the height the parent gave us", () => {
		const frame = new Frame(800);
		frame.settle(stretchy(747));
		frame.settle(stretchy(1127));
		frame.settle(stretchy(100));
		expect(frame.viewport).toBe(800);
	});

	test("adopts a new floor when the parent resizes the frame itself", () => {
		const frame = new Frame(800);
		frame.settle(stretchy(747));

		// The window is resized, so the parent gives us 1400 of its own accord.
		frame.viewport = 1400;
		frame.settle(stretchy(1347));
		expect(frame.viewport).toBe(1400);

		frame.settle(stretchy(1800));
		expect(frame.viewport).toBeGreaterThan(1800);
		frame.settle(stretchy(600));
		expect(frame.viewport).toBe(1400);
	});

	test("adopts the parent's height when it resizes while a request is in flight", () => {
		const frame = new Frame(800);
		frame.settle(stretchy(747));
		frame.settle(stretchy(1127));

		// We ask for a smaller frame, but the window is resized before the parent
		// applies it, so the frame moves somewhere we never asked for.
		frame.tick(stretchy(747));
		expect(frame.requested).toBe(800);
		frame.viewport = 1400;
		frame.requested = null;

		frame.settle(stretchy(1347));
		expect(frame.viewport).toBe(1400);

		// The content shrinks again: we come back to the parent's height, not the
		// one it had before the resize.
		frame.settle(stretchy(600));
		expect(frame.viewport).toBe(1400);
	});

	test("does not measure the unstretched height while the frame is not grown", () => {
		const state = create_resize_state();
		const measure = vi.fn(() => 108);
		next_frame_height(state, {
			stretched_bottom: 108,
			measure_unstretched_bottom: measure,
			footer_height: 21,
			document_height: 161,
			viewport: 800
		});
		expect(measure).not.toHaveBeenCalled();
	});

	// gradio-app/gradio#12089
	test("grows only once for viewport-sized content with a footer", () => {
		const frame = new Frame(800);
		frame.settle(viewport_sized);
		expect(frame.viewport).toBe(853);
		expect(frame.reports).toEqual([853]);
	});

	// gradio-app/gradio#12992 (`fill_height` with `footer_links=[]`)
	test("does not grow for stretched content when there is no footer", () => {
		const frame = new Frame(800, 0);
		frame.settle(stretchy(700, 0), 20);
		expect(frame.viewport).toBe(800);
	});

	test("gives up after a few grows when the content keeps outgrowing the frame", () => {
		const frame = new Frame(800);
		let needs = 900;
		const creeping: Content = () => {
			needs += 100;
			return { stretched_bottom: needs, unstretched_bottom: needs };
		};
		for (let i = 0; i < 20; i++) {
			frame.tick(creeping);
			frame.apply();
		}
		expect(frame.reports.length).toBeLessThanOrEqual(5);
	});

	test("resumes growing when the UI reveals content after the limiter trips", () => {
		const frame = new Frame(800);
		let needs = 900;
		const creeping: Content = () => {
			needs += 100;
			return { stretched_bottom: needs, unstretched_bottom: needs };
		};

		for (let i = 0; i < 20; i++) {
			frame.tick(creeping);
			frame.apply();
		}

		const revealed = rigid(frame.viewport + 300);
		expect(frame.tick(revealed)).toBe(null);

		reset_resize_growth(frame.state);
		expect(frame.tick(revealed)).toBeGreaterThan(frame.viewport);
	});

	test("exposes the footer below viewport-filling initial content", () => {
		const frame = new Frame(670);
		frame.state.consecutive_grows = 5;
		expect(
			frame.tick(() => ({
				stretched_bottom: 654,
				unstretched_bottom: 654,
				document_height: 723
			}))
		).toBe(723);
		frame.apply();
		expect(frame.tick(viewport_sized)).toBe(null);
		expect(frame.viewport).toBe(723);
		expect(frame.reports).toEqual([723]);
	});
});

describe("setup_iframe_resizer", () => {
	test("connects when iframe-resizer becomes ready after the app", () => {
		const target = new EventTarget();
		const handle_resize = vi.fn();
		const autoResize = vi.fn();
		let parent_iframe: Window["parentIFrame"];
		const disconnect = setup_iframe_resizer(
			target,
			() => parent_iframe,
			handle_resize
		);

		expect(handle_resize).not.toHaveBeenCalled();
		parent_iframe = {
			autoResize,
			size: vi.fn(),
			scrollTo: vi.fn(),
			getPageInfo: vi.fn()
		};
		target.dispatchEvent(new Event(IFRAME_RESIZER_READY_EVENT));

		expect(autoResize).toHaveBeenCalledWith(false);
		expect(handle_resize).toHaveBeenCalledOnce();

		disconnect();
		target.dispatchEvent(new Event(IFRAME_RESIZER_READY_EVENT));
		expect(handle_resize).toHaveBeenCalledOnce();
	});

	test("connects immediately when iframe-resizer is already ready", () => {
		const autoResize = vi.fn();
		const handle_resize = vi.fn();
		const parent_iframe: NonNullable<Window["parentIFrame"]> = {
			autoResize,
			size: vi.fn(),
			scrollTo: vi.fn(),
			getPageInfo: vi.fn()
		};

		setup_iframe_resizer(new EventTarget(), () => parent_iframe, handle_resize);

		expect(autoResize).toHaveBeenCalledWith(false);
		expect(handle_resize).toHaveBeenCalledOnce();
	});
});
