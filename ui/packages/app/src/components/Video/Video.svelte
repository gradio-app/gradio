<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { playable } from "../utils/helpers";

	import { Video, StaticVideo } from "@gradio/video";
	import { _ } from "svelte-i18n";

	export let value: FileData | null | string = null;
	export let label: string;
	export let style: string = "";
	export let source: string;
	export let root: string;

	export let mode: "static" | "dynamic";

	let _value: null | FileData;
	$: _value = normalise_file(value, root);
</script>

{#if mode === "static"}
	<StaticVideo value={_value} {label} {style} />
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
