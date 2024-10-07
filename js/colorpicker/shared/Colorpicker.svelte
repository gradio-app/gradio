<script lang="ts">
	import { createEventDispatcher, afterUpdate, onMount } from "svelte";
	import tinycolor from "tinycolor2";
	import { BlockTitle } from "@gradio/atoms";
	import { click_outside } from "./events";
	import { Eyedropper } from "@gradio/icons";

	export let value = "#000000";
	export let value_is_output = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let disabled = false;
	export let show_label = true;

	export let current_mode: "hex" | "rgb" | "hsl" = "hex";
	export let dialog_open = false;

	let eyedropper_supported = false;

	let sl_wrap: HTMLDivElement;
	let hue_wrap: HTMLDivElement;

	const dispatch = createEventDispatcher<{
		change: string;
		click_outside: void;
		input: undefined;
		submit: undefined;
		blur: undefined;
		focus: undefined;
	}>();

	onMount(async () => {
		// @ts-ignore
		eyedropper_supported = window !== undefined && !!window.EyeDropper;
	});

	function request_eyedropper(): void {
		// @ts-ignore
		const eyeDropper = new EyeDropper();

		eyeDropper.open().then((result: { sRGBHex: string }) => {
			value = result.sRGBHex;
		});
	}

	let sl_marker_pos = [0, 0];
	let sl_rect: DOMRect | null = null;
	let sl_moving = false;
	let sl = [0, 0];

	let hue = 0;
	let hue_marker_pos = 0;
	let hue_rect: DOMRect | null = null;
	let hue_moving = false;

	const modes = [
		["Hex", "hex"],
		["RGB", "rgb"],
		["HSL", "hsl"]
	] as const;

	function format_color(color: string, mode: "hex" | "rgb" | "hsl"): string {
		if (mode === "hex") {
			return tinycolor(color).toHexString();
		} else if (mode === "rgb") {
			return tinycolor(color).toRgbString();
		}
		return tinycolor(color).toHslString();
	}

	$: color_string = format_color(value, current_mode);

	function handle_hue_down(
		event: MouseEvent & { currentTarget: HTMLDivElement }
	): void {
		hue_rect = event.currentTarget.getBoundingClientRect();
		hue_moving = true;
		update_hue_from_mouse(event.clientX);
	}

	function update_hue_from_mouse(x: number): void {
		if (!hue_rect) return;
		const _x = Math.max(0, Math.min(x - hue_rect.left, hue_rect.width));
		hue_marker_pos = _x;
		const _hue = (_x / hue_rect.width) * 360;
		hue = _hue;
		update_color();
	}

	function handle_sl_down(
		event: MouseEvent & { currentTarget: HTMLDivElement }
	): void {
		sl_moving = true;
		sl_rect = event.currentTarget.getBoundingClientRect();
		update_color_from_mouse(event.clientX, event.clientY);
	}

	function update_color_from_mouse(x: number, y: number): void {
		if (!sl_rect) return;
		const _x = Math.max(0, Math.min(x - sl_rect.left, sl_rect.width));
		const _y = Math.max(0, Math.min(y - sl_rect.top, sl_rect.height));
		sl_marker_pos = [_x, _y];
		sl = [_x / sl_rect.width, 1 - _y / sl_rect.height];
		update_color();
	}

	function update_color(): void {
		value = tinycolor({ h: hue, s: sl[0], v: sl[1] }).toRgbString();
		dispatch("change", value);
	}

	function handle_move(event: MouseEvent): void {
		if (sl_moving) update_color_from_mouse(event.clientX, event.clientY);
		if (hue_moving) update_hue_from_mouse(event.clientX);
	}

	function handle_end(): void {
		sl_moving = false;
		hue_moving = false;
	}

	function update_from_input(): void {
		const tc = tinycolor(value);
		const hsv = tc.toHsv();
		hue = hsv.h;
		sl = [hsv.s, hsv.v];
		hue_marker_pos = (hue / 360) * (hue_rect?.width || 0);
		sl_marker_pos = [
			sl[0] * (sl_rect?.width || 0),
			(1 - sl[1]) * (sl_rect?.height || 0)
		];
		dispatch("change", value);
	}

	function handle_click_outside(): void {
		dialog_open = false;
	}

	function handle_change(): void {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}

	afterUpdate(() => {
		value_is_output = false;
	});

	$: value, handle_change();
</script>

<BlockTitle {show_label} {info}>{label}</BlockTitle>
<button
	class="dialog-button"
	style:background={value}
	{disabled}
	on:click={() => (dialog_open = !dialog_open)}
/>

<svelte:window on:mousemove={handle_move} on:mouseup={handle_end} />

{#if dialog_open}
	<div
		class="color-picker"
		on:focus
		on:blur
		use:click_outside={handle_click_outside}
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="color-gradient"
			bind:this={sl_wrap}
			on:mousedown={handle_sl_down}
			style="--hue:{hue}"
		>
			<div
				class="marker"
				style:transform="translate({sl_marker_pos[0]}px,{sl_marker_pos[1]}px)"
				style:background={value}
			/>
		</div>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="hue-slider" on:mousedown={handle_hue_down} bind:this={hue_wrap}>
			<div
				class="marker"
				style:background={"hsl(" + hue + ", 100%, 50%)"}
				style:transform="translateX({hue_marker_pos}px)"
			/>
		</div>

		<div class="input">
			<div class="swatch" style:background={value}></div>
			<div>
				<div class="input-wrap">
					<input
						type="text"
						bind:value={color_string}
						on:change={update_from_input}
					/>
					<button class="eyedropper" on:click={request_eyedropper}>
						{#if eyedropper_supported}
							<Eyedropper />
						{/if}
					</button>
				</div>

				<div class="buttons">
					{#each modes as [label, value]}
						<button
							class="button"
							class:active={current_mode === value}
							on:click={() => (current_mode = value)}>{label}</button
						>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-button {
		display: block;
		width: var(--size-10);
		height: var(--size-5);
		border: var(--block-border-width) solid var(--block-border-color);
		cursor: pointer;
	}

	.input {
		display: flex;
		align-items: center;
		padding: 0 10px 15px;
	}

	.input input {
		height: 30px;
		width: 100%;
		flex-shrink: 1;
		border-bottom-left-radius: 0;
		border: 1px solid var(--block-border-color);
		letter-spacing: -0.05rem;
		border-left: none;
		border-right: none;
		font-family: var(--font-mono);
		font-size: var(--scale-000);
		padding-left: 15px;
		padding-right: 0;
		background-color: var(--background-fill-secondary);
		color: var(--block-label-text-color);
	}

	.swatch {
		width: 50px;
		height: 50px;
		border-top-left-radius: 15px;
		border-bottom-left-radius: 15px;
		flex-shrink: 0;
		border: 1px solid var(--block-border-color);
	}

	.color-picker {
		width: 230px;
		background: var(--background-fill-secondary);
		border: 1px solid var(--block-border-color);
		border-radius: var(--block-radius);
		margin: var(--spacing-sm) 0;
	}

	.buttons {
		height: 20px;
		display: flex;
		justify-content: stretch;
		gap: 0px;
	}

	.buttons button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--block-border-color);
		background: var(--background-fill-secondary);
		padding: 3px 6px;
		font-size: var(--scale-000);
		cursor: pointer;
		border-right: none;
		width: 100%;
		border-top: none;
	}

	.buttons button:first-child {
		border-left: none;
	}

	.buttons button:last-child {
		border-bottom-right-radius: 15px;
		border-right: 1px solid var(--block-border-color);
	}

	.buttons button:hover {
		background: var(--background-fill-secondary-hover);
		font-weight: var(--weight-bold);
	}

	.buttons button.active {
		background: var(--background-fill-secondary);
		font-weight: var(--weight-bold);
	}

	.input-wrap {
		display: flex;
	}

	.color-gradient {
		position: relative;
		--hue: white;
		background: linear-gradient(rgba(0, 0, 0, 0), #000),
			linear-gradient(90deg, #fff, hsl(var(--hue), 100%, 50%));
		width: 100%;
		height: 150px;
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
	}

	.hue-slider {
		position: relative;
		width: 90%;
		margin: 10px auto;
		height: 10px;
		border-radius: 5px;
		background: linear-gradient(
			to right,
			hsl(0, 100%, 50%) 0%,
			#ff0 17%,
			lime 33%,
			cyan 50%,
			blue 67%,
			magenta 83%,
			red 100%
		);
	}

	.swatch {
		width: 50px;
		height: 50px;
		border-top-left-radius: 15px;
		border-bottom-left-radius: 15px;
		flex-shrink: 0;
		border: 1px solid var(--block-border-color);
	}

	.eyedropper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 25px;
		height: 30px;
		border-top-right-radius: 15px;
		border: 1px solid var(--block-border-color);
		border-left: none;
		background: var(--background-fill-secondary);
		height: 30px;
		padding: 7px 7px 5px 0px;
		cursor: pointer;
	}

	.marker {
		position: absolute;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid white;
		top: -2px;
		left: -7px;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
		pointer-events: none;
	}

	input {
		width: 100%;
		height: 30px;
		border: 1px solid var(--block-border-color);
		border-radius: var(--radius-sm);
		padding: 0 var(--size-2);
		font-family: var(--font-mono);
		font-size: var(--scale-000);
		color: var(--block-label-text-color);
		background-color: var(--background-fill-primary);
	}
</style>
