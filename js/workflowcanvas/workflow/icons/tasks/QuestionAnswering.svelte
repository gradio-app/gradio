<script lang="ts">
	interface Props { classNames?: string }
	let { classNames = "" }: Props = $props();
</script>

<svg
	class={classNames}
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	width="1em"
	height="1em"
	preserveAspectRatio="xMidYMid meet"
	viewBox="0 0 32 32"
>
	<path d="M2 9h9V2H2zm2-5h5v3H4z" fill="currentColor" />
	<path d="M2 19h9v-7H2zm2-5h5v3H4z" fill="currentColor" />
	<path d="M2 29h9v-7H2zm2-5h5v3H4z" fill="currentColor" />
	<path
		d="M27 9h-9l3.41-3.59L20 4l-6 6l6 6l1.41-1.41L18 11h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H15v2h12a3 3 0 0 0 3-3V12a3 3 0 0 0-3-3z"
		fill="currentColor"
	/>
</svg>
