<script lang="ts">
	import { Gradio } from "@gradio/utils";

	let props = $props();
	const gradio = new Gradio(props);
</script>

<div
	class="form"
	class:hidden={gradio.shared.visible === false}
	class:hidden-css={gradio.shared.visible === "hidden"}
	style:flex-grow={gradio.shared.scale}
	style:min-width={`calc(min(${gradio.shared.min_width}px, 100%))`}
>
	<slot />
</div>

<style>
	div {
		display: flex;
		flex-direction: inherit;
		flex-wrap: wrap;
		gap: var(--form-gap-width);
		box-shadow: var(--block-shadow);
		border: var(--block-border-width) solid var(--block-border-color);
		border-radius: var(--block-radius);
		background: var(--border-color-primary);
		overflow-y: hidden;
	}

	div :global(.block) {
		box-shadow: none !important;
		border-width: 0px !important;
		border-radius: 0px !important;
	}

	.hidden {
		display: none;
	}

	.hidden-css {
		display: none !important;
	}
</style>
