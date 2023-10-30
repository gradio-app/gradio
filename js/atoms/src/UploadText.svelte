<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { Upload as UploadIcon } from "@gradio/icons";
	export let type: "video" | "image" | "audio" | "file" | "csv" = "file";
	export let i18n: I18nFormatter;
	export let message: string | undefined = undefined;
	export let mode: "full" | "short" = "full";
	export let hovered = false;

	const defs = {
		image: "upload_text.drop_image",
		video: "upload_text.drop_video",
		audio: "upload_text.drop_audio",
		file: "upload_text.drop_file",
		csv: "upload_text.drop_csv"
	};
</script>

<div class="wrap">
	<span class="icon-wrap" class:hovered><UploadIcon /> </span>

	{i18n(defs[type] || defs.file)}

	{#if mode !== "short"}
		<span class="or">- {i18n("common.or")} -</span>
		{message || i18n("upload_text.click_to_upload")}
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
