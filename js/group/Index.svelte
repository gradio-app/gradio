<script lang="ts">
	import { Gradio } from "@gradio/utils";

	const props = $props();
	const gradio = new Gradio<{}, {}>(props);
</script>

<<<<<<< Updated upstream
<div
	id={gradio.shared.elem_id}
	class="gr-group {gradio.shared.elem_classes?.join(' ') || ''}"
	class:hide={gradio.shared.visible === "hidden"}
>
=======
{#if gradio.shared.visible}
>>>>>>> Stashed changes
	<div
		id={gradio.shared.elem_id}
		class="gr-group {gradio.shared.elem_classes?.join(' ') || ''}"
		class:hide={gradio.shared.visible === "hidden"}
	>
		<div
			class="styler"
			style:--block-radius="0px"
			style:--block-border-width="0px"
			style:--layout-gap="1px"
			style:--form-gap-width="1px"
			style:--button-border-width="0px"
			style:--button-large-radius="0px"
			style:--button-small-radius="0px"
		>
			<slot />
		</div>
	</div>
{/if}

<style>
	div {
		border: var(--block-border-width) solid var(--border-color-primary);
		background: var(--block-border-color);
		border-radius: var(--block-radius);
		display: flex;
		flex-direction: column;
		gap: var(--form-gap-width);
		overflow: hidden;
	}
	div > :global(*:not(.absolute)) {
		border: none;
		border-radius: 0;
	}
	.hide {
		display: none;
	}
</style>
