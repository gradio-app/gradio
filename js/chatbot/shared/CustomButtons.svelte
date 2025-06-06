<script lang="ts">
	import { onMount } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { iconMap, loadIcons } from "./iconMap";

	export let custom_buttons:
		| {
				label: string;
				visible: "all" | "user" | "chatbot";
				icon: string | null;
		  }[]
		| null = null;
	export let handle_action: (
		selected: string | null,
		selected_label: string | null
	) => void;
	export let position: "right" | "left";
	let role = position == "left" ? "chatbot" : "user";

	let loadedIconMap: Record<string, any> | null = null;

	onMount(async () => {
		loadedIconMap = await loadIcons();
	});

	function onButtonClick(label: string) {
		console.log(`Button: ${label}`);
		handle_action("custom_button", label);
	}
</script>

<div class="custom-buttons-container">
	{#if custom_buttons}
		{#each custom_buttons as btn}
			{#if btn.visible === "all" || btn.visible === role}
				{#if btn.icon && loadedIconMap && btn.icon.toLowerCase() in loadedIconMap}
					<IconButton
						Icon={loadedIconMap[btn.icon.toLowerCase()]}
						label={btn.label}
						color="var(--block-label-text-color)"
						on:click={() => onButtonClick(btn["label"])}
					/>
				{:else}
					<button
						class="text-button"
						on:click={() => onButtonClick(btn["label"])}
					>
						{btn.label}
					</button>
				{/if}
			{/if}
		{/each}
	{/if}
</div>

<style>
	.custom-buttons-container {
		display: flex;
		gap: var(--spacing-sm);
	}

	.text-button {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		color: var(--block-label-text-color);
		background-color: var(--block-background-fill);
		font-size: var(--text-xs);
		padding: var(--spacing-xxs) var(--spacing-sm);
		cursor: pointer;
	}

	.text-button:hover {
		background-color: #9a9a9a;
		color: white;
	}
</style>
