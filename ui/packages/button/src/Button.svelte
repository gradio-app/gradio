<script lang="ts">
	export let variant: "primary" | "secondary" = "secondary";
	export let style: string = "";
	export let size: "sm" | "lg" = "lg";
</script>

<button on:click {style} class="btn btn-{size} btn-{variant}">
	<slot />
</button>

<style lang="postcss">
	.btn-primary {
		@apply from-orange-100/70 to-orange-200/80 hover:to-orange-100/90 text-orange-600 border-orange-200;
	}

	.btn-secondary {
		@apply from-gray-100/70 to-gray-200/80 hover:to-gray-100/90 text-gray-700 border-gray-200;
	}

	.btn {
		@apply border inline-flex items-center shadow-sm bg-gradient-to-br bg-white active:shadow-inner;
	}

	.btn-lg {
		@apply py-2 px-4 font-semibold rounded-lg;
	}

	.btn-sm {
		@apply px-3 py-1 text-sm rounded-md;
	}
</style>
