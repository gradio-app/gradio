<script lang="ts">
	import {
		Block,
		BlockLabel,
		Empty,
		IconButtonWrapper,
		FullscreenButton
	} from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import { Gradio } from "@gradio/utils";
	import type { AnnotatedImageProps, AnnotatedImageEvents } from "./types";

	const props = $props();
	const gradio = new Gradio<AnnotatedImageEvents, AnnotatedImageProps>(props);

	let old_value = $state(gradio.props.value);
	let active: string | null = $state(null);
	let image_container: HTMLElement;
	let fullscreen = $state(false);
	let label = $derived(
		gradio.shared.label || gradio.i18n("annotated_image.annotated_image")
	);

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	function handle_mouseover(_label: string): void {
		active = _label;
	}

	function handle_mouseout(): void {
		active = null;
	}

	function handle_click(i: number, value: string): void {
		gradio.dispatch("select", {
			value: value,
			index: i
		});
	}
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	padding={false}
	height={gradio.props.height}
	width={gradio.props.width}
	allow_overflow={false}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	bind:fullscreen
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
	/>
	<BlockLabel show_label={gradio.shared.show_label} Icon={Image} {label} />

	<div class="container">
		{#if gradio.props.value == null}
			<Empty size="large" unpadded_box={true}><Image /></Empty>
		{:else}
			<div class="image-container" bind:this={image_container}>
				<IconButtonWrapper>
					{#if gradio.props.buttons.includes("fullscreen") ?? true}
						<FullscreenButton
							{fullscreen}
							on:fullscreen={({ detail }) => {
								fullscreen = detail;
							}}
						/>
					{/if}
				</IconButtonWrapper>

				<img
					class="base-image"
					class:fit-height={gradio.props.height && !fullscreen}
					src={gradio.props.value ? gradio.props.value.image.url : null}
					alt="the base file that is annotated"
				/>
				{#each gradio.props.value ? gradio.props.value.annotations : [] as ann, i}
					<img
						alt="segmentation mask identifying {gradio.shared
							.label} within the uploaded file"
						class="mask fit-height"
						class:fit-height={!fullscreen}
						class:active={active == ann.label}
						class:inactive={active != ann.label && active != null}
						src={ann.image.url}
						style={gradio.props.color_map && ann.label in gradio.props.color_map
							? null
							: `filter: hue-rotate(${Math.round(
									(i * 360) / (gradio.props.value?.annotations.length ?? 1)
								)}deg);`}
					/>
				{/each}
			</div>
			{#if gradio.props.show_legend && gradio.props.value}
				<div class="legend">
					{#each gradio.props.value.annotations as ann, i}
						<button
							class="legend-item"
							style="background-color: {gradio.props.color_map &&
							ann.label in gradio.props.color_map
								? gradio.props.color_map[ann.label] + '88'
								: `hsla(${Math.round(
										(i * 360) / gradio.props.value.annotations.length
									)}, 100%, 50%, 0.3)`}"
							on:mouseover={() => handle_mouseover(ann.label)}
							on:focus={() => handle_mouseover(ann.label)}
							on:mouseout={() => handle_mouseout()}
							on:blur={() => handle_mouseout()}
							on:click={() => handle_click(i, ann.label)}
						>
							{ann.label}
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
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.mask {
		opacity: 0.85;
		transition: all 0.2s ease-in-out;
		position: absolute;
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
