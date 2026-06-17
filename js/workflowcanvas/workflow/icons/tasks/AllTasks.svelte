<script lang="ts">
	interface Props {
		classNames?: string;
	}
	let { classNames = "" }: Props = $props();
</script>

<svg
	class={classNames}
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	fill="currentColor"
	focusable="false"
	role="img"
	width="1em"
	height="1em"
	preserveAspectRatio="xMidYMid meet"
	viewBox="0 0 32 32"
>
	<path d="M4 4h10v10H4zM18 4h10v10H18zM4 18h10v10H4zM18 18h10v10H18z" />
</svg>
