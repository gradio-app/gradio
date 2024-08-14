<script lang="ts">
	import { BlockLabel, Empty, ShareButton } from "@gradio/atoms";
	import { ModifyUpload } from "@gradio/upload";
	import type { SelectData } from "@gradio/utils";
	import { Image } from "@gradio/image/shared";
	import { dequal } from "dequal";
	import { createEventDispatcher, onMount } from "svelte";
	import { tick } from "svelte";

	import {
		Download,
		Image as ImageIcon,
		Maximize,
		Minimize,
		Clear
	} from "@gradio/icons";
	import { FileData } from "@gradio/client";
	import { format_gallery_for_sharing } from "./utils";
	import { IconButton } from "@gradio/atoms";
	import type { I18nFormatter } from "@gradio/utils";

	type GalleryImage = { image: FileData; caption: string | null };
	type GalleryData = GalleryImage[];

	export let show_label = true;
	export let label: string;
	export let value: GalleryData | null = null;
	export let columns: number | number[] | undefined = [2];
	export let rows: number | number[] | undefined = undefined;
	export let height: number | "auto" = "auto";
	export let preview: boolean;
	export let allow_preview = true;
	export let object_fit: "contain" | "cover" | "fill" | "none" | "scale-down" =
		"cover";
	export let show_share_button = false;
	export let show_download_button = false;
	export let i18n: I18nFormatter;
	export let selected_index: number | null = null;
	export let interactive: boolean;
	export let _fetch: typeof fetch;
	export let mode: "normal" | "minimal" = "normal";
	export let show_fullscreen_button = true;

	let is_full_screen = false;
	let gallery_container: HTMLElement;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	// tracks whether the value of the gallery was reset
	let was_reset = true;

	$: was_reset = value == null || value.length === 0 ? true : was_reset;

	let resolved_value: GalleryData | null = null;
	$: resolved_value =
		value == null
			? null
			: value.map((data) => ({
					image: data.image as FileData,
					caption: data.caption
				}));

	let prev_value: GalleryData | null = value;
	if (selected_index == null && preview && value?.length) {
		selected_index = 0;
	}
	let old_selected_index: number | null = selected_index;

	$: if (!dequal(prev_value, value)) {
		// When value is falsy (clear button or first load),
		// preview determines the selected image
		if (was_reset) {
			selected_index = preview && value?.length ? 0 : null;
			was_reset = false;
			// Otherwise we keep the selected_index the same if the
			// gallery has at least as many elements as it did before
		} else {
			selected_index =
				selected_index != null && value != null && selected_index < value.length
					? selected_index
					: null;
		}
		dispatch("change");
		prev_value = value;
	}

	$: previous =
		((selected_index ?? 0) + (resolved_value?.length ?? 0) - 1) %
		(resolved_value?.length ?? 0);
	$: next = ((selected_index ?? 0) + 1) % (resolved_value?.length ?? 0);

	function handle_preview_click(event: MouseEvent): void {
		const element = event.target as HTMLElement;
		const x = event.offsetX;
		const width = element.offsetWidth;
		const centerX = width / 2;

		if (x < centerX) {
			selected_index = previous;
		} else {
			selected_index = next;
		}
	}

	function on_keydown(e: KeyboardEvent): void {
		switch (e.code) {
			case "Escape":
				e.preventDefault();
				selected_index = null;
				break;
			case "ArrowLeft":
				e.preventDefault();
				selected_index = previous;
				break;
			case "ArrowRight":
				e.preventDefault();
				selected_index = next;
				break;
			default:
				break;
		}
	}

	$: {
		if (selected_index !== old_selected_index) {
			old_selected_index = selected_index;
			if (selected_index !== null) {
				dispatch("select", {
					index: selected_index,
					value: resolved_value?.[selected_index]
				});
			}
		}
	}

	$: if (allow_preview) {
		scroll_to_img(selected_index);
	}

	let el: HTMLButtonElement[] = [];
	let container_element: HTMLDivElement;

	async function scroll_to_img(index: number | null): Promise<void> {
		if (typeof index !== "number") return;
		await tick();

		if (el[index] === undefined) return;

		el[index]?.focus();

		const { left: container_left, width: container_width } =
			container_element.getBoundingClientRect();
		const { left, width } = el[index].getBoundingClientRect();

		const relative_left = left - container_left;

		const pos =
			relative_left +
			width / 2 -
			container_width / 2 +
			container_element.scrollLeft;

		if (container_element && typeof container_element.scrollTo === "function") {
			container_element.scrollTo({
				left: pos < 0 ? 0 : pos,
				behavior: "smooth"
			});
		}
	}

	let window_height = 0;

	// Unlike `gr.Image()`, images specified via remote URLs are not cached in the server
	// and their remote URLs are directly passed to the client as `value[].image.url`.
	// The `download` attribute of the <a> tag doesn't work for remote URLs (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download),
	// so we need to download the image via JS as below.
	async function download(file_url: string, name: string): Promise<void> {
		let response;
		try {
			response = await _fetch(file_url);
		} catch (error) {
			if (error instanceof TypeError) {
				// If CORS is not allowed (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful),
				// open the link in a new tab instead, mimicing the behavior of the `download` attribute for remote URLs,
				// which is not ideal, but a reasonable fallback.
				window.open(file_url, "_blank", "noreferrer");
				return;
			}

			throw error;
		}
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = name;
		link.click();
		URL.revokeObjectURL(url);
	}

	$: selected_image =
		selected_index != null && resolved_value != null
			? resolved_value[selected_index]
			: null;

	onMount(() => {
		document.addEventListener("fullscreenchange", () => {
			is_full_screen = !!document.fullscreenElement;
		});
	});

	const toggle_full_screen = async (): Promise<void> => {
		if (!is_full_screen) {
			await gallery_container.requestFullscreen();
		} else {
			await document.exitFullscreen();
		}
	};
</script>

<svelte:window bind:innerHeight={window_height} />

{#if show_label}
	<BlockLabel {show_label} Icon={ImageIcon} label={label || "Gallery"} />
{/if}
{#if value == null || resolved_value == null || resolved_value.length === 0}
	<Empty unpadded_box={true} size="large"><ImageIcon /></Empty>
{:else}
	<div class="gallery-container" bind:this={gallery_container}>
		{#if selected_image && allow_preview}
			<button
				on:keydown={on_keydown}
				class="preview"
				class:minimal={mode === "minimal"}
			>
				<div class="icon-buttons">
					{#if show_download_button}
						<IconButton
							Icon={Download}
							label={i18n("common.download")}
							on:click={() => {
								const image = selected_image?.image;
								if (image == null) {
									return;
								}
								const { url, orig_name } = image;
								if (url) {
									download(url, orig_name ?? "image");
								}
							}}
						/>
					{/if}

					{#if show_fullscreen_button && !is_full_screen}
						<IconButton
							Icon={is_full_screen ? Minimize : Maximize}
							label={is_full_screen
								? "Exit full screen"
								: "View in full screen"}
							on:click={toggle_full_screen}
						/>
					{/if}

					{#if show_fullscreen_button && is_full_screen}
						<IconButton
							Icon={Minimize}
							label="Exit full screen"
							on:click={toggle_full_screen}
						/>
					{/if}

					{#if !is_full_screen}
						<IconButton
							Icon={Clear}
							label="Close"
							on:click={() => (selected_index = null)}
						/>
					{/if}
				</div>
				<button
					class="image-button"
					on:click={(event) => handle_preview_click(event)}
					style="height: calc(100% - {selected_image.caption
						? '80px'
						: '60px'})"
					aria-label="detailed view of selected image"
				>
					<Image
						data-testid="detailed-image"
						src={selected_image.image.url}
						alt={selected_image.caption || ""}
						title={selected_image.caption || null}
						class={selected_image.caption && "with-caption"}
						loading="lazy"
					/>
				</button>
				{#if selected_image?.caption}
					<caption class="caption">
						{selected_image.caption}
					</caption>
				{/if}
				<div
					bind:this={container_element}
					class="thumbnails scroll-hide"
					data-testid="container_el"
				>
					{#each resolved_value as image, i}
						<button
							bind:this={el[i]}
							on:click={() => (selected_index = i)}
							class="thumbnail-item thumbnail-small"
							class:selected={selected_index === i && mode !== "minimal"}
							aria-label={"Thumbnail " +
								(i + 1) +
								" of " +
								resolved_value.length}
						>
							<Image
								src={image.image.url}
								title={image.caption || null}
								data-testid={"thumbnail " + (i + 1)}
								alt=""
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			</button>
		{/if}

		<div
			class="grid-wrap"
			class:minimal={mode === "minimal"}
			class:fixed-height={mode !== "minimal" && (!height || height == "auto")}
			class:hidden={is_full_screen}
		>
			<div
				class="grid-container"
				style="--grid-cols:{columns}; --grid-rows:{rows}; --object-fit: {object_fit}; height: {height};"
				class:pt-6={show_label}
			>
				{#if interactive}
					<div class="icon-button">
						<ModifyUpload
							{i18n}
							absolute={false}
							on:clear={() => (value = null)}
						/>
					</div>
				{/if}
				{#if show_share_button}
					<div class="icon-button">
						<ShareButton
							{i18n}
							on:share
							on:error
							value={resolved_value}
							formatter={format_gallery_for_sharing}
						/>
					</div>
				{/if}
				{#each resolved_value as entry, i}
					<button
						class="thumbnail-item thumbnail-lg"
						class:selected={selected_index === i}
						on:click={() => (selected_index = i)}
						aria-label={"Thumbnail " + (i + 1) + " of " + resolved_value.length}
					>
						<Image
							alt={entry.caption || ""}
							src={typeof entry.image === "string"
								? entry.image
								: entry.image.url}
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
	</div>
{/if}

<style lang="postcss">
	.image-container {
		height: 100%;
		position: relative;
	}
	.image-container :global(img),
	button {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		display: block;
		border-radius: var(--radius-lg);
	}

	.preview {
		display: flex;
		position: absolute;
		flex-direction: column;
		z-index: var(--layer-2);
		border-radius: calc(var(--block-radius) - var(--block-border-width));
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		width: var(--size-full);
		height: var(--size-full);
	}

	.preview.minimal {
		width: fit-content;
		height: fit-content;
	}

	.preview::before {
		content: "";
		position: absolute;
		z-index: var(--layer-below);
		background: var(--background-fill-primary);
		opacity: 0.9;
		width: var(--size-full);
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

	.image-button {
		height: calc(100% - 60px);
		width: 100%;
		display: flex;
	}
	.image-button :global(img) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}
	.thumbnails :global(img) {
		object-fit: cover;
		width: var(--size-full);
		height: var(--size-full);
	}
	.preview :global(img.with-caption) {
		height: var(--size-full);
	}

	.preview.minimal :global(img.with-caption) {
		height: auto;
	}

	.selectable {
		cursor: crosshair;
	}

	.caption {
		padding: var(--size-2) var(--size-3);
		overflow: hidden;
		color: var(--block-label-text-color);
		font-weight: var(--weight-semibold);
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		align-self: center;
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
			inset 0 0 0 1px var(--ring-color),
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
		border-color: var(--color-accent);
		filter: brightness(1.1);
	}

	.thumbnail-item.selected {
		--ring-color: var(--color-accent);
		border-color: var(--color-accent);
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

	.thumbnail-lg > :global(img) {
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
		gap: var(--size-1);
		z-index: 1;
		margin: var(--size-1);
	}

	.grid-wrap.minimal {
		padding: 0;
	}
</style>
