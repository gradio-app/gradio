<script lang="ts">
	export let classNames = "";
</script>

<svg
	class={classNames || "menu-icon-arrow"}
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<path d="M7 7h10v10"></path>
	<path d="M7 17 17 7"></path>
</svg>

<style>
	.menu-icon-arrow {
		width: 1rem;
		height: 1rem;
		color: rgb(107, 114, 128);
		flex-shrink: 0;
	}

	@media (prefers-color-scheme: dark) {
		.menu-icon-arrow {
			color: rgb(209, 213, 219);
		}
	}
</style>
