<script lang="ts">
	interface Props { classNames?: string }
	let { classNames = "" }: Props = $props();
</script>

<svg
	class={classNames}
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	aria-hidden="true"
	fill="currentColor"
	focusable="false"
	role="img"
	width="1em"
	height="1em"
	preserveAspectRatio="xMidYMid meet"
	viewBox="0 0 32 32"
	style="transform: rotate(360deg);"
>
	<circle cx="10" cy="20" r="2" fill="currentColor" />
	<circle cx="10" cy="28" r="2" fill="currentColor" />
	<circle cx="10" cy="14" r="2" fill="currentColor" />
	<circle cx="28" cy="4" r="2" fill="currentColor" />
	<circle cx="22" cy="6" r="2" fill="currentColor" />
	<circle cx="28" cy="10" r="2" fill="currentColor" />
	<circle cx="20" cy="12" r="2" fill="currentColor" />
	<circle cx="28" cy="22" r="2" fill="currentColor" />
	<circle cx="26" cy="28" r="2" fill="currentColor" />
	<circle cx="20" cy="26" r="2" fill="currentColor" />
	<circle cx="22" cy="20" r="2" fill="currentColor" />
	<circle cx="16" cy="4" r="2" fill="currentColor" />
	<circle cx="4" cy="24" r="2" fill="currentColor" />
	<circle cx="4" cy="16" r="2" fill="currentColor" />
</svg>
