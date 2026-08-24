<script lang="ts">
	import { onMount, type Snippet } from "svelte";

	let {
		position = $bindable(0.5),
		disabled = false,
		show_nav = true,
		children
	}: {
		position?: number;
		disabled?: boolean;
		show_nav?: boolean;
		children?: Snippet;
	} = $props();

	let active = false;
	let hidden = $state(true);
	let el: HTMLDivElement | undefined = $state()!;
	let inner: HTMLDivElement | undefined = $state()!;
	let box: DOMRect | undefined;
	let px = $state(0);
	let offset = 0;

	function handle_mousedown(e: MouseEvent) {
		if (disabled || !el || !inner) return;
		active = true;
		box = el.getBoundingClientRect();
		const innerbox = inner.getBoundingClientRect();
		offset = e.clientX - innerbox.left;
	}

	function handle_mouseup(e: MouseEvent) {
		active = false;
	}

	function handle_mousemove(e: MouseEvent) {
		if (!active || !box) return;
		px = clamp(e.clientX - offset - box.left, 100, box.width - 240);
		position = round((px + 10) / box.width, 5);
	}

	function clamp(n: number, min: number, max: number) {
		return n < min ? min : n > max ? max : n;
	}

	function round(n: number, points: number) {
		const mod = Math.pow(10, points);
		return Math.round((n + Number.EPSILON) * mod) / mod;
	}

	function set_position() {
		if (!el) return;
		box = el.getBoundingClientRect();
		px = box.width * position - 10;
		hidden = false;
	}

	onMount(set_position);

	$effect(() => {
		// both branches of the original reactive block did the same thing
		show_nav;
		if (!hidden) set_position();
	});
</script>

<svelte:window
	onresize={set_position}
	onmousemove={handle_mousemove}
	onmouseup={handle_mouseup}
/>

<div class="wrap" bind:this={el}>
	{@render children?.()}
	<div
		class="outer hidden sm:block"
		class:disabled
		onmousedown={handle_mousedown}
		onmouseup={handle_mouseup}
		bind:this={inner}
		role="none"
		style="transform: translateX({px}px)"
	>
		<div {hidden} class="inner">
			<div class="notches text-gray-400 select-none">&#124;&#124;</div>
		</div>
	</div>
</div>

<style>
	.wrap {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.outer {
		width: 20px;
		height: 100%;
		position: absolute;
		cursor: grab;
		position: absolute;
		top: 0;
		left: 0;
		cursor: ew-resize;
	}

	.inner {
		width: 15px;
		height: 100%;
		background: #fbfcfc;
		position: absolute;
		left: calc((100% - 2px) / 2);
		border-right: 1px solid rgb(229, 231, 235);
		border-left: 1px solid rgb(229, 231, 235);
	}

	.disabled {
		cursor: auto;
	}

	.disabled .inner {
		box-shadow: none;
	}

	.notches {
		margin: 0;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(1, 2.5);
		font-weight: bold;
	}
</style>
