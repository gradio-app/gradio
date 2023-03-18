<script lang="ts">
	import { getSaliencyColor, getObjectFitSize } from "../utils";
	import { afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let original: string;
	export let interpretation: Array<Array<number>>;
	export let shape: undefined | [number, number];
	export let label: string = "";

	let saliency_layer: HTMLCanvasElement;
	let image: HTMLImageElement;

	const paintSaliency = (
		data: Array<Array<number>>,
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number
	) => {
		var cell_width = width / data[0].length;
		var cell_height = height / data.length;
		var r = 0;
		data.forEach(function (row) {
			var c = 0;
			row.forEach(function (cell) {
				ctx.fillStyle = getSaliencyColor(cell);
				ctx.fillRect(c * cell_width, r * cell_height, cell_width, cell_height);
				c++;
			});
			r++;
		});
	};

	afterUpdate(() => {
		let size = getObjectFitSize(
			true,
			image.width,
			image.height,
			image.naturalWidth,
			image.naturalHeight
		);
		if (shape) {
			size = getObjectFitSize(
				true,
				size.width,
				size.height,
				shape[0],
				shape[1]
			);
		}
		let width = size.width;
		let height = size.height;
		saliency_layer.setAttribute("height", `${height}`);
		saliency_layer.setAttribute("width", `${width}`);
		paintSaliency(
			interpretation,
			saliency_layer.getContext("2d")!,
			width,
			height
		);
	});
</script>

<div class="input-image">
	<BlockTitle>{label}</BlockTitle>
	<div class="image-preview">
		<!-- svelte-ignore a11y-missing-attribute -->
		<div class="interpretation">
			<canvas bind:this={saliency_layer} />
		</div>
		<!-- svelte-ignore a11y-missing-attribute -->
		<img bind:this={image} src={original} />
	</div>
</div>

<style>
	.image-preview {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		background: var(--background-fill-primary);
		width: var(--size-full);
		height: var(--size-60);
	}

	.interpretation {
		display: flex;
		position: absolute;
		top: 0;
		left: 0;
		justify-content: center;
		align-items: center;
		opacity: 0.9;
		transition: 150ms;
		width: var(--size-full);
		height: var(--size-full);
	}

	.interpretation:hover {
		opacity: 0.2;
	}
	img {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}
</style>
