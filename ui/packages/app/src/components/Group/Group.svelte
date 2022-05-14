<script lang="ts">
	import { create_classes } from "@gradio/utils";
	export let parent: string | null = null;
	export let style: Record<string, unknown> = {};

	if (typeof style.mobile_collapse !== "boolean") {
		style.mobile_collapse = true;
	}
</script>

<div>
	<slot />
</div>

<style>
	div > :global(*:not(.absolute)) {
		@apply rounded-none;
	}

	div > :global(*:first-child) {
		@apply rounded-tl-lg rounded-tr-lg;
	}

	div > :global(*:last-child) {
		@apply rounded-bl-lg rounded-br-lg;
	}

	div > :global(* + *:not(.absolute)) {
		@apply border-t-0;
	}
</style>
