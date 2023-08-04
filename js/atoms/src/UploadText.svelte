<script lang="ts">
	import { _ } from "svelte-i18n";

	export let type: "video" | "image" | "audio" | "file" | "csv" = "file";

	const defs = {
		image: "interface.drop_image",
		video: "interface.drop_video",
		audio: "interface.drop_audio",
		file: "interface.drop_file",
		csv: "interface.drop_csv"
	};
</script>

<div class="wrap">
	{$_(defs[type])}
	<span class="or">- {$_("or")} -</span>
	{$_("interface.click_to_upload")}
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: var(--size-60);
		color: var(--block-label-text-color);
		line-height: var(--line-md);
	}

	.or {
		color: var(--body-text-color-subdued);
	}

	@media (--screen-md) {
		.wrap {
			font-size: var(--text-lg);
		}
	}
</style>
