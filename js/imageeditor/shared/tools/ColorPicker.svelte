<script lang="ts">
	import { tick } from "svelte";
	import tinycolor from "tinycolor2";
	import { clamp } from "../utils/pixi";

	export let color = "rgb(255, 255, 255)";

	let name = "world";
	let sl_marker_pos = [0, 0];
	let sl_rect: DOMRect | null = null;
	let sl_moving = false;
	let sl = [0, 0];

	let hue = 0;
	let hue_marker_pos = 0;
	let hue_rect: DOMRect | null = null;
	let hue_moving = false;

	function handle_hue_down(
		event: MouseEvent & { currentTarget: HTMLDivElement }
	): void {
		hue_rect = event.currentTarget.getBoundingClientRect();

		hue_moving = true;
		update_hue_from_mouse(event.clientX);
	}

	function update_hue_from_mouse(x: number): void {
		if (!hue_rect) return;
		const _x = clamp(x - hue_rect.left, 0, hue_rect.width); // Get the x-coordinate relative to the box
		hue_marker_pos = _x;
		const _hue = (_x / hue_rect.width) * 360; // Scale the x position to a hue value (0-360)

		hue = _hue;

		color = hsva_to_rgba({ h: _hue, s: sl[0], v: sl[1], a: 1 });
	}

	function hsva_to_rgba(hsva: {
		h: number;
		s: number;
		v: number;
		a: number;
	}): string {
		const saturation = hsva.s;
		const value = hsva.v;
		let chroma = saturation * value;
		const hue_by_60 = hsva.h / 60;
		let x = chroma * (1 - Math.abs((hue_by_60 % 2) - 1));
		const m = value - chroma;

		chroma = chroma + m;
		x = x + m;

		const index = Math.floor(hue_by_60) % 6;
		const red = [chroma, x, m, m, x, chroma][index];
		const green = [x, chroma, chroma, x, m, m][index];
		const blue = [m, m, x, chroma, chroma, x][index];

		return `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${hsva.a})`;
	}

	function update_color_from_mouse(x: number, y: number): void {
		if (!sl_rect) return;
		const _x = clamp(x - sl_rect.left, 0, sl_rect.width);
		const _y = clamp(y - sl_rect.top, 0, sl_rect.height);
		sl_marker_pos = [_x, _y];
		const _hsva = {
			h: hue * 1,
			s: _x / sl_rect.width,
			v: 1 - _y / sl_rect.height,
			a: 1
		};

		sl = [_hsva.s, _hsva.v];

		color = hsva_to_rgba(_hsva);
	}

	function handle_sl_down(
		event: MouseEvent & { currentTarget: HTMLDivElement }
	): void {
		sl_moving = true;
		sl_rect = event.currentTarget.getBoundingClientRect();
		update_color_from_mouse(event.clientX, event.clientY);
	}

	function handle_move(
		event: MouseEvent & { currentTarget: EventTarget & Window }
	): void {
		if (sl_moving) update_color_from_mouse(event.clientX, event.clientY);
		if (hue_moving) update_hue_from_mouse(event.clientX);
	}

	function handle_end(): void {
		if (sl_moving) sl_moving = false;
		if (hue_moving) hue_moving = false;
	}

	async function update_mouse_from_color(color: string): Promise<void> {
		if (sl_moving || hue_moving) return;
		await tick();
		if (!color) return;
		if (!sl_rect) {
			sl_rect = sl_wrap.getBoundingClientRect();
		}

		if (!hue_rect) {
			hue_rect = hue_wrap.getBoundingClientRect();
		}

		const hsva = tinycolor(color).toHsv();
		const _x = hsva.s * sl_rect!.width;
		const _y = (1 - hsva.v) * sl_rect!.height;
		sl_marker_pos = [_x, _y];
		sl = [hsva.s, hsva.v];
		hue = hsva.h;
		hue_marker_pos = (hsva.h / 360) * hue_rect!.width;
	}

	$: update_mouse_from_color(color);

	let sl_wrap: HTMLDivElement;
	let hue_wrap: HTMLDivElement;
</script>

<svelte:window on:mousemove={handle_move} on:mouseup={handle_end} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="color-gradient"
	on:mousedown={handle_sl_down}
	style="--hue:{hue}"
	bind:this={sl_wrap}
>
	<div
		class="marker"
		style:transform="translate({sl_marker_pos[0]}px,{sl_marker_pos[1]}px)"
		style:background={color}
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

<style>
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
		border-top: none;
	}

	.color-gradient {
		position: relative;
		--hue: white;

		background: linear-gradient(rgba(0, 0, 0, 0), #000),
			linear-gradient(90deg, #fff, hsl(var(--hue), 100%, 50%));
		width: 100%;
		height: 150px;
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
	}

	.marker {
		position: absolute;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid white;

		top: -7px;
		left: -7px;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
		pointer-events: none;
	}

	.hue-slider > .marker {
		box-shadow: 0 0 1px #888;
		top: -3px;
		margin: auto;
		height: 16px;
		width: 16px;
		left: -8px;
		border: 2px solid white;
	}
</style>
