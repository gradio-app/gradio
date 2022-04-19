<script lang="ts">
	export let variant: "primary" | "secondary" = "primary";
	export let style: string = "";
</script>

<button
	on:click
	{style}
	class="{variant} flex-1 px-4 py-2 bg-gray-100 rounded transition"
>
	<slot />
</button>

<style lang="postcss">
	button {
		@apply hover:bg-gray-200;
	}
</style>
