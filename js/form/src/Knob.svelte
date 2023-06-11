<script context="module">
	let _id = 0;
</script>

<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	const SCALE = 100;
	const MID_X = SCALE / 2;
	const MID_Y = SCALE / 2;
	const STROKE_WIDTH = 10;
	// radius goes to the middle of the stroke path, so subtract
	// half of the stroke width to make it touch the view box
	const RADIUS = Math.floor(SCALE / 2 - STROKE_WIDTH / 2);
	const GAP_ANGLE = 75;
	const MIN_ANGLE = GAP_ANGLE / 2;
	const MAX_ANGLE = 360 - GAP_ANGLE / 2;
	const POINTER_SENSITIVITY = 200;

	export let value: number = 0;
	export let value_is_output: boolean = false;
	export let minimum: number = 0;
	export let maximum: number = 100;
	export let step: number = 1;
	export let disabled: boolean = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean;

	const id = `knob_id_${_id++}`;
	const dispatch = createEventDispatcher<{
		change: number;
		input: undefined;
		release: number;
	}>();

	function handle_change() {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();

	$: value_angle = value_to_angle(value);
	$: origin_angle =
		minimum <= 0 && maximum >= 0 ? value_to_angle(0) : MIN_ANGLE;

	$: full_arc_path = arc_path(RADIUS, MIN_ANGLE, MAX_ANGLE);
	$: value_arc_path = arc_path(RADIUS, origin_angle, value_angle);

	$: step_digit_count =
		step >= 1 ? 0 : step.toString().length - step.toString().indexOf(".") - 1;

	let captured_value = 0;
	let captured_movement = 0;

	function handle_release() {
		value = clamp(value);
		dispatch("release", value);
	}

	function handle_pointer_down(e: PointerEvent) {
		if (!disabled) {
			e.preventDefault();

			captured_value = value;
			captured_movement = 0;

			window.addEventListener("pointermove", handle_pointer_move);
			window.addEventListener("pointerup", handle_pointer_up);
		}
	}

	function handle_pointer_up(e: PointerEvent) {
		if (!disabled) {
			e.preventDefault();

			window.removeEventListener("pointermove", handle_pointer_move);
			window.removeEventListener("pointerup", handle_pointer_up);

			handle_release();
		}
	}

	function handle_pointer_move(e: PointerEvent) {
		if (!disabled) {
			e.preventDefault();

			captured_movement -= e.movementY;

			const movement_step = (maximum - minimum) / POINTER_SENSITIVITY;

			let newValue = captured_value + captured_movement * movement_step;
			newValue = round_to_step(newValue);
			newValue = clamp(newValue);

			value = newValue;
		}
	}

	function clamp(value: number) {
		return Math.min(Math.max(value, minimum), maximum);
	}

	function round_to_step(value: number) {
		value = Math.round(value / step) * step;
		// use exponential notation for rounding, to prevent outcomes like 0.40000000001
		value = Number(
			Math.round(Number(value + "e" + step_digit_count)) +
				"e-" +
				step_digit_count
		);
		return value;
	}

	function value_to_angle(value: number) {
		value = clamp(value);
		const value_norm = (value - minimum) / (maximum - minimum);
		const angle_range = 360 - GAP_ANGLE;
		const angle_delta = value_norm * angle_range;
		const angle = MIN_ANGLE + angle_delta;
		return angle;
	}

	function angle_to_point(radius: number, angle_deg: number) {
		// consider point at 270 deg to be origin to avoid wrap around angles
		const angle_rad = ((angle_deg - 270) * Math.PI) / 180;

		return {
			x: MID_X + radius * Math.cos(angle_rad),
			y: MID_Y + radius * Math.sin(angle_rad)
		};
	}

	function arc_path(radius: number, start_angle: number, end_angle: number) {
		if (end_angle < start_angle) {
			const temp = start_angle;
			start_angle = end_angle;
			end_angle = temp;
		}

		const start_pt = angle_to_point(radius, start_angle);
		const end_pt = angle_to_point(radius, end_angle);

		const large_arc_flag = end_angle - start_angle > 180 ? 1 : 0;
		const sweep_flag = 1;

		return (
			`M ${start_pt.x} ${start_pt.y} ` +
			`A ${radius} ${radius} ` +
			`0 ${large_arc_flag} ${sweep_flag} ` +
			`${end_pt.x} ${end_pt.y}`
		);
	}
</script>

<div class="wrap">
	<label for={id}>
		<BlockTitle {show_label} {info}>{label}</BlockTitle>
	</label>

	<svg
		viewBox="0 0 {SCALE} {SCALE}"
		class="knob"
		class:knob-disabled={disabled}
		on:pointerdown={handle_pointer_down}
	>
		<path
			d={full_arc_path}
			stroke-width={STROKE_WIDTH}
			fill="none"
			class="knob-arc-full"
		/>
		<path
			d={value_arc_path}
			stroke-width={STROKE_WIDTH}
			fill="none"
			class="knob-arc-value"
			class:knob-arc-value-disabled={disabled}
		/>
		<text x="50%" y="56%" text-anchor="middle" class="knob-text">{value}</text>
	</svg>

	<input
		{id}
		data-testid="number-input"
		type="number"
		bind:value
		min={minimum}
		max={maximum}
		on:blur={handle_release}
		{step}
		{disabled}
	/>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 64px;
	}

	.knob {
		cursor: pointer;
		width: 100%;
	}

	.knob-disabled {
		cursor: not-allowed;
	}

	.knob-arc-full {
		stroke: var(--checkbox-border-color);
	}

	.knob-arc-value {
		stroke: var(--checkbox-background-color-selected);
	}

	.knob-arc-value-disabled {
		stroke-opacity: 0.25;
	}

	.knob-text {
		fill: var(--body-text-color);
		font-size: 22px;
		user-select: none;
	}

	input[type="number"] {
		display: block;
		position: relative;
		outline: none !important;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--input-radius);
		background: var(--input-background-fill);
		padding: var(--size-2) 0;
		width: 100%;
		height: var(--size-6);
		color: var(--body-text-color);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
		text-align: center;
	}
	input:disabled {
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
	}

	input[type="number"]:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	input::placeholder {
		color: var(--input-placeholder-color);
	}

	input[disabled] {
		cursor: not-allowed;
	}
</style>
