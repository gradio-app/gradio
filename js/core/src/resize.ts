/**
 * Height reporting for apps embedded in an auto-sizing iframe (Hugging Face
 * Spaces). The decision is kept separate from the DOM so it can be tested.
 */

/** Reported on top of the content so its bottom is not clipped. */
export const FRAME_SLACK = 32;

export interface ResizeState {
	/** The height we last asked the parent frame for. */
	last_reported_height: number;
	/** How many ticks in a row we have asked to grow. */
	consecutive_grows: number;
	/** The height the parent frame gave us of its own accord. */
	base_height: number;
	/** A size we asked for that the parent has not applied yet. */
	awaiting_height: number | null;
	/** The viewport at the moment we asked, so we can tell when it moves. */
	viewport_at_request: number;
}

export interface Measurement {
	/** Bottom of the measured element as it is laid out right now. */
	stretched_bottom: number;
	/**
	 * Bottom of the measured element with `fill_height` stretching removed, i.e.
	 * how much room the content actually needs. Only called when it can change
	 * the outcome, because measuring it forces a reflow.
	 */
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

/**
 * Decide what height to ask the parent frame for, updating `state`. Returns
 * `null` to leave the frame alone.
 */
export function next_frame_height(
	state: ResizeState,
	m: Measurement
): number | null {
	// Learn the height the parent wants us to have. Until a size we asked for has
	// actually been applied, the viewport still shows the old height, and reading
	// that as a parent-driven resize would pin `base_height` to a height we are
	// in the middle of giving back.
	if (state.awaiting_height !== null) {
		const landed = Math.abs(m.viewport - state.awaiting_height) < 2;
		const moved = Math.abs(m.viewport - state.viewport_at_request) >= 2;
		if (landed || moved) state.awaiting_height = null;
	} else if (Math.abs(m.viewport - state.last_reported_height) >= 2) {
		state.base_height = m.viewport;
	}

	let bottom = m.stretched_bottom;
	if (m.viewport > state.base_height + 2) {
		// The frame we are laid out in is taller than the one the parent wants us
		// to have, because we grew it earlier. Content stretched by `fill_height`
		// fills whatever height the frame has, so `stretched_bottom` cannot say
		// whether the content still needs the extra room - the unstretched bottom
		// can. This has to key off the current frame rather than what we last
		// asked for: right after we request a shrink, the frame is still tall.
		const unstretched = m.measure_unstretched_bottom();
		if (unstretched < bottom) {
			// Give the room back, but never more than we took.
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
