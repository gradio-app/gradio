<script lang="ts">
	import { Block } from "@gradio/atoms";
	import type { SvelteComponent, ComponentType } from "svelte";
	import { Gradio } from "@gradio/utils";
	import type { DatasetProps, DatasetEvents } from "./types";

	import Dataset from "./Dataset.svelte";

	let props = $props();

	const gradio = new Gradio<DatasetEvents, DatasetProps>(props);

	$inspect("dataset", gradio.shared, gradio.props);
</script>

<Block
	visible={gradio.shared.visible}
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
	container={false}
>
	{#if gradio.shared.show_label}
		<div class="label">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				aria-hidden="true"
				role="img"
				width="1em"
				height="1em"
				preserveAspectRatio="xMidYMid meet"
				viewBox="0 0 32 32"
			>
				<path
					fill="currentColor"
					d="M10 6h18v2H10zm0 18h18v2H10zm0-9h18v2H10zm-6 0h2v2H4zm0-9h2v2H4zm0 18h2v2H4z"
				/>
			</svg>
			{gradio.shared.label}
		</div>
	{/if}

	<Dataset
		onclick={() => gradio.dispatch("click")}
		onselect={(data) => gradio.dispatch("select", data)}
		load_component={gradio.shared.load_component}
		{...gradio.props}
	/>
</Block>

<style>
	.label {
		display: flex;
		align-items: center;
		margin-bottom: var(--size-2);
		color: var(--block-label-text-color);
		font-weight: var(--block-label-text-weight);
		font-size: var(--block-label-text-size);
		line-height: var(--line-sm);
	}

	svg {
		margin-right: var(--size-1);
	}
</style>
