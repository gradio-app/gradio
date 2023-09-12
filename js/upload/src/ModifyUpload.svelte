<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Edit, Clear } from "@gradio/icons";
	import type { I18nFormatter } from "../@gradio/utils";
	import { createEventDispatcher } from "svelte";

	export let editable = false;
	export let absolute = true;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{ edit: never; clear: never }>();
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
