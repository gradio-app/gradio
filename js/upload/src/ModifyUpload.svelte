<script lang="ts">
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import type { I18nFormatter } from "@gradio/utils";
	import { Edit, Clear, Undo, Download } from "@gradio/icons";
	import { DownloadLink } from "@gradio/wasm/svelte";

	import { createEventDispatcher } from "svelte";

	export let editable = false;
	export let undoable = false;
	export let download: string | null = null;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{
		edit?: never;
		clear?: never;
		undo?: never;
	}>();
</script>

<IconButtonWrapper>
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

	<slot />

	<IconButton
		Icon={Clear}
		label={i18n("common.clear")}
		on:click={(event) => {
			dispatch("clear");
			event.stopPropagation();
		}}
	/>
</IconButtonWrapper>
