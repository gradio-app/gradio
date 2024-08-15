<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { Upload as UploadIcon, ImagePaste } from "@gradio/icons";
	import { marked } from "marked";

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

	function render_markdown(text: string): string {
		return marked(text);
	}

	const defs = {
		image: "upload_text.drop_image",
		video: "upload_text.drop_video",
		audio: "upload_text.drop_audio",
		file: "upload_text.drop_file",
		csv: "upload_text.drop_csv",
		gallery: "upload_text.drop_gallery",
		clipboard: "upload_text.paste_clipboard"
	};
</script>

<div class="wrap">
	<span class="icon-wrap" class:hovered>
		{#if type === "clipboard"}
			<ImagePaste />
		{:else}
			<UploadIcon />
		{/if}
	</span>

	{#if placeholder}
		{@html render_markdown(placeholder)}
	{:else}
		{i18n(defs[type] || defs.file)}

		{#if mode !== "short"}
			<span class="or">- {i18n("common.or")} -</span>
			{message || i18n("upload_text.click_to_upload")}
		{/if}
	{/if}
</div>

<style>
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
