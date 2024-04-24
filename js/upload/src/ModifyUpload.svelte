<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import type { I18nFormatter } from "@gradio/utils";
	import { Edit, Clear, Undo, Download } from "@gradio/icons";
	import { DownloadLink } from "@gradio/wasm/svelte";

	import { createEventDispatcher } from "svelte";

	export let editable = false;
	export let undoable = false;
	export let download: string | null = null;
	export let absolute = true;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{
		edit?: never;
		clear?: never;
		undo?: never;
	}>();
</script>

<div
	class:not-absolute={!absolute}
	style:position={absolute ? "absolute" : "static"}
>
	{#if editable}
		<IconButton
			Icon={Edit}
			label={i18n("common.edit")}
			on:click={() => dispatch("edit")}
		/>
	{/if}

	{#if undoable}
		<IconButton
			Icon={Undo}
			label={i18n("common.undo")}
			on:click={() => dispatch("undo")}
		/>
	{/if}

	{#if download}
		<DownloadLink href={download} download>
			<IconButton Icon={Download} label={i18n("common.download")} />
		</DownloadLink>
	{/if}

	<IconButton
		Icon={Clear}
		label={i18n("common.clear")}
		on:click={(event) => {
			dispatch("clear");
			event.stopPropagation();
		}}
	/>
</div>

<style>
	div {
		display: flex;
		top: var(--size-2);
		right: var(--size-2);
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-1);
	}

	.not-absolute {
		margin: var(--size-1);
	}
</style>
