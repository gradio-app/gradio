<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Image, StaticImage } from "@gradio/image";
	import { _ } from "svelte-i18n";

	export let value: null | string = null;
	export let style: string = "";
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";
	export let label: string;

	export let mode: "static" | "dynamic";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
	$: console.log(style);
</script>

{#if mode === "static"}
	<StaticImage {value} {label} {style} />
{:else}
	<Image
		bind:value
		{style}
		{source}
		{tool}
		on:edit
		on:clear
		on:change
		{label}
		drop_text={$_("interface.drop_image")}
		or_text={$_("or")}
		upload_text={$_("interface.click_to_upload")}
	/>
{/if}
