<script context="module" lang="ts">
</script>

<script lang="ts">
	import { onMount, tick } from "svelte";
	import { drag } from "d3-drag";
	import { select } from "d3-selection";
	import { clamp } from "./utils";
	import Arrow from "./ArrowIcon.svelte";

	export let position = 0.5;
	export let disabled = false;
	export let slider_color = "var(--border-color-primary)";

	export let el: HTMLDivElement;
	export let parent_el: HTMLDivElement;

	let inner: HTMLDivElement;
	let box: DOMRect;
	let px = 0;
	let active = false;

	function set_position(): void {
		box = el.getBoundingClientRect();
		px = clamp(box.width * position - 10, 0, box.width - 20);
	}
	function round(n: number, points: number): number {
		const mod = Math.pow(10, points);
		return Math.round((n + Number.EPSILON) * mod) / mod;
	}
	function update_position(x: number): void {
		px = x - 10;
		position = round(x / box.width, 5);
	}

	function dragstarted(event: any): void {
		if (disabled) return;
		active = true;
		update_position(event.x);
	}

	function dragged(event: any): void {
		if (disabled) return;
		update_position(event.x);
	}

	function dragended(): void {
		if (disabled) return;
		active = false;
	}

	onMount(() => {
		set_position();
		const drag_handler = drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended);
		select(inner).call(drag_handler);
	});
</script>

<svelte:window on:resize={set_position} />

<div class="wrap" role="none" bind:this={parent_el}>
	<div class="content" bind:this={el}>
		<slot />
	</div>
	<div
		class="outer"
		class:disabled
		bind:this={inner}
		role="none"
		style="transform: translateX({px}px)"
	>
		<span class="icon-wrap" class:active class:disabled><Arrow /></span>
		<div class="inner" style:--color={slider_color}></div>
		<span class="icon-wrap right" class:active class:disabled><Arrow /></span>
	</div>
</div>

<style>
	.wrap {
		position: relative;
		width: 100%;
		height: 100%;
		z-index: var(--layer-2);
		overflow: hidden;
	}

	.icon-wrap {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: -40px;
		width: 32px;
		transition: 0.2s;
		color: var(--body-text-color);
	}

	.icon-wrap.right {
		left: 60px;
		transform: translateY(-50%) translateX(-100%) rotate(180deg);
	}

	.icon-wrap.active {
		opacity: 0;
	}

	.icon-wrap.disabled {
		opacity: 0;
	}

	.outer {
		width: 20px;
		height: 100%;
		position: absolute;
		cursor: grab;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: auto;
	}

	.inner {
		/* box-shadow: -1px 0px 6px 1px rgba(0, 0, 0, 0.2); */
		width: 1px;
		height: 100%;
		background: var(--color);
		position: absolute;
		left: calc((100% - 2px) / 2);
	}

	.disabled {
		cursor: auto;
	}

	.disabled .inner {
		box-shadow: none;
	}

	.content {
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
	}
</style>
