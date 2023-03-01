<script lang="ts">
	import { BlockLabel, Empty } from "@gradio/atoms";
	import { ModifyUpload } from "@gradio/upload";
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
	export let style: Styles = { grid: [2], height: "auto" };

	$: _value =
		value === null
			? null
			: value.map((img) =>
					Array.isArray(img)
						? [normalise_file(img[0], root, root_url), img[1]]
						: [normalise_file(img, root, root_url), null]
			  );

	let prevValue: string[] | FileData[] | null = null;
	let selected_image: number | null = null;
	$: if (prevValue !== value) {
		// so that gallery preserves selected image after update
		selected_image =
			selected_image !== null && value !== null && selected_image < value.length
				? selected_image
				: null;
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
		styles = get_styles(style, ["grid"]).styles;

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
						class="thumbnail-item thumbnail-small "
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
		background: var(--color-background-primary);
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
		color: var(--color-text-label);
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
		gap: var(--size-2);
		width: var(--size-full);
		height: var(--size-14);
		overflow-x: scroll;
		font-size: var(--scale-00);
	}

	.thumbnail-item {
		--ring-color: transparent;
		position: relative;
		outline: none;
		box-shadow: 0 0 0 2px var(--ring-color), var(--shadow-drop);
		border: 1px solid var(--gallery-thumb-border-color-base);
		border-radius: var(--radius-sm);
		background-color: var(--gallery-thumb-background-base);
		aspect-ratio: var(--ratio-square);
		width: var(--size-full);
		height: var(--size-full);
		overflow: hidden;
	}

	.thumbnail-item:hover {
		--ring-color: var(--gallery-thumb-border-color-hover);
		filter: brightness(1.1);
		border-color: var(--gallery-thumb-border-color-hover);
	}

	.thumbnail-item:focus {
		--ring-color: var(--gallery-thumb-border-color-focus);
		border-color: var(--gallery-thumb-border-color-focus);
	}

	.thumbnail-small {
		flex: none;
		transform: scale(0.9);
		transition: 0.075s;
		width: var(--size-9);
		height: var(--size-9);
	}

	.thumbnail-small.selected {
		--ring-color: var(--gallery-thumb-border-color-selected);
		transform: scale(1);
		border-color: var(--gallery-thumb-border-color-selected);
	}

	.thumbnail-small.selected:focus {
		--ring-color: var(--gallery-thumb-border-color-focus) !important;
		border-color: var(--gallery-thumb-border-color-focus) !important;
	}

	.thumbnail-small > img {
		width: var(--size-full);
		height: var(--size-full);
		overflow: hidden;
		object-fit: cover;
	}

	.grid-wrap {
		padding: var(--size-2);
		height: var(--size-full);
		overflow-y: auto;
	}

	.grid-container {
		display: grid;
		grid-template-columns: var(--grid-cols);
		gap: var(--size-2);
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
		object-fit: cover;
	}

	.thumbnail-lg:hover .caption-label {
		opacity: 0.5;
	}

	.caption-label {
		position: absolute;
		right: 0;
		bottom: 0;
		z-index: var(--layer-1);
		border-top: 1px solid var(--gallery-label-border-color-base);
		border-left: 1px solid var(--gallery-label-border-color-base);
		border-top-left-radius: var(--radius-lg);
		background: var(--gallery-thumb-background-base);
		padding: var(--size-1) var(--size-3);
		max-width: 80%;
		overflow: hidden;
		font-weight: var(--weight-semibold);
		font-size: var(--scale-000);
		text-align: left;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
