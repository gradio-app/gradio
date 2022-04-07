<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { playable } from "../utils/helpers";
	import { setFilenameSource } from "../utils/utils";

	import { Video } from "@gradio/video";
	import { _ } from "svelte-i18n";

	export let value: FileData | null = null;
	export let default_value: FileData | null;
	export let theme: string;
	export let style: string | null;
	export let source: string;
	export let root: string;

	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
	$: valueWithSource = value === null ? null : setFilenameSource(value, root);
</script>

{#if mode === "static" && valueWithSource}
	<div
		class="output-video w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
	>
		{#if playable(valueWithSource.name)}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				class="video_preview w-full h-full object-contain"
				controls
				playsInline
				preload="auto"
				src={valueWithSource.name}
			/>
		{:else}
			<a
				href={valueWithSource.data}
				download={valueWithSource.name}
				class="file-preview h-60 w-full flex flex-col justify-center items-center relative"
			>
				<div class="file-name text-4xl p-6 break-all">{valueWithSource.name}</div>
			</a>
		{/if}
	</div>
{:else}
	<Video
		bind:value={valueWithSource}
		{theme}
		{style}
		{source}
		drop_text={$_("interface.drop_video")}
		or_text={$_("interface.or")}
		upload_text={$_("interface.click_to_upload")}
		on:change
		on:clear
		on:play
		on:pause
	/>
{/if}
