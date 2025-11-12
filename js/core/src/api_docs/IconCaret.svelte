<script lang="ts">
	export let classNames = "";
</script>

<svg
	class={classNames}
	width="1em"
	height="1em"
	viewBox="0 0 12 7"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path d="M1 1L6 6L11 1" stroke="currentColor" />
</svg>

<style>
	.caret-icon {
		transition: transform 0.2s ease-in-out;
		color: rgb(156, 163, 175);
		overflow: visible;
		width: 0.75rem;
		height: 0.75rem;
	}

	@media (max-width: 640px) {
		.caret-icon {
			width: 0.625rem;
			height: 0.625rem;
		}
	}

	.rotate-180 {
		transform: rotate(180deg);
	}

	.rotate-0 {
		transform: rotate(0deg);
	}
</style>
