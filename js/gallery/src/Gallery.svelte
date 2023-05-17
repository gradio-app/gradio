<script lang="ts">
	import { BlockLabel, Empty } from "@gradio/atoms";
	import { ModifyUpload } from "@gradio/upload";
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import { tick } from "svelte";

	import type { Styles } from "@gradio/utils";
	import { get_styles } from "@gradio/utils";
	import { Image } from "@gradio/icons";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";

	export let show_label: boolean = true;
	export let label: string;
	export let root: string = "";
	export let root_url: null | string = null;
	export let value: Array<string> | Array<FileData> | null = null;
	export let style: Styles = {
		grid_cols: [2],
		object_fit: "cover",
		height: "auto"
	};

	const dispatch = createEventDispatcher<{
		select: SelectData;
	}>();

	// tracks whether the value of the gallery was reset
	let was_reset: boolean = true;

	$: was_reset = value == null || value.length == 0 ? true : was_reset;

	$: _value =
		value === null
			? null
			: value.map((img) =>
					Array.isArray(img)
						? [normalise_file(img[0], root, root_url), img[1]]
						: [normalise_file(img, root, root_url), null]
			  );

	let prevValue: string[] | FileData[] | null = value;
	let selected_image: number | null = null;
	let old_selected_image: number | null = null;

	$: if (prevValue !== value) {
		// When value is falsy (clear button or first load),
		// style.preview determines the selected image
		if (was_reset) {
			selected_image = style.preview && value?.length ? 0 : null;
			was_reset = false;
			// Otherwise we keep the selected_image the same if the
			// gallery has at least as many elements as it did before
		} else {
			selected_image =
				selected_image !== null &&
				value !== null &&
				selected_image < value.length
					? selected_image
					: null;
		}
		prevValue = value;
	}

	$: previous =
		((selected_image ?? 0) + (_value?.length ?? 0) - 1) % (_value?.length ?? 0);
	$: next = ((selected_image ?? 0) + 1) % (_value?.length ?? 0);

	function on_keydown(e: KeyboardEvent) {
		switch (e.code) {
			case "Escape":
				e.preventDefault();
				selected_image = null;
				break;
			case "ArrowLeft":
				e.preventDefault();
				selected_image = previous;
				break;
			case "ArrowRight":
				e.preventDefault();
				selected_image = next;
				break;
			default:
				break;
		}
	}

	$: {
		if (selected_image !== old_selected_image) {
			old_selected_image = selected_image;
			if (selected_image !== null) {
				dispatch("select", {
					index: selected_image,
					value: _value?.[selected_image][1]
				});
			}
		}
	}

	$: scroll_to_img(selected_image);

	let el: Array<HTMLButtonElement> = [];
	let container: HTMLDivElement;

	async function scroll_to_img(index: number | null) {
		if (typeof index !== "number") return;
		await tick();

		el[index].focus();

		const { left: container_left, width: container_width } =
			container.getBoundingClientRect();
		const { left, width } = el[index].getBoundingClientRect();

		const relative_left = left - container_left;

		const pos =
			relative_left + width / 2 - container_width / 2 + container.scrollLeft;

		container.scrollTo({
			left: pos < 0 ? 0 : pos,
			behavior: "smooth"
		});
	}

	$: can_zoom = window_height >= height;

	function add_height_to_styles(style: Styles): string {
		styles = get_styles(style, ["grid_cols", "grid_rows", "object_fit"]).styles;
		return styles + ` height: ${style.height}`;
	}

	$: styles = add_height_to_styles(style);

	let height = 0;
	let window_height = 0;
</script>

<svelte:window bind:innerHeight={window_height} />

{#if show_label}
	<BlockLabel
		{show_label}
		Icon={Image}
		label={label || "Gallery"}
		disable={typeof style.container === "boolean" && !style.container}
	/>
{/if}
{#if value === null || _value === null || _value.length === 0}
	<Empty size="large" unpadded_box={true}><Image /></Empty>
{:else}
	{#if selected_image !== null}
		<div
			on:keydown={on_keydown}
			class="preview"
			class:fixed-height={style.height !== "auto"}
		>
			<ModifyUpload on:clear={() => (selected_image = null)} />

			<img
				on:click={() => (selected_image = next)}
				src={_value[selected_image][0].data}
				alt={_value[selected_image][1] || ""}
				title={_value[selected_image][1] || null}
				class:with-caption={!!_value[selected_image][1]}
				style="height: calc(100% - {_value[selected_image][1]
					? '80px'
					: '60px'})"
			/>
			{#if _value[selected_image][1]}
				<div class="caption">
					{_value[selected_image][1]}
				</div>
			{/if}
			<div bind:this={container} class="thumbnails scroll-hide">
				{#each _value as image, i}
					<button
						bind:this={el[i]}
						on:click={() => (selected_image = i)}
						class="thumbnail-item thumbnail-small"
						class:selected={selected_image === i}
					>
						<img
							src={image[0].data}
							title={image[1] || null}
							alt={image[1] || null}
						/>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div
		bind:clientHeight={height}
		class="grid-wrap"
		class:fixed-height={!style.height || style.height == "auto"}
	>
		<div class="grid-container" style={styles} class:pt-6={show_label}>
			{#each _value as [image, caption], i}
				<button
					class="thumbnail-item thumbnail-lg"
					class:selected={selected_image === i}
					on:click={() => (selected_image = can_zoom ? i : selected_image)}
				>
					<img
						alt={caption || ""}
						src={typeof image === "string" ? image : image.data}
					/>
					{#if caption}
						<div class="caption-label">
							{caption}
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style lang="postcss">
	.preview {
		display: flex;
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		flex-direction: column;
		z-index: var(--layer-2);
		backdrop-filter: blur(8px);
		background: var(--background-fill-primary);
		height: var(--size-full);
	}

	.fixed-height {
		min-height: var(--size-80);
		max-height: 55vh;
	}

	@media (--screen-xl) {
		.fixed-height {
			min-height: 450px;
		}
	}

	.preview img {
		width: var(--size-full);
		height: calc(var(--size-full) - 60px);
		object-fit: contain;
	}

	.preview img.with-caption {
		height: calc(var(--size-full) - 80px);
	}

	.caption {
		padding: var(--size-2) var(--size-3);
		overflow: hidden;
		color: var(--block-label-text-color);
		font-weight: var(--weight-semibold);
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.thumbnails {
		display: flex;
		position: absolute;
		bottom: 0;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-lg);
		width: var(--size-full);
		height: var(--size-14);
		overflow-x: scroll;
	}

	.thumbnail-item {
		--ring-color: transparent;
		position: relative;
		outline: none;
		box-shadow: 0 0 0 2px var(--ring-color), var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--button-small-radius);
		background: var(--background-fill-secondary);
		aspect-ratio: var(--ratio-square);
		width: var(--size-full);
		height: var(--size-full);
		overflow: clip;
	}

	.thumbnail-item:hover {
		--ring-color: var(--border-color-accent);
		filter: brightness(1.1);
		border-color: var(--border-color-accent);
	}

	.thumbnail-small {
		flex: none;
		transform: scale(0.9);
		transition: 0.075s;
		width: var(--size-9);
		height: var(--size-9);
	}

	.thumbnail-small.selected {
		--ring-color: var(--color-accent);
		transform: scale(1);
		border-color: var(--color-accent);
	}

	.thumbnail-small > img {
		width: var(--size-full);
		height: var(--size-full);
		overflow: hidden;
		object-fit: var(--object-fit);
	}

	.grid-wrap {
		padding: var(--size-2);
		height: var(--size-full);
		overflow-y: auto;
	}

	.grid-container {
		display: grid;
		grid-template-rows: var(--grid-rows);
		grid-template-columns: var(--grid-cols);
		gap: var(--spacing-lg);
	}
	@media (--screen-sm) {
		.grid-container {
			grid-template-columns: var(--sm-grid-cols);
		}
	}
	@media (--screen-md) {
		.grid-container {
			grid-template-columns: var(--md-grid-cols);
		}
	}
	@media (--screen-lg) {
		.grid-container {
			grid-template-columns: var(--lg-grid-cols);
		}
	}
	@media (--screen-xl) {
		.grid-container {
			grid-template-columns: var(--xl-grid-cols);
		}
	}
	@media (--screen-xxl) {
		.grid-container {
			grid-template-columns: var(--2xl-grid-cols);
		}
	}

	.thumbnail-lg > img {
		width: var(--size-full);
		height: var(--size-full);
		overflow: hidden;
		object-fit: var(--object-fit);
	}

	.thumbnail-lg:hover .caption-label {
		opacity: 0.5;
	}

	.caption-label {
		position: absolute;
		right: var(--block-label-margin);
		bottom: var(--block-label-margin);
		z-index: var(--layer-1);
		border-top: 1px solid var(--border-color-primary);
		border-left: 1px solid var(--border-color-primary);
		border-radius: var(--block-label-radius);
		background: var(--background-fill-secondary);
		padding: var(--block-label-padding);
		max-width: 80%;
		overflow: hidden;
		font-size: var(--block-label-text-size);
		text-align: left;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
