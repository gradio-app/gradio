<script lang="ts">
	import { getSaliencyColor, getObjectFitSize } from "../utils";
	import { afterUpdate } from "svelte";

	export let original: string;
	export let interpretation: Array<Array<number>>;
	export let shape: undefined | [number, number];

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
	<div
		class="image-preview w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
	>
		<!-- svelte-ignore a11y-missing-attribute -->
		<div
			class="interpretation w-full h-full absolute top-0 left-0 flex justify-center items-center opacity-90 hover:opacity-20 transition"
		>
			<canvas bind:this={saliency_layer} />
		</div>
		<!-- svelte-ignore a11y-missing-attribute -->
		<img
			class="w-full h-full object-contain"
			bind:this={image}
			src={original}
		/>
	</div>
</div>

<style lang="postcss">
</style>
