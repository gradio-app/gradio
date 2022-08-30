<script lang="ts">
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
</script>

<div>
	<slot />
</div>

<style>
	div > :global(*:not(.absolute)) {
		@apply !rounded-none;
	}

	div > :global(*:first-child) {
		@apply !rounded-tl-lg !rounded-tr-lg;
	}

	div > :global(*:last-child) {
		@apply !rounded-bl-lg !rounded-br-lg;
	}

	div > :global(* + *:not(.absolute)) {
		@apply !border-t-0;
	}
</style>
