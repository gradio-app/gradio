<script lang="ts">
	import Upload from "../../utils/Upload.svelte";
	import ModifyUpload from "../../utils/ModifyUpload.svelte";
	import { prettyBytes, playable } from "../../utils/helpers";
	import Webcam from "../../utils/Webcam.svelte";
	import { _ } from "svelte-i18n";

	interface Data {
		data: string;
		name: string;
		size: number;
	}

	interface FileData {
		name: string;
		size: number;
		data: string;
		is_example: false;
	}

	export let value: Data;
	export let setValue: (val: null | Data) => null | Data;
	export let theme: string;
	export let static_src: string;
	export let source: string;

	function handle_load(v: string | FileData | (string | FileData)[] | null) {
		setValue(v as Data);
		return v;
	}
</script>

<div
	class="video-preview w-full h-60 object-contain flex justify-center items-center dark:bg-gray-600 relative"
	class:bg-gray-200={value}
>
	{#if value === null}
		{#if source === "upload"}
			<Upload
				filetype="video/mp4,video/x-m4v,video/*"
				load={handle_load}
				{theme}
			>
				{$_("interface.drop_video")}
				<br />- {$_("interface.or")} -<br />
				{$_("interface.click_to_upload")}
			</Upload>
		{:else if source === "webcam"}
			<Webcam
				mode="video"
				on:capture={({ detail }) => {
					setValue(detail);
				}}
				{static_src}
			/>
		{/if}
	{:else}
		<ModifyUpload clear={() => setValue(null)} {theme} {static_src} />
		{#if playable(value.name)}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				class="w-full h-full object-contain bg-black"
				controls
				playsInline
				preload="auto"
				src={value.data}
			/>
		{:else}
			<div class="file-name text-4xl p-6 break-all">{value.name}</div>
			<div class="file-size text-2xl p-2">
				{prettyBytes(value.size)}
			</div>
		{/if}
	{/if}
</div>

<style lang="postcss">
</style>
