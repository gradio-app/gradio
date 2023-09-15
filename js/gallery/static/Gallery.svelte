<script lang="ts">
	import { BlockLabel, Empty, ShareButton } from "@gradio/atoms";
	import { ModifyUpload } from "@gradio/upload";
	import type { SelectData } from "@gradio/utils";

	import { createEventDispatcher } from "svelte";
	import { tick } from "svelte";

	import { Download, Image } from "@gradio/icons";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { format_gallery_for_sharing } from "./utils";
	import { IconButton } from "@gradio/atoms";
	import type { I18nFormatter } from "@gradio/utils";

	export let show_label = true;
	export let label: string;
	export let root = "";
	export let root_url: null | string = null;
	export let value: { image: FileData; caption: string | null }[] | null = null;
	export let grid_cols: number | number[] | undefined = [2];
	export let grid_rows: number | number[] | undefined = undefined;
	export let height: number | "auto" = "auto";
	export let preview: boolean;
	export let allow_preview = true;
	export let object_fit: "contain" | "cover" | "fill" | "none" | "scale-down" =
		"cover";
	export let show_share_button = false;
	export let show_download_button = false;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{
		select: SelectData;
	}>();

	// tracks whether the value of the gallery was reset
	let was_reset = true;

	$: was_reset = value == null || value.length == 0 ? true : was_reset;

	let _value: { image: FileData; caption: string | null }[] | null = null;
	$: _value =
		value === null
			? null
			: value.map((data) => ({
					image: normalise_file(data.image, root, root_url) as FileData,
					caption: data.caption
			  }));

	let prevValue: { image: FileData; caption: string | null }[] | null | null =
		value;
	let selected_image = preview && value?.length ? 0 : null;
	let old_selected_image: number | null = selected_image;

	$: if (prevValue !== value) {
		// When value is falsy (clear button or first load),
		// preview determines the selected image
		if (was_reset) {
			selected_image = preview && value?.length ? 0 : null;
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

	function handle_preview_click(event: MouseEvent): void {
		const element = event.target as HTMLElement;
		const x = event.clientX;
		const width = element.offsetWidth;
		const centerX = width / 2;

		if (x < centerX) {
			selected_image = previous;
		} else {
			selected_image = next;
		}
	}

	function on_keydown(e: KeyboardEvent): void {
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

	function isFileData(obj: any): obj is FileData {
		return typeof obj === "object" && obj !== null && "data" in obj;
	}

	function getHrefValue(selected: any): string {
		if (isFileData(selected)) {
			return selected.data;
		} else if (typeof selected === "string") {
			return selected;
		}
		return "";
	}

	$: {
		if (selected_image !== old_selected_image) {
			old_selected_image = selected_image;
			if (selected_image !== null) {
				dispatch("select", {
					index: selected_image,
					value: _value?.[selected_image].caption
				});
			}
		}
	}

	$: if (allow_preview) {
		scroll_to_img(selected_image);
	}

	let el: HTMLButtonElement[] = [];
	let container_element: HTMLDivElement;

	async function scroll_to_img(index: number | null): Promise<void> {
		if (typeof index !== "number") return;
		await tick();

		el[index].focus();

		const { left: container_left, width: container_width } =
			container_element.getBoundingClientRect();
		const { left, width } = el[index].getBoundingClientRect();

		const relative_left = left - container_left;

		const pos =
			relative_left +
			width / 2 -
			container_width / 2 +
			container_element.scrollLeft;

		container_element?.scrollTo({
			left: pos < 0 ? 0 : pos,
			behavior: "smooth"
		});
	}

	let client_height = 0;
	let window_height = 0;
</script>

<svelte:window bind:innerHeight={window_height} />

{#if show_label}
	<BlockLabel {show_label} Icon={Image} label={label || "Gallery"} />
{/if}
{#if value === null || _value === null || _value.length === 0}
	<Empty unpadded_box={true} size="large"><Image /></Empty>
{:else}
	{#if selected_image !== null && allow_preview}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div on:keydown={on_keydown} class="preview">
			<div class="icon-buttons">
				{#if show_download_button}
					<a
						href={getHrefValue(value[selected_image])}
						target={window.__is_colab__ ? "_blank" : null}
						download="image"
					>
						<IconButton Icon={Download} label={i18n("common.download")} />
					</a>
				{/if}

				<ModifyUpload
					{i18n}
					absolute={false}
					on:clear={() => (selected_image = null)}
				/>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<img
				data-testid="detailed-image"
				on:click={(event) => handle_preview_click(event)}
				src={_value[selected_image].image.data}
				alt={_value[selected_image].caption || ""}
				title={_value[selected_image].caption || null}
				class:with-caption={!!_value[selected_image].caption}
				style="height: calc(100% - {_value[selected_image].caption}
					? '80px'
					: '60px'})"
				loading="lazy"
			/>
			{#if _value[selected_image].caption}
				<div class="caption">
					{_value[selected_image].caption}
				</div>
			{/if}
			<div
				bind:this={container_element}
				class="thumbnails scroll-hide"
				data-testid="container_el"
			>
				{#each _value as image, i}
					<button
						bind:this={el[i]}
						on:click={() => (selected_image = i)}
						class="thumbnail-item thumbnail-small"
						class:selected={selected_image === i}
					>
						<img
							src={image.image.data}
							title={image.caption || null}
							alt={image.caption || null}
							loading="lazy"
						/>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div
		bind:clientHeight={client_height}
		class="grid-wrap"
		class:fixed-height={!height || height == "auto"}
	>
		<div
			class="grid-container"
			style="--grid-cols:{grid_cols}; --grid-rows:{grid_rows}; --object-fit: {object_fit}; height: {height};"
			class:pt-6={show_label}
		>
			{#if show_share_button}
				<div class="icon-button">
					<ShareButton
						{i18n}
						on:share
						on:error
						value={_value}
						formatter={format_gallery_for_sharing}
					/>
				</div>
			{/if}
			{#each _value as entry, i}
				<button
					class="thumbnail-item thumbnail-lg"
					class:selected={selected_image === i}
					on:click={() => (selected_image = i)}
				>
					<img
						alt={entry.caption || ""}
						src={typeof entry.image === "string"
							? entry.image
							: entry.image.data}
						loading="lazy"
					/>
					{#if entry.caption}
						<div class="caption-label">
							{entry.caption}
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
		box-shadow:
			0 0 0 2px var(--ring-color),
			var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--button-small-radius);
		background: var(--background-fill-secondary);
		aspect-ratio: var(--ratio-square);
		width: var(--size-full);
		height: var(--size-full);
		overflow: clip;
	}

	.thumbnail-item:hover {
		--ring-color: var(--color-accent);
		filter: brightness(1.1);
	}

	.thumbnail-item.selected {
		--ring-color: var(--color-accent);
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
		position: relative;
		padding: var(--size-2);
		height: var(--size-full);
		overflow-y: scroll;
	}

	.grid-container {
		display: grid;
		position: relative;
		grid-template-rows: repeat(var(--grid-rows), minmax(100px, 1fr));
		grid-template-columns: repeat(var(--grid-cols), minmax(100px, 1fr));
		grid-auto-rows: minmax(100px, 1fr);
		gap: var(--spacing-lg);
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

	.icon-button {
		position: absolute;
		top: 0px;
		right: 0px;
		z-index: var(--layer-1);
	}

	.icon-buttons {
		display: flex;
		position: absolute;
		right: 0;
	}

	.icon-buttons a {
		margin: var(--size-1) 0;
	}
</style>
