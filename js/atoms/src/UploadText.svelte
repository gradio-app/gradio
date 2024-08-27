<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { Upload as UploadIcon, ImagePaste } from "@gradio/icons";
	import { inject } from "./utils/parse_placeholder";

	export let type:
		| "video"
		| "image"
		| "audio"
		| "file"
		| "csv"
		| "clipboard"
		| "gallery" = "file";
	export let i18n: I18nFormatter;
	export let message: string | undefined = undefined;
	export let mode: "full" | "short" = "full";
	export let hovered = false;
	export let placeholder: string | undefined = undefined;

	const defs = {
		image: "upload_text.drop_image",
		video: "upload_text.drop_video",
		audio: "upload_text.drop_audio",
		file: "upload_text.drop_file",
		csv: "upload_text.drop_csv",
		gallery: "upload_text.drop_gallery",
		clipboard: "upload_text.paste_clipboard"
	};

	$: [heading, paragraph] = placeholder ? inject(placeholder) : [false, false];
</script>

<div class="wrap">
	<span class="icon-wrap" class:hovered>
		{#if type === "clipboard"}
			<ImagePaste />
		{:else}
			<UploadIcon />
		{/if}
	</span>

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
		min-height: var(--size-60);
		color: var(--block-label-text-color);
		line-height: var(--line-md);
		height: 100%;
		padding-top: var(--size-3);
		text-align: center;
		margin: auto var(--spacing-lg);
	}

	.or {
		color: var(--body-text-color-subdued);
		display: flex;
	}

	.icon-wrap {
		width: 30px;
		margin-bottom: var(--spacing-lg);
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
