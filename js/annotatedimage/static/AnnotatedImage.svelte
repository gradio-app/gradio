<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";

	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { type FileData, normalise_file } from "@gradio/upload";
	import { _ } from "svelte-i18n";
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [FileData, [FileData, string][]] | null;
	let old_value: [FileData, [FileData, string][]] | null;
	let _value: [FileData, [FileData, string][]] | null;
	export let label = $_("annotated_image.annotated_image");
	export let show_label = true;
	export let show_legend = true;
	export let height: number | undefined;
	export let width: number | undefined;
	export let color_map: Record<string, string>;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let root: string;
	export let root_url: string;
	let active: string | null = null;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: undefined;
		select: SelectData;
	}>;

	$: {
		if (value !== old_value) {
			old_value = value;
			gradio.dispatch("change");
		}
		if (value) {
			_value = [
				normalise_file(value[0], root, root_url) as FileData,
				value[1].map(([file, _label]) => [
					normalise_file(file, root, root_url) as FileData,
					_label,
				]),
			];
		} else {
			_value = null;
		}
	}
	function handle_mouseover(_label: string): void {
		active = _label;
	}
	function handle_mouseout(): void {
		active = null;
	}

	function handle_click(i: number): void {
		gradio.dispatch("select", {
			value: label,
			index: i,
		});
	}
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	padding={false}
	{height}
	{width}
	allow_overflow={false}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker {...loading_status} />
	<BlockLabel {show_label} Icon={Image} label={label || $_("image.image")} />

	<div class="container">
		{#if _value == null}
			<Empty size="large" unpadded_box={true}><Image /></Empty>
		{:else}
			<div class="image-container">
				<img
					class="base-image"
					class:fit-height={height}
					src={_value ? _value[0].data : null}
					alt="uploaded file"
				/>
				{#each _value ? _value[1] : [] as [file, label], i}
					<img
						alt="segmentation mask identifying {label} within the uploaded file"
						class="mask fit-height"
						class:active={active == label}
						class:inactive={active != label && active != null}
						src={file.data}
						style={color_map && label in color_map
							? null
							: `filter: hue-rotate(${Math.round(
									(i * 360) / _value[1].length
							  )}deg);`}
					/>
				{/each}
			</div>
			{#if show_legend && _value}
				<div class="legend">
					{#each _value[1] as [_, label], i}
						<button
							class="legend-item"
							style="background-color: {color_map && label in color_map
								? color_map[label] + '88'
								: `hsla(${Math.round(
										(i * 360) / _value[1].length
								  )}, 100%, 50%, 0.3)`}"
							on:mouseover={() => handle_mouseover(label)}
							on:focus={() => handle_mouseover(label)}
							on:mouseout={() => handle_mouseout()}
							on:blur={() => handle_mouseout()}
							on:click={() => handle_click(i)}
						>
							{label}
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</Block>

<style>
	.base-image {
		display: block;
		width: 100%;
		height: auto;
	}
	.container {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
	}
	.image-container {
		position: relative;
		top: 0;
		left: 0;
		flex-grow: 1;
		width: 100%;
		overflow: hidden;
	}
	.fit-height {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.mask {
		opacity: 0.85;
		transition: all 0.2s ease-in-out;
	}
	.image-container:hover .mask {
		opacity: 0.3;
	}
	.mask.active {
		opacity: 1;
	}
	.mask.inactive {
		opacity: 0;
	}
	.legend {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
	}
	.legend-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		cursor: pointer;
		border-radius: var(--radius-sm);
		padding: var(--spacing-sm);
	}
</style>
