import { writable, type Writable } from "svelte/store";

export interface ZoomPanState {
	scale: number;
	translate_x: number;
	translate_y: number;
}

export function init_zoom_pan(initial_scale = 1): {
	zoom_pan_state: Writable<ZoomPanState>;
	zoom_in: () => void;
	zoom_out: () => void;
	reset_zoom_pan: () => void;
	handle_wheel: (event: WheelEvent) => void;
	zoom_to_point: (scale: number, pointX: number, pointY: number) => void;
} {
	const zoom_pan_state: Writable<ZoomPanState> = writable({
		scale: initial_scale,
		translate_x: 0,
		translate_y: 0
	});

	const MIN_SCALE = 0.1;
	const MAX_SCALE = 10;
	const ZOOM_SPEED = 0.001;

	function zoom_to_point(scale: number, pointX: number, pointY: number): void {
		zoom_pan_state.update((s) => {
			const new_scale = Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));
			const scale_change = new_scale / s.scale;

			return {
				scale: new_scale,
				translate_x: pointX - (pointX - s.translate_x) * scale_change,
				translate_y: pointY - (pointY - s.translate_y) * scale_change
			};
		});
	}

	function zoom_in(): void {
		zoom_pan_state.update((s) => ({
			...s,
			scale: Math.min(s.scale * 1.5, MAX_SCALE) // More significant zoom in
		}));
	}

	function zoom_out(): void {
		zoom_pan_state.update((s) => ({
			...s,
			scale: Math.max(s.scale / 1.5, MIN_SCALE) // More significant zoom out
		}));
	}

	function reset_zoom_pan(): void {
		zoom_pan_state.set({
			scale: initial_scale,
			translate_x: 0,
			translate_y: 0
		});
	}

	function handle_wheel(event: WheelEvent): void {
		event.preventDefault();

		if (event.ctrlKey || event.metaKey) {
			const delta = -event.deltaY;
			const zoom_factor = Math.exp(delta * ZOOM_SPEED);

			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			const point_x = event.clientX - rect.left;
			const point_y = event.clientY - rect.top;

			zoom_pan_state.update((s) => {
				const new_scale = Math.max(
					MIN_SCALE,
					Math.min(s.scale * zoom_factor, MAX_SCALE)
				);
				return {
					scale: new_scale,
					translate_x: point_x - (point_x - s.translate_x) * zoom_factor,
					translate_y: point_y - (point_y - s.translate_y) * zoom_factor
				};
			});
		} else {
			zoom_pan_state.update((s) => ({
				...s,
				translate_x: s.translate_x - event.deltaX,
				translate_y: s.translate_y - event.deltaY
			}));
		}
	}

	return {
		zoom_pan_state,
		zoom_in,
		zoom_out,
		reset_zoom_pan,
		handle_wheel,
		zoom_to_point
	};
}
