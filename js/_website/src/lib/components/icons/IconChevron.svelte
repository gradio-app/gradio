<script lang="ts">
	let className = "";
	export { className as class };
	export let flipped = false;
</script>

<svg
	class={className}
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 20 20"
	fill="currentColor"
>
	<path
		d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
		transform={flipped ? "scale(1, -1)" : undefined}
		transform-origin={flipped ? "center" : undefined}
	/>
</svg>
