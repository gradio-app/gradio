<script lang="ts">
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
</script>

<div id={elem_id} class={elem_classes.join(" ")} class:hidden={!visible}>
	<slot />
</div>

<style>
	div > :global(*:not(.absolute)) {
		border-radius: 0px !important;
	}

	div > :global(*:first-child) {
		border-top-right-radius: var(--radius-lg) !important;
		border-top-left-radius: var(--radius-lg) !important;
	}

	div > :global(*:last-child) {
		border-top-right-radius: var(--radius-lg) !important;
		border-top-left-radius: var(--radius-lg) !important;
	}

	div > :global(* + *:not(.absolute)) {
		border-top: none !important;
	}
</style>
