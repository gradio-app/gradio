<svelte:options accessors={true} />

<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";

	const dispatch = createEventDispatcher();

	export let width = 400;
	export let height = 200;
	export let containerHeight = 200;

	let mounted: boolean = false;
	let boxes: Array<Array<number>> = [];
	let boxesChanged: boolean = true;

	let canvasWidth = width;
	let canvasHeight = height;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let canvasContainer: HTMLElement;

	let mousePressing: boolean = false;
	let mouseMoved: boolean = true;
	let prevX: number, prevY: number;
	let curX: number, curY: number;

	let oldWidth = 0;
	let oldHeight = 0;
	let oldContainerHeight = 0;
	let canvasObserver: ResizeObserver;

	$: mounted && clear();

	export function clear() {
		boxes = [];
		boxesChanged = true;
		loop({ once: true });
		return true;
	}

	export function undo() {
		if (boxes.length > 0) {
			boxes.pop();
			boxesChanged = true;
			loop({ once: true });
		}
		return;
	}

	onMount(async () => {
		ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.strokeStyle = "#000";
		}

		canvasObserver = new ResizeObserver(() => {
			handleCanvasResize();
		});
		canvasObserver.observe(canvasContainer);

		loop();
		mounted = true;

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				clear();
			});
		});
	});

	onDestroy(() => {
		mounted = false;
		canvasObserver.unobserve(canvasContainer);
	});

	let getMousePos = (
		e: MouseEvent | TouchEvent | FocusEvent
	): { x: number; y: number } => {
		const rect = canvas.getBoundingClientRect();
		let screenX, screenY: number;

		if (e instanceof MouseEvent) {
			screenX = e.clientX;
			screenY = e.clientY;
		} else if (e instanceof TouchEvent) {
			screenX = e.changedTouches[0].clientX;
			screenY = e.changedTouches[0].clientY;
		} else {
			return {
				x: prevX,
				y: prevY
			};
		}

		let canvasX = screenX - rect.left;
		let canvasY = screenY - rect.top;

		let imageX = (canvasX / rect.width) * width;
		let imageY = (canvasY / rect.height) * height;

		return {
			x: imageX,
			y: imageY
		};
	};

	let handleDrawStart = (e: MouseEvent | TouchEvent) => {
		e.preventDefault();
		mousePressing = true;

		const { x, y } = getMousePos(e);
		prevX = x;
		prevY = y;
	};

	let handleDrawMove = (e: MouseEvent | TouchEvent) => {
		e.preventDefault();

		const { x, y } = getMousePos(e);
		curX = x;
		curY = y;
		mouseMoved = true;
	};

	let handleDrawEnd = (e: MouseEvent | TouchEvent | FocusEvent) => {
		e.preventDefault();

		if (mousePressing) {
			const { x, y } = getMousePos(e);
			boxes.push([
				Math.min(prevX, x),
				Math.min(prevY, y),
				Math.max(prevX, x),
				Math.max(prevY, y)
			]);
			boxesChanged = true;
		}

		mousePressing = false;
	};

	let loop = ({ once = false } = {}) => {
		if (mouseMoved || boxesChanged) {
			if (boxesChanged) {
				dispatch("change", boxes);
			}
			drawCanvas();
			mouseMoved = false;
			boxesChanged = false;
		}
		if (!once) {
			window.requestAnimationFrame(() => {
				loop();
			});
		}
	};

	let drawCanvas = () => {
		if (!ctx) {
			return;
		}

		ctx.clearRect(0, 0, width, height);

		if (mousePressing) {
			let allBoxes = boxes.slice();
			allBoxes.push([prevX, prevY, curX, curY]);
			drawBoxes(allBoxes);
		} else {
			drawBoxes(boxes);
		}
	};

	let drawBoxes = (boxes: Array<Array<number>>) => {
		if (!ctx) {
			return;
		}

		ctx.beginPath();
		boxes.forEach((box: Array<number>) => {
			if (box.length !== 4) {
				throw Error(`invalid box: ${box}`);
			}
			ctx?.rect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
		});
		ctx.stroke();
	};

	let handleCanvasResize = async () => {
		if (
			width === oldWidth &&
			height === oldHeight &&
			containerHeight === oldContainerHeight
		) {
			return;
		}

		const dimensions = { width: width, height: height };
		const containerDimensions = {
			width: containerHeight * (dimensions.width / dimensions.height),
			height: containerHeight
		};

		await setCanvasSize(dimensions, containerDimensions);

		loop({ once: true });
		setTimeout(() => {
			oldHeight = height;
			oldWidth = width;
			oldContainerHeight = containerHeight;
		}, 100);

		clear();
	};

	let setCanvasSize = async (
		dimensions: { width: number; height: number },
		containerDimensions: { width: number; height: number }
	) => {
		if (!mounted) return;
		await tick();

		const dpr = window.devicePixelRatio || 1;
		canvas.width = dimensions.width * dpr;
		canvas.height = dimensions.height * dpr;

		if (ctx) {
			ctx.scale(dpr, dpr);
			ctx.lineWidth = canvas.width / containerDimensions.width;
		}

		canvas.style.width = `${containerDimensions.width}px`;
		canvas.style.height = `${containerDimensions.height}px`;
	};

	$: {
		if (width || height) {
			handleCanvasResize();
		}
	}
</script>

<div
	class="wrap"
	bind:this={canvasContainer}
	bind:offsetWidth={canvasWidth}
	bind:offsetHeight={canvasHeight}
>
	<canvas
		bind:this={canvas}
		on:mousedown={handleDrawStart}
		on:mousemove={handleDrawMove}
		on:mouseup={handleDrawEnd}
		on:mouseout={handleDrawEnd}
		on:touchstart={handleDrawStart}
		on:touchmove={handleDrawMove}
		on:touchend={handleDrawEnd}
		on:touchcancel={handleDrawEnd}
		on:blur={handleDrawEnd}
		on:click|stopPropagation
		style=" z-index: 15"
	/>
</div>

<style>
	canvas {
		display: block;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		margin: auto;
	}

	.wrap {
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
		touch-action: none;
	}
</style>
