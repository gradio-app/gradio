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
>
	<path
		d="M24,14a5.99,5.99,0,0,0-4.885,9.4712L14,28.5859,15.4141,30l5.1147-5.1147A5.9971,5.9971,0,1,0,24,14Zm0,10a4,4,0,1,1,4-4A4.0045,4.0045,0,0,1,24,24Z"
	/>
	<path
		d="M17,12a3,3,0,1,0-3-3A3.0033,3.0033,0,0,0,17,12Zm0-4a1,1,0,1,1-1,1A1.0009,1.0009,0,0,1,17,8Z"
	/>
	<path
		d="M12,24H4V17.9966L9,13l5.5859,5.5859L16,17.168l-5.5859-5.5855a2,2,0,0,0-2.8282,0L4,15.168V4H24v6h2V4a2.0023,2.0023,0,0,0-2-2H4A2.002,2.002,0,0,0,2,4V24a2.0023,2.0023,0,0,0,2,2h8Z"
	/>
</svg>
