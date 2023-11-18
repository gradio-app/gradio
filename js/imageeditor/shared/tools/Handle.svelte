<script lang="ts">
	import { tick, createEventDispatcher } from "svelte";

	export let type = "corner";
	export let location: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r";

	export let x1 = 0;
	export let y1 = 0;
	export let x2 = 0;
	export let y2 = 0;

	let box: DOMRect;
	let y_offset = 0;
	let x_offset = 0;
	const min = 100;

	let active = false;

	const dispatch = createEventDispatcher<{
		change: {
			top: number | undefined;
			bottom: number | undefined;
			left: number | undefined;
			right: number | undefined;
		};
	}>();
	export let dragging = false;

	let el: HTMLDivElement;

	function handle_mousedown(e: MouseEvent): void {
		box = el.getBoundingClientRect();
		active = true;
		dragging = true;

		if (["tl", "bl", "l"].includes(location)) x_offset = e.clientX - box.right;
		if (["tl", "tr", "t"].includes(location)) y_offset = e.clientY - box.bottom;
		if (["tr", "r", "br"].includes(location)) x_offset = e.clientX - box.left;
		if (["br", "b", "bl"].includes(location)) y_offset = e.clientY - box.top;
	}

	function handle_mousemove(e: MouseEvent): void {
		if (!active) return;
		const top_pos = e.clientY - y_offset;
		const bottom_pos = e.clientY - y_offset;
		const left_pos = e.clientX - x_offset;
		const right_pos = e.clientX - x_offset;

		if (["tl", "bl", "l"].includes(location)) {
			x1 = left_pos;
		}

		if (["tl", "tr", "t"].includes(location)) {
			y1 = top_pos;
		}

		if (["tr", "r", "br"].includes(location)) {
			x2 = right_pos;
		}

		if (["br", "b", "bl"].includes(location)) {
			y2 = bottom_pos;
		}
	}

	async function handle_mouseup(e: MouseEvent): Promise<void> {
		await tick();
		active = false;
		dragging = false;
	}

	function make_transform(
		_location: typeof location,
		x1: number,
		x2: number,
		y1: number,
		y2: number
	): string {
		let t = undefined;
		let l = undefined;
		let r = undefined;
		let b = undefined;

		if (box) {
			if (["tl", "l", "bl"].includes(_location)) {
				l = x1;
			}

			if (["tl", "t", "tr"].includes(_location)) {
				t = y1;
			}

			if (["tr", "r", "br"].includes(_location)) {
				r = x2;
			}

			if (["br", "b", "bl"].includes(_location)) {
				b = y2;
			}
		}

		dispatch("change", { top: t, bottom: b, left: l, right: r });
		return "";
	}

	$: transform = make_transform(location, x1, x2, y1, y2);
</script>

<svelte:window on:mousemove={handle_mousemove} on:mouseup={handle_mouseup} />

<!--	svelte-ignore a11y-no-static-element-interactions -->
<div class="hitbox {location}" on:mousedown={handle_mousedown} style:transform>
	<div class="handle {type} {location}" bind:this={el}></div>
</div>

<style>
	.hitbox {
		position: absolute;
		width: 50px;
		height: 50px;
		--hitbox-mid-offset: calc(50% - 25px);
		--hitbox-corner-offset: -25px;
		--handle-corner-offset: calc(50% - 5px);
		--handle-mid-offset: calc(50% - 2px);
		z-index: 1;
	}

	/* hitbox positions  */
	.hitbox.tl,
	.hitbox.bl,
	.hitbox.l {
		left: var(--hitbox-corner-offset);
	}

	.hitbox.tr,
	.hitbox.br,
	.hitbox.r {
		right: var(--hitbox-corner-offset);
	}

	.hitbox.t,
	.hitbox.tr,
	.hitbox.tl {
		top: var(--hitbox-corner-offset);
	}

	.hitbox.t,
	.hitbox.b {
		left: var(--hitbox-mid-offset);
	}

	.hitbox.l,
	.hitbox.r {
		top: var(--hitbox-mid-offset);
	}

	.hitbox.b,
	.hitbox.br,
	.hitbox.bl {
		bottom: var(--hitbox-corner-offset);
	}

	/* hitbox cursors */

	.hitbox.tl,
	.hitbox.br {
		cursor: nwse-resize;
	}

	.hitbox.bl,
	.hitbox.tr {
		cursor: nesw-resize;
	}

	.hitbox.l,
	.hitbox.r {
		cursor: ew-resize;
	}

	.hitbox.t,
	.hitbox.b {
		cursor: ns-resize;
	}

	/* Visual handles  */
	.handle {
		position: absolute;
	}

	/* square to fill in corners */
	.corner {
		width: 4px;
		height: 4px;
		background: black;
	}

	/* handle segment positions  */
	.handle.tl,
	.handle.bl,
	.handle.l {
		left: var(--handle-corner-offset);
	}

	.handle.tr,
	.handle.r,
	.handle.br {
		right: var(--handle-corner-offset);
	}

	.handle.tr,
	.handle.t,
	.handle.tl {
		top: var(--handle-corner-offset);
	}

	.handle.br,
	.handle.b,
	.handle.bl {
		bottom: var(--handle-corner-offset);
	}

	.handle.l,
	.handle.r {
		bottom: var(--handle-mid-offset);
	}

	.handle.t,
	.handle.b {
		left: var(--handle-mid-offset);
	}

	.handle::before {
		position: absolute;
		content: "";
		width: 20px;
		height: 4px;
		background: black;
	}

	.handle::after {
		position: absolute;
		content: "";
		width: 4px;
		height: 20px;
		background: black;
	}

	.handle.t::before,
	.handle.b::before {
		width: 30px;
		left: -14px;
	}

	.handle.r::after,
	.handle.l::after {
		height: 30px;
		top: -13px;
	}

	.handle.l::before,
	.handle.r::before {
		content: none;
	}

	.handle.t::after,
	.handle.b::after {
		content: none;
	}

	.handle.tr::before,
	.handle.br::before {
		right: 4px;
	}

	.handle.tl::before,
	.handle.bl::before {
		left: 4px;
	}

	.handle.tl::after,
	.handle.tr::after {
		top: 4px;
	}

	.handle.bl::after,
	.handle.br::after {
		bottom: 4px;
	}
</style>
