<script lang="ts">
	import CustomButton from "./CustomButton.svelte";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";
	import type { Snippet } from "svelte";

	let {
		top_panel = true,
		display_top_corner = false,
		show_background = true,
		buttons = null,
		on_custom_button_click = null,
		children
	}: {
		top_panel?: boolean;
		display_top_corner?: boolean;
		show_background?: boolean;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
		children?: Snippet;
	} = $props();
</script>

<div
	class={`icon-button-wrapper ${top_panel ? "top-panel" : ""} ${display_top_corner ? "display-top-corner" : "hide-top-corner"} ${!show_background ? "no-background" : ""}`}
>
	{#if children}{@render children()}{/if}
	{#if buttons}
		{#each buttons as btn}
			{#if typeof btn !== "string"}
				<CustomButton
					button={btn}
					on_click={(id) => {
						if (on_custom_button_click) {
							on_custom_button_click(id);
						}
					}}
				/>
			{/if}
		{/each}
	{/if}
</div>

<style>
	.icon-button-wrapper {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		z-index: var(--layer-2);
		gap: var(--spacing-sm);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		background: var(--block-background-fill);
		padding: var(--spacing-xxs);
	}

	.icon-button-wrapper.top-panel {
		border: none;
		border-radius: 999px;
		margin: var(--spacing-md);
		padding: 2px var(--spacing-sm);
		background: color-mix(in srgb, var(--block-background-fill) 75%, transparent);
		backdrop-filter: blur(12px) saturate(1.5);
		box-shadow:
			0 0 0 1px var(--border-color-primary),
			0 2px 8px -2px rgb(0 0 0 / 0.1);
	}

	.icon-button-wrapper.display-top-corner {
		border-radius: var(--radius-sm) 0 0 var(--radius-sm);
		top: var(--spacing-sm);
		right: -1px;
	}

	.icon-button-wrapper:not(.top-panel) {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
	}

	.top-panel {
		position: absolute;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
	}

	.icon-button-wrapper :global(button) {
		margin: var(--spacing-xxs);
		border-radius: var(--radius-xs);
		position: relative;
	}

	.icon-button-wrapper :global(a.download-link:not(:last-child)),
	.icon-button-wrapper :global(button:not(:last-child)) {
		margin-right: var(--spacing-xxs);
	}

	.icon-button-wrapper :global(> *) {
		height: 100%;
	}

	.icon-button-wrapper.no-background {
		box-shadow: none;
		border: none;
		background: none;
		padding: 0;
		z-index: var(--layer-1);
	}
</style>
