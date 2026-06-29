<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Clear } from "@gradio/icons";

	let { onremove_image }: { onremove_image?: () => void } = $props();
</script>

<div>
	<IconButton
		Icon={Clear}
		label="Remove Image"
		onclick={(event) => {
			onremove_image?.();
			event.stopPropagation();
		}}
	/>
</div>

<style>
	div {
		display: flex;
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
	}
</style>
