<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Brush, Erase, Trash, Undo, Redo } from "@gradio/icons";

	interface Props {
		width?: number;
		height?: number;
		brush_color?: string;
		brush_size?: number;
		active?: boolean;
	}

	let {
		width = 0,
		height = 0,
		brush_color = "rgba(255, 0, 0, 0.5)",
		brush_size = $bindable(20),
		active = false
	}: Props = $props();

	const MAX_HISTORY = 20;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let drawing = false;
	let tool: "brush" | "eraser" = $state("brush");
	let last_x = 0;
	let last_y = 0;
	let undo_stack: ImageData[] = $state([]);
	let redo_stack: ImageData[] = $state([]);

	$effect(() => {
		ctx = canvas.getContext("2d");
	});

	function snapshot(): ImageData | null {
		if (!ctx || canvas.width === 0 || canvas.height === 0) return null;
		return ctx.getImageData(0, 0, canvas.width, canvas.height);
	}

	function push_undo(): void {
		const snap = snapshot();
		if (!snap) return;
		undo_stack.push(snap);
		if (undo_stack.length > MAX_HISTORY) undo_stack.shift();
		redo_stack = [];
	}

	function restore(img: ImageData): void {
		if (!ctx) return;
		ctx.globalCompositeOperation = "source-over";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.putImageData(img, 0, 0);
	}

	function get_pos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const client = e instanceof TouchEvent ? e.touches[0] : e;
		return {
			x: (client.clientX - rect.left) * scaleX,
			y: (client.clientY - rect.top) * scaleY
		};
	}

	function configure_stroke(): void {
		if (!ctx) return;
		ctx.globalCompositeOperation =
			tool === "eraser" ? "destination-out" : "source-over";
		ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : brush_color;
		ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : brush_color;
		ctx.lineWidth = brush_size;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
	}

	function start(e: MouseEvent | TouchEvent): void {
		if (!active || !ctx) return;
		e.preventDefault();
		push_undo();
		drawing = true;
		const { x, y } = get_pos(e);
		last_x = x;
		last_y = y;
		configure_stroke();
		ctx.beginPath();
		ctx.arc(x, y, brush_size / 2, 0, Math.PI * 2);
		ctx.fill();
	}

	function move(e: MouseEvent | TouchEvent): void {
		if (!drawing || !ctx) return;
		e.preventDefault();
		const { x, y } = get_pos(e);
		configure_stroke();
		ctx.beginPath();
		ctx.moveTo(last_x, last_y);
		ctx.lineTo(x, y);
		ctx.stroke();
		last_x = x;
		last_y = y;
	}

	function stop(): void {
		drawing = false;
	}

	export function clear(): void {
		if (!ctx) return;
		push_undo();
		ctx.globalCompositeOperation = "source-over";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	export function undo(): void {
		const prev = undo_stack.pop();
		if (!prev) return;
		const current = snapshot();
		if (current) redo_stack.push(current);
		restore(prev);
	}

	export function redo(): void {
		const next = redo_stack.pop();
		if (!next) return;
		const current = snapshot();
		if (current) undo_stack.push(current);
		restore(next);
	}

	export function get_blob(): Promise<Blob | null> {
		return new Promise((resolve) => {
			canvas.toBlob((blob) => resolve(blob), "image/png");
		});
	}

	export function is_empty(): boolean {
		if (!ctx || canvas.width === 0 || canvas.height === 0) return true;
		const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
		for (let i = 3; i < data.length; i += 4) {
			if (data[i] > 0) return false;
		}
		return true;
	}
</script>

<div class="mask-wrapper" class:active>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<canvas
		bind:this={canvas}
		{width}
		{height}
		class="mask-canvas"
		style="cursor: {active ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default'}"
		onmousedown={start}
		onmousemove={move}
		onmouseup={stop}
		onmouseleave={stop}
		ontouchstart={start}
		ontouchmove={move}
		ontouchend={stop}
	></canvas>

	{#if active}
		<div class="toolbar">
			<IconButton
				Icon={Brush}
				label="Brush"
				highlight={tool === "brush"}
				onclick={() => (tool = "brush")}
			/>
			<IconButton
				Icon={Erase}
				label="Eraser"
				highlight={tool === "eraser"}
				onclick={() => (tool = "eraser")}
			/>
			<input
				type="range"
				min="4"
				max="80"
				bind:value={brush_size}
				aria-label="Brush size"
			/>
			<IconButton
				Icon={Undo}
				label="Undo"
				disabled={undo_stack.length === 0}
				onclick={undo}
			/>
			<IconButton
				Icon={Redo}
				label="Redo"
				disabled={redo_stack.length === 0}
				onclick={redo}
			/>
			<IconButton Icon={Trash} label="Clear" onclick={clear} />
		</div>
	{/if}
</div>

<style>
	.mask-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.mask-wrapper.active {
		pointer-events: all;
	}
	.mask-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.mask-wrapper.active .mask-canvas {
		pointer-events: auto;
	}
	.toolbar {
		position: absolute;
		bottom: var(--size-4);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--size-1);
		background: var(--block-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		padding: var(--size-1) var(--size-2);
		box-shadow: var(--shadow-drop);
		z-index: var(--layer-top);
	}
	input[type="range"] {
		width: var(--size-20);
	}
</style>
