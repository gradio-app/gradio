<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { FileData, normalise_file } from "@gradio/upload";
	import type { SelectData } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: [FileData, Array<[FileData, string]>] | null;
	let old_value: [FileData, Array<[FileData, string]>] | null;
	let _value: [FileData, Array<[FileData, string]>] | null;
	export let label: string = "Annotated Image";
	export let show_label: boolean = true;
	export let show_legend: boolean = true;
	export let style: Styles = {};
	export let root: string;
	export let root_url: string;
	let active: string | null = null;

	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	$: {
		if (value !== old_value) {
			old_value = value;
			dispatch("change");
		}
		if (value) {
			_value = [
				normalise_file(value[0], root, root_url) as FileData,
				value[1].map(([file, label]) => [
					normalise_file(file, root, root_url) as FileData,
					label
				])
			];
		} else {
			_value = null;
		}
	}
	function handle_mouseover(label: string) {
		active = label;
	}
	function handle_mouseout() {
		active = null;
	}
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	padding={false}
	style={{
		height: style.height,
		width: style.width
	}}
	allow_overflow={false}
>
	<StatusTracker {...loading_status} />
	<BlockLabel {show_label} Icon={Image} label={label || "Image"} />

	<div class="container">
		{#if _value == null}
			<Empty size="large" unpadded_box={true}><Image /></Empty>
		{:else}
			<div class="image-container">
				<!-- svelte-ignore a11y-missing-attribute -->
				<img
					class="base-image"
					class:fit-height={style.height}
					src={_value ? _value[0].data : null}
				/>
				{#each _value ? _value[1] : [] as [file, label], i}
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						class="mask fit-height"
						class:active={active == label}
						class:inactive={active != label && active != null}
						src={file.data}
						style={style.color_map && label in style.color_map
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
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							class="legend-item"
							style="background-color: {style.color_map &&
							label in style.color_map
								? style.color_map[label] + '88'
								: `hsla(${Math.round(
										(i * 360) / _value[1].length
								  )}, 100%, 50%, 0.3)`}"
							on:mouseover={() => handle_mouseover(label)}
							on:focus={() => handle_mouseover(label)}
							on:mouseout={() => handle_mouseout()}
							on:blur={() => handle_mouseout()}
							on:click={() => dispatch("select", { index: i, value: label })}
						>
							{label}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</Block>

<style>
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
