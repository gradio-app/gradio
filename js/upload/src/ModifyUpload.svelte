<script lang="ts">
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import type { I18nFormatter } from "@gradio/utils";
	import { Edit, Clear, Undo, Download } from "@gradio/icons";
	import { DownloadLink } from "@gradio/atoms";

	let {
		editable = false,
		undoable = false,
		download = null,
		i18n,
		onedit,
		onclear,
		onundo,
		children
	}: {
		editable?: boolean;
		undoable?: boolean;
		download?: string | null;
		i18n: I18nFormatter;
		onedit?: () => void;
		onclear?: () => void;
		onundo?: () => void;
		children?: import("svelte").Snippet;
	} = $props();
</script>

<IconButtonWrapper>
	{#if editable}
		<IconButton
			Icon={Edit}
			label={i18n("common.edit")}
			onclick={() => onedit?.()}
		/>
	{/if}

	{#if undoable}
		<IconButton
			Icon={Undo}
			label={i18n("common.undo")}
			onclick={() => onundo?.()}
		/>
	{/if}

	{#if download}
		<DownloadLink href={download} download>
			<IconButton Icon={Download} label={i18n("common.download")} />
		</DownloadLink>
	{/if}

	{#if children}{@render children()}{/if}

	<IconButton
		Icon={Clear}
		label={i18n("common.clear")}
		onclick={(event) => {
			onclear?.();
			event.stopPropagation();
		}}
	/>
</IconButtonWrapper>
