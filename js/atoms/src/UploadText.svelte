<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { Upload as UploadIcon, ImagePaste } from "@gradio/icons";
	import { inject } from "./utils/parse_placeholder";

	type Density = "full" | "compact" | "minimal";

	let {
		type = "file",
		i18n,
		message = undefined,
		mode = "full",
		hovered = false,
		placeholder = undefined
	}: {
		type?:
			| "video"
			| "image"
			| "audio"
			| "file"
			| "csv"
			| "clipboard"
			| "gallery";
		i18n: I18nFormatter;
		message?: string | undefined;
		mode?: "full" | "short";
		hovered?: boolean;
		placeholder?: string | undefined;
	} = $props();

	const defs = {
		image: "upload_text.drop_image",
		video: "upload_text.drop_video",
		audio: "upload_text.drop_audio",
		file: "upload_text.drop_file",
		csv: "upload_text.drop_csv",
		gallery: "upload_text.drop_gallery",
		clipboard: "upload_text.paste_clipboard"
	};

	let parsed_placeholder = $derived<[string | false, string | false]>(
		placeholder ? inject(placeholder) : [false, false]
	);
	let heading = $derived(parsed_placeholder[0]);
	let paragraph = $derived(parsed_placeholder[1]);
	let container: HTMLDivElement;
	let density = $state<Density>("full");

	function update_density(height: number): void {
		if (height <= 0) return;
		const next = height <= 48 ? "minimal" : height <= 160 ? "compact" : "full";
		density = next;
	}

	$effect(() => {
		const boundary =
			(container.closest(".block") as HTMLElement | null) ?? container;
		if (!boundary.style.height && !boundary.style.maxHeight) return;

		let frame: number;
		const observer = new ResizeObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				update_density(boundary.getBoundingClientRect().height);
			});
		});

		update_density(boundary.getBoundingClientRect().height);
		observer.observe(boundary);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	});
</script>

<div
	class="wrap"
	class:compact={density === "compact"}
	class:minimal={density === "minimal"}
	bind:this={container}
	data-testid="upload-text"
	data-upload-density={density}
>
	<span class="icon-wrap" class:hovered data-testid="upload-icon">
		{#if type === "clipboard"}
			<ImagePaste />
		{:else}
			<UploadIcon />
		{/if}
	</span>

	{#if density === "full"}
		{#if heading || paragraph}
			{#if heading}
				<h2>{heading}</h2>
			{/if}
			{#if paragraph}
				<p>{paragraph}</p>
			{/if}
		{:else}
			{i18n(defs[type] || defs.file)}

			{#if mode !== "short"}
				<span class="or">- {i18n("common.or")} -</span>
				{message || i18n("upload_text.click_to_upload")}
			{/if}
		{/if}
	{:else}
		<div class="prompt">
			{#if heading || paragraph}
				{#if heading}
					<h2>{heading}</h2>
				{/if}
				{#if paragraph}
					<p>{paragraph}</p>
				{/if}
			{:else}
				<span>{i18n(defs[type] || defs.file)}</span>{" "}
				{#if mode !== "short"}
					<span class="or">{i18n("common.or")}</span>{" "}<span
						>{message || i18n("upload_text.click_to_upload")}</span
					>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	h2 {
		font-size: var(--text-xl) !important;
	}

	p,
	h2 {
		white-space: pre-line;
	}

	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-width: 0;
		min-height: var(--size-60);
		color: var(--block-label-text-color);
		line-height: var(--line-md);
		height: 100%;
		padding-top: var(--size-3);
		text-align: center;
		margin: auto var(--spacing-lg);
	}

	.prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 100%;
	}

	.or {
		color: var(--body-text-color-subdued);
		display: flex;
	}

	.icon-wrap {
		flex: 0 0 auto;
		width: 30px;
		margin-bottom: var(--spacing-lg);
	}

	.compact {
		min-height: 0;
		max-width: calc(100% - 2 * var(--spacing-lg));
		padding: 0;
		overflow: hidden;
	}

	.compact .icon-wrap {
		display: none;
	}

	.compact .prompt {
		display: block;
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.compact .or {
		display: inline;
		margin: 0 0.25em;
	}

	.compact h2,
	.compact p {
		display: inline;
		font-size: inherit !important;
		white-space: nowrap;
	}

	.compact h2 + p::before {
		content: " ";
	}

	.minimal {
		min-height: 0;
		visibility: hidden;
	}

	@media (--screen-md) {
		.wrap {
			font-size: var(--text-lg);
		}
	}

	.hovered {
		color: var(--color-accent);
	}
</style>
