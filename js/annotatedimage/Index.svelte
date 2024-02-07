<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";

	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { type FileData } from "@gradio/client";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: {
		image: FileData;
		annotations: { image: FileData; label: string }[] | [];
	} | null = null;
	let old_value: {
		image: FileData;
		annotations: { image: FileData; label: string }[] | [];
	} | null = null;
	let _value: {
		image: FileData;
		annotations: { image: FileData; label: string }[];
	} | null = null;
	export let gradio: Gradio<{
		change: undefined;
		select: SelectData;
	}>;
	export let label = gradio.i18n("annotated_image.annotated_image");
	export let show_label = true;
	export let show_legend = true;
	export let height: number | undefined;
	export let width: number | undefined;
	export let color_map: Record<string, string>;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	let active: string | null = null;
	export let loading_status: LoadingStatus;

	// `value` can be updated before the Promises from `resolve_wasm_src` are resolved.
	// In such a case, the resolved values for the old `value` have to be discarded,
	// This variable `latest_promise` is used to pick up only the values resolved for the latest `value`.
	let latest_promise: Promise<unknown> | null = null;
	$: {
		if (value !== old_value) {
			old_value = value;
			gradio.dispatch("change");
		}
		if (value) {
			const normalized_value = {
				image: value.image as FileData,
				annotations: value.annotations.map((ann) => ({
					image: ann.image as FileData,
					label: ann.label
				}))
			};
			_value = normalized_value;

			// In normal (non-Wasm) Gradio, the `<img>` element should be rendered with the passed values immediately
			// without waiting for `resolve_wasm_src()` to resolve.
			// If it waits, a blank image is displayed until the async task finishes
			// and it leads to undesirable flickering.
			// So set `_value` immediately above, and update it with the resolved values below later.
			const image_url_promise = resolve_wasm_src(normalized_value.image.url);
			const annotation_urls_promise = Promise.all(
				normalized_value.annotations.map((ann) =>
					resolve_wasm_src(ann.image.url)
				)
			);
			const current_promise = Promise.all([
				image_url_promise,
				annotation_urls_promise
			]);
			latest_promise = current_promise;
			current_promise.then(([image_url, annotation_urls]) => {
				if (latest_promise !== current_promise) {
					return;
				}
				const async_resolved_value: typeof _value = {
					image: {
						...normalized_value.image,
						url: image_url ?? undefined
					},
					annotations: normalized_value.annotations.map((ann, i) => ({
						...ann,
						image: {
							...ann.image,
							url: annotation_urls[i] ?? undefined
						}
					}))
				};
				_value = async_resolved_value;
			});
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

	function handle_click(i: number, value: string): void {
		gradio.dispatch("select", {
			value: label,
			index: i
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
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>
	<BlockLabel
		{show_label}
		Icon={Image}
		label={label || gradio.i18n("image.image")}
	/>

	<div class="container">
		{#if _value == null}
			<Empty size="large" unpadded_box={true}><Image /></Empty>
		{:else}
			<div class="image-container">
				<img
					class="base-image"
					class:fit-height={height}
					src={_value ? _value.image.url : null}
					alt="the base file that is annotated"
				/>
				{#each _value ? _value?.annotations : [] as ann, i}
					<img
						alt="segmentation mask identifying {label} within the uploaded file"
						class="mask fit-height"
						class:active={active == ann.label}
						class:inactive={active != ann.label && active != null}
						src={ann.image.url}
						style={color_map && ann.label in color_map
							? null
							: `filter: hue-rotate(${Math.round(
									(i * 360) / _value?.annotations.length
							  )}deg);`}
					/>
				{/each}
			</div>
			{#if show_legend && _value}
				<div class="legend">
					{#each _value.annotations as ann, i}
						<button
							class="legend-item"
							style="background-color: {color_map && ann.label in color_map
								? color_map[ann.label] + '88'
								: `hsla(${Math.round(
										(i * 360) / _value.annotations.length
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
