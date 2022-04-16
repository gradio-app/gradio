<script lang="ts">
	export let variant: "primary" | "secondary" = "primary";
	export let style: string = "";
</script>

<button
	on:click
	{style}
	class="btn-{variant} shadow-sm bg-gradient-to-br py-2 px-4 rounded-lg border font-semibold flex-1 active:shadow-inner bg-white"
>
	<slot />
</button>

<style lang="postcss">
	.btn-primary {
		@apply from-orange-100/70 to-orange-200/80 hover:to-orange-100/95 text-orange-600 border-orange-200/30;
	}

	.btn-secondary {
		@apply from-gray-100/70 to-gray-200/80 hover:to-gray-100/95 text-gray-700 border-gray-200/30;
	}
</style>
