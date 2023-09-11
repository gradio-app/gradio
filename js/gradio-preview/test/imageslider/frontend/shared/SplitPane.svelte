<script>
	import * as yootils from "yootils";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let type = "vertical";
	export let pos = 50;
	export let fixed = false;
	export let buffer = 42;
	export let min = 100;
	export let max = 100;

	let w;
	let h;
	$: size = type === "vertical" ? h : w;

	$: min = 100 * (buffer / size);
	$: max = 100 - min;
	$: pos = yootils.clamp(pos, min, max);

	const refs = {};

	let dragging = false;

	function setPos(event) {
		const { top, left } = refs.container.getBoundingClientRect();

		const px = type === "vertical" ? event.clientY - top : event.clientX - left;

		pos = (100 * px) / size;
		dispatch("change");
	}

	function setTouchPos(event) {
		const { top, left } = refs.container.getBoundingClientRect();

		const px =
			type === "vertical"
				? event.touches[0].clientY - top
				: event.touches[0].clientX - left;

		pos = (100 * px) / size;
		dispatch("change");
	}

	function drag(node, callback) {
		const mousedown = (event) => {
			if (event.which !== 1) return;

			event.preventDefault();

			dragging = true;

			const onmouseup = () => {
				dragging = false;

				window.removeEventListener("mousemove", callback, false);
				window.removeEventListener("mouseup", onmouseup, false);
			};

			window.addEventListener("mousemove", callback, false);
			window.addEventListener("mouseup", onmouseup, false);
		};

		node.addEventListener("mousedown", mousedown, false);

		return {
			destroy() {
				node.removeEventListener("mousedown", mousedown, false);
			}
		};
	}

	function touchDrag(node, callback) {
		const touchdown = (event) => {
			if (event.targetTouches.length > 1) return;

			event.preventDefault();

			dragging = true;

			const ontouchend = () => {
				dragging = false;

				window.removeEventListener("touchmove", callback, false);
				window.removeEventListener("touchend", ontouchend, false);
			};

			window.addEventListener("touchmove", callback, false);
			window.addEventListener("touchend", ontouchend, false);
		};

		node.addEventListener("touchstart", touchdown, false);

		return {
			destroy() {
				node.removeEventListener("touchstart", touchdown, false);
			}
		};
	}

	$: side = type === "horizontal" ? "left" : "top";
	$: dimension = type === "horizontal" ? "width" : "height";
</script>

<div
	class="container"
	bind:this={refs.container}
	bind:clientWidth={w}
	bind:clientHeight={h}
>
	<slot />
	<div
		class="{type} divider"
		style="{side}: calc({pos}% - 8px)"
		use:drag={setPos}
		use:touchDrag={setTouchPos}
	></div>
</div>

{#if dragging}
	<div class="mousecatcher"></div>
{/if}

<style>
	.container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.pane {
		position: relative;
		float: left;
		width: 100%;
		height: 100%;
		overflow: auto;
	}

	.mousecatcher {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.01);
	}

	.divider {
		position: absolute;
		z-index: 10;
		display: none;
	}

	.divider::after {
		content: "";
		position: absolute;
		/* background-color: #eee; */
		background-color: var(--second);
	}

	.horizontal {
		padding: 0 8px;
		width: 0;
		height: 100%;
		cursor: ew-resize;
	}

	.horizontal::after {
		left: 8px;
		top: 0;
		width: 1px;
		height: 100%;
	}

	.vertical {
		padding: 8px 0;
		width: 100%;
		height: 0;
		cursor: ns-resize;
	}

	.vertical::after {
		top: 8px;
		left: 0;
		width: 100%;
		height: 1px;
	}

	.left,
	.right,
	.divider {
		display: block;
	}

	.left,
	.right {
		height: 100%;
		float: left;
	}

	.top,
	.bottom {
		position: absolute;
		width: 100%;
	}

	.top {
		top: 0;
	}
	.bottom {
		bottom: 0;
	}
</style>
