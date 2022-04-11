<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { playable } from "../utils/helpers";

	import { Video } from "@gradio/video";
	import { _ } from "svelte-i18n";

	export let value: FileData | null | string = null;
	export let label: string;
	export let default_value: FileData | null;
	export let style: string = "";
	export let source: string;
	export let root: string;

	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);
</script>

{#if mode === "static" && _value}
	<div
		class="output-video w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
	>
		{#if playable(_value.data)}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				class="video_preview w-full h-full object-contain"
				controls
				playsInline
				preload="auto"
				src={_value.data}
			/>
		{:else}
			<a
				href={_value.data}
				download={_value.name}
				class="file-preview h-60 w-full flex flex-col justify-center items-center relative"
			>
				<div class="file-name text-4xl p-6 break-all">{_value.name}</div>
			</a>
		{/if}
	</div>
{:else}
	<Video
		value={_value}
		on:change={({ detail }) => (value = detail)}
		{label}
		{style}
		{source}
		drop_text={$_("interface.drop_video")}
		or_text={$_("or")}
		upload_text={$_("interface.click_to_upload")}
		on:change
		on:clear
		on:play
		on:pause
	/>
{/if}
