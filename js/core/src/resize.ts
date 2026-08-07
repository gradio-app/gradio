/** Height reporting for apps embedded in an auto-sizing iframe (Spaces). */

/** Reported on top of the content so its bottom is not clipped. */
export const FRAME_SLACK = 32;
export const IFRAME_RESIZER_READY_EVENT = "gradio:iframe-resizer-ready";

export interface ResizeState {
	last_reported_height: number;
	consecutive_grows: number;
	/** The height the parent frame gave us of its own accord. */
	base_height: number;
	/** A size we asked for that the parent has not applied yet. */
	awaiting_height: number | null;
	/** The viewport when we asked, so we can tell when the frame moves. */
	viewport_at_request: number;
}

export interface Measurement {
	stretched_bottom: number;
	/** Forces a reflow, so it is only called when it can change the outcome. */
	measure_unstretched_bottom: () => number;
	footer_height: number;
	viewport: number;
}

export function create_resize_state(): ResizeState {
	return {
		last_reported_height: 0,
		consecutive_grows: 0,
		base_height: 0,
		awaiting_height: null,
		viewport_at_request: 0
	};
}

/** Connect manual sizing whether iframe-resizer initializes before or after us. */
export function setup_iframe_resizer(
	target: EventTarget,
	get_parent_iframe: () => Window["parentIFrame"],
	handle_resize: () => void
): () => void {
	const connect = (): void => {
		const parent_iframe = get_parent_iframe();
		if (!parent_iframe) return;
		parent_iframe.autoResize(false);
		handle_resize();
	};

	target.addEventListener(IFRAME_RESIZER_READY_EVENT, connect);
	connect();
	return () => target.removeEventListener(IFRAME_RESIZER_READY_EVENT, connect);
}

/** The height to ask the parent frame for, or `null` to leave it alone. */
export function next_frame_height(
	state: ResizeState,
	m: Measurement
): number | null {
	// Until a size we asked for has been applied, the viewport still shows the old
	// height; reading that as a parent-driven resize would pin `base_height` to a
	// height we are in the middle of giving back.
	if (state.awaiting_height !== null) {
		const landed = Math.abs(m.viewport - state.awaiting_height) < 2;
		const moved = Math.abs(m.viewport - state.viewport_at_request) >= 2;
		if (landed) {
			state.awaiting_height = null;
		} else if (moved) {
			// Somewhere we never asked for, so the parent moved us itself.
			state.awaiting_height = null;
			state.base_height = m.viewport;
		}
	} else if (Math.abs(m.viewport - state.last_reported_height) >= 2) {
		state.base_height = m.viewport;
	}

	let bottom = m.stretched_bottom;
	// In a frame we grew ourselves, `fill_height` content fills whatever height it
	// is given, so only the unstretched bottom says whether it still needs the
	// room. Keyed off the current frame, not the last request: right after asking
	// to shrink, the frame is still tall.
	if (m.viewport > state.base_height + 2) {
		const unstretched = m.measure_unstretched_bottom();
		if (unstretched < bottom) {
			bottom = Math.max(
				unstretched,
				state.base_height - m.footer_height - FRAME_SLACK
			);
		}
	}

	const next = bottom + m.footer_height + FRAME_SLACK;

	// Ignore sub-pixel echoes from our own resize.
	if (Math.abs(next - state.last_reported_height) < 2) {
		state.consecutive_grows = 0;
		return null;
	}

	if (next > state.last_reported_height) {
		// Content sized in viewport-relative units (`vh`/`%`) or stretched by
		// `fill_height` grows to fill whatever height the iframe is given, so its
		// measured bottom just tracks the viewport. Requesting a larger size in
		// that case feeds back into an unbounded growth loop (#12089, #12992).
		// (a) If the content merely fills the viewport (no real overflow), don't grow.
		if (next > m.viewport && bottom <= m.viewport + 2) return null;
		// (b) Circuit breaker: if we keep growing tick after tick, the content is
		// tracking the iframe we just grew (a feedback loop), not genuinely taller
		// content. Stop growing so the height stays bounded. Legitimate content
		// (late-loading images, revealed blocks) settles within a few grows.
		state.consecutive_grows += 1;
		if (state.consecutive_grows > 4) return null;
	} else {
		// Shrinking to fit shorter content is always safe and breaks any loop.
		state.consecutive_grows = 0;
	}

	state.last_reported_height = next;
	state.awaiting_height = next;
	state.viewport_at_request = m.viewport;
	return next;
}
