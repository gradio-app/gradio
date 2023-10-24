<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { Upload } from "@gradio/icons";

	export let type: "video" | "image" | "audio" | "file" | "csv" = "file";
	export let border_mode: "base" | "focus" = "base";
	export let i18n: I18nFormatter;

	const defs = {
		image: "upload_text.drop_image",
		video: "upload_text.drop_video",
		audio: "upload_text.drop_audio",
		file: "upload_text.drop_file",
		csv: "upload_text.drop_csv"
	};
</script>

<div class="wrap" class:border_focus={border_mode === "focus"}>
	<span><Upload /></span>
	{i18n(defs[type])}
</div>

<style>
	.wrap {
		border-width: 2px;
		border-color: var(--block-border-color);
		border-radius: var(--block-radius);
		padding: var(--size-6) var(--size-8);
		border-style: dashed;
		display: flex;

		justify-content: center;
		/* min-height: var(--size-60); */
		color: var(--block-label-text-color);
		line-height: var(--line-md);
		font-size: var(--scale-0);
		font-weight: var(--weight-bold);
	}

	span {
		width: 20px;
		margin-right: var(--spacing-xl);
	}

	.border_focus {
		border-color: var(--color-accent);
	}

	.border_focus span {
		color: var(--color-accent);
	}

	@media (--screen-md) {
		.wrap {
			font-size: var(--text-lg);
		}
	}
</style>
