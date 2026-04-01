<script lang="ts">
	let { size = 16 } = $props();
</script>

<div class="wrapper" aria-label="Static column">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
		<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
	</svg>
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
