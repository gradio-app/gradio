<script lang="ts">
	export let type = "corner";
	export let location: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r";
	export let parent: HTMLElement;
	let dragging = false;

	export let x = 0;
	export let y = 0;
	export let width;
	export let height;

	let box: DOMRect;

	function clamp(n: number, min: number, max: number): number {
		return n < min ? min : n > max ? max : n;
	}

	function handle_mousedown(e: MouseEvent): void {
		box = parent.getBoundingClientRect();
		dragging = true;
	}

	function handle_mousemove(e: MouseEvent): void {
		if (!dragging) return;

		if (["tl", "bl", "l"].includes(location)) {
			x = clamp(e.clientX - box.x, 0, box.width);
			width = clamp(box.width - x, 0, box.width);
		}

		if (["tl", "tr", "t"].includes(location)) {
			y = clamp(e.clientY - box.y, 0, box.height);
			height = clamp(box.height - y, 0, box.height);
		}

		if (["tr", "r", "br"].includes(location)) {
			width = clamp(e.clientX - box.x - x, 0, box.width);
		}

		if (["br", "b", "bl"].includes(location)) {
			height = clamp(e.clientY - box.y - y, 0, box.height);
		}
	}

	function handle_mouseup(e: MouseEvent): void {
		dragging = false;
	}
</script>

<svelte:window on:mousemove={handle_mousemove} on:mouseup={handle_mouseup} />

<!--	svelte-ignore a11y-no-static-element-interactions -->
<div class="hitbox {location}" on:mousedown={handle_mousedown}>
	<div class="handle {type} {location}"></div>
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
