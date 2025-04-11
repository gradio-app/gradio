<script context="module" lang="ts">
	export interface ZoomState {
		scale: number;
		zoom_position: { x: number; y: number };
		touchDistance?: number;
		translationPercent: { x: number; y: number };
		translation: { x: number; y: number };
		overflow: { left: number; right: number };
	}
</script>

<script lang="ts">
	import { onMount, tick } from "svelte";
	import { drag } from "d3-drag";
	import { select } from "d3-selection";
	import { clamp } from "./utils";
	import Arrow from "./ArrowIcon.svelte";
	import { spring } from "svelte/motion";

	export let position = 0.5;
	export let disabled = false;
	export let slider_color = "var(--border-color-primary)";
	export let img: HTMLImageElement;
	export let update_transform: (
		opts: ZoomState & {
			translationPercent: { x: number; y: number };
		},
	) => void;
	export let update_scale: (opts: {
		x: number;
		y: number;
		scale: number;
	}) => void;

	let el: HTMLDivElement;
	let outer: HTMLDivElement;
	let inner: HTMLDivElement;
	let box: DOMRect;
	let px = 0;
	let active = false;

	let state: ZoomState = {
		scale: 1,
		zoom_position: { x: 50, y: 50 },
		touchDistance: undefined,
		translationPercent: { x: 0, y: 0 },
		translation: { x: 0, y: 0 },
		overflow: { left: 0, right: 0 },
	};

	let isPanning = false;
	let startX: number;
	let startY: number;
	let container_bounds: DOMRect;
	let image_bounds: DOMRect;

	let panPosition = spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.4 });

	$: {
		if (el) {
		}
	}

	function handle_wheel(e: WheelEvent): void {
		e.preventDefault();
		if (!img) return;

		container_bounds = el.getBoundingClientRect();
		image_bounds = img.getBoundingClientRect();

		// Get mouse coordinates relative to container
		const mouseX = e.clientX - container_bounds.left;
		const mouseY = e.clientY - container_bounds.top;

		// Calculate mouse position as percentages of container for zoom_position
		const mouseXPercent = (mouseX / container_bounds.width) * 100;
		const mouseYPercent = (mouseY / container_bounds.height) * 100;

		// Calculate scale change
		const delta = e.deltaY * -0.01;
		const oldScale = state.scale;
		const newScale = Math.min(Math.max(1, state.scale + delta), 4);

		if (newScale !== state.scale) {
			// Update zoom position to mouse position
			state.zoom_position = { x: mouseXPercent, y: mouseYPercent };

			// Get current image position and size
			const currentX = $panPosition.x;
			const currentY = $panPosition.y;

			// Calculate mouse position relative to the image
			// This is the point we want to keep fixed under the mouse
			const mouseXRelativeToImage = mouseX - currentX;
			const mouseYRelativeToImage = mouseY - currentY;

			// Calculate where that point would be after scaling
			const scaleRatio = newScale / oldScale;

			// The new position needs to keep the mouse point fixed
			// If we scale by 2x, a point 100px from the corner becomes 200px from the corner
			// So we need to adjust our position to compensate
			const newX = mouseX - mouseXRelativeToImage * scaleRatio;
			const newY = mouseY - mouseYRelativeToImage * scaleRatio;

			state.scale = newScale;

			// Apply constraints to keep the image within bounds
			applyConstraints(newX, newY, newScale);

			// Reset pan position when zooming out completely
			if (newScale === 1) {
				panPosition.set({ x: 0, y: 0 });
			}
		}
	}

	function applyConstraints(panX: number, panY: number, scale: number): void {
		if (!img) return;

		container_bounds = el.getBoundingClientRect();
		image_bounds = img.getBoundingClientRect();

		const scaledWidth = image_bounds.width * scale;
		const scaledHeight = image_bounds.height * scale;

		let constrainedX = panX;
		let constrainedY = panY;

		if (scaledWidth <= container_bounds.width) {
			constrainedX = (container_bounds.width - scaledWidth) / 2;
		} else {
			const minX = container_bounds.width - scaledWidth;
			const maxX = 0;
			constrainedX = Math.max(minX, Math.min(maxX, constrainedX));
		}

		if (scaledHeight <= container_bounds.height) {
			constrainedY = (container_bounds.height - scaledHeight) / 2;
		} else {
			const minY = container_bounds.height - scaledHeight;
			const maxY = 0;
			constrainedY = Math.max(minY, Math.min(maxY, constrainedY));
		}

		panPosition.set({ x: constrainedX, y: constrainedY });

		const overflow = {
			left: Math.max(0, -constrainedX / scaledWidth),
			right: Math.max(
				0,
				(constrainedX + scaledWidth - container_bounds.width) / scaledWidth,
			),
		};

		_update_transform(constrainedX, constrainedY, scale, overflow);
	}

	function handle_touch(event: TouchEvent): void {
		if (event.touches.length !== 2) return;
		event.preventDefault();
		if (!img) return;

		container_bounds = el.getBoundingClientRect();
		const touch1 = event.touches[0];
		const touch2 = event.touches[1];

		// Calculate midpoint between the two touches relative to container
		const midX = (touch1.clientX + touch2.clientX) / 2 - container_bounds.left;
		const midY = (touch1.clientY + touch2.clientY) / 2 - container_bounds.top;

		// Calculate distance between touches for pinch zoom
		const distance = Math.hypot(
			touch2.clientX - touch1.clientX,
			touch2.clientY - touch1.clientY,
		);

		if (typeof state.touchDistance === "undefined") {
			state.touchDistance = distance;
			return;
		}

		// Calculate scale change from pinch
		const delta = (distance - state.touchDistance) * 0.01;
		state.touchDistance = distance;

		const oldScale = state.scale;
		const newScale = Math.min(Math.max(1, state.scale + delta), 4);

		if (newScale !== state.scale) {
			// Update zoom position to touch midpoint position
			const midXPercent = (midX / container_bounds.width) * 100;
			const midYPercent = (midY / container_bounds.height) * 100;
			state.zoom_position = { x: midXPercent, y: midYPercent };

			// Get current image position
			const currentX = $panPosition.x;
			const currentY = $panPosition.y;

			// Calculate midpoint relative to the image
			// This is the point we want to keep fixed under the midpoint
			const midXRelativeToImage = midX - currentX;
			const midYRelativeToImage = midY - currentY;

			// Calculate where that point would be after scaling
			const scaleRatio = newScale / oldScale;

			// The new position needs to keep the midpoint fixed
			const newX = midX - midXRelativeToImage * scaleRatio;
			const newY = midY - midYRelativeToImage * scaleRatio;

			state.scale = newScale;

			applyConstraints(newX, newY, newScale);
		}
	}

	function updateScale(): void {
		if (img && state.scale) {
			update_scale({
				x: state.zoom_position.x,
				y: state.zoom_position.y,
				scale: state.scale,
			});
		}
	}

	function _update_transform(
		panX: number,
		panY: number,
		scale: number,
		overflow: { left: number; right: number },
	): void {
		state = {
			...state,
			scale,
			// Don't override zoom_position here - it's set during wheel/touch events
			translation: { x: panX, y: panY },
			overflow,
		};

		updateScale();

		update_transform({
			...state,
			translationPercent: { x: panX, y: panY },
		});
	}

	function handle_touch_end(): void {
		state.touchDistance = undefined;
	}

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

	function handlePanStart(event: MouseEvent | TouchEvent): void {
		if (state.scale <= 1 || !img) return;
		event.preventDefault();

		container_bounds = el.getBoundingClientRect();
		isPanning = true;
		startX = "touches" in event ? event.touches[0].clientX : event.clientX;
		startY = "touches" in event ? event.touches[0].clientY : event.clientY;
	}

	function handlePanMove(event: MouseEvent | TouchEvent): void {
		if (!isPanning || !img) return;

		const currentX =
			"touches" in event ? event.touches[0].clientX : event.clientX;
		const currentY =
			"touches" in event ? event.touches[0].clientY : event.clientY;

		const deltaX = currentX - startX;
		const deltaY = currentY - startY;

		applyConstraints(
			$panPosition.x + deltaX,
			$panPosition.y + deltaY,
			state.scale,
		);

		startX = currentX;
		startY = currentY;
	}

	function handlePanEnd(): void {
		isPanning = false;
	}

	$: {
		if ($panPosition && img) {
			container_bounds = el?.getBoundingClientRect();
			if (container_bounds) {
				const overflow = {
					left: 0,
					right: 0,
				};

				if (img.width * state.scale > container_bounds.width) {
					overflow.left = Math.max(
						0,
						-$panPosition.x / (img.width * state.scale),
					);
					overflow.right = Math.max(
						0,
						($panPosition.x +
							img.width * state.scale -
							container_bounds.width) /
							(img.width * state.scale),
					);
				}

				update_transform({
					...state,
					translation: { x: $panPosition.x, y: $panPosition.y },
					overflow,
					translationPercent: { x: $panPosition.x, y: $panPosition.y },
				});
			}
		}
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

<div
	class="wrap"
	bind:this={el}
	role="none"
	on:wheel={handle_wheel}
	on:touchmove={handle_touch}
	on:touchend={handle_touch_end}
	on:touchcancel={handle_touch_end}
	on:mousedown={handlePanStart}
	on:mousemove={handlePanMove}
	on:mouseup={handlePanEnd}
	on:mouseleave={handlePanEnd}
	on:touchstart={handlePanStart}
	on:touchmove={handlePanMove}
	on:touchend={handlePanEnd}
>
	<div class="content">
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
		z-index: 100;
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
		/* remove the transition property */
	}
</style>
