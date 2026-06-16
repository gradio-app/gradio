<script lang="ts">
	interface Props {
		classNames?: string;
	}
	let { classNames = "" }: Props = $props();
</script>

​
<svg
	class={classNames}
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	aria-hidden="true"
	role="img"
	width="1em"
	height="1em"
	preserveAspectRatio="xMidYMid meet"
	viewBox="0 0 32 32"
>
	<path
		d="M29.707 19.293l-3-3a1 1 0 0 0-1.414 0L16 25.586V30h4.414l9.293-9.293a1 1 0 0 0 0-1.414zM19.586 28H18v-1.586l5-5L24.586 23zM26 21.586L24.414 20L26 18.414L27.586 20z"
		fill="currentColor"
	/>
	<path
		d="M20 13v-2h-2.142a3.94 3.94 0 0 0-.425-1.019l1.517-1.517l-1.414-1.414l-1.517 1.517A3.944 3.944 0 0 0 15 8.142V6h-2v2.142a3.944 3.944 0 0 0-1.019.425L10.464 7.05L9.05 8.464l1.517 1.517A3.94 3.94 0 0 0 10.142 11H8v2h2.142a3.94 3.94 0 0 0 .425 1.019L9.05 15.536l1.414 1.414l1.517-1.517a3.944 3.944 0 0 0 1.019.425V18h2v-2.142a3.944 3.944 0 0 0 1.019-.425l1.517 1.517l1.414-1.414l-1.517-1.517A3.94 3.94 0 0 0 17.858 13zm-6 1a2 2 0 1 1 2-2a2.002 2.002 0 0 1-2 2z"
		fill="currentColor"
	/>
	<path
		d="M12 30H6a2.002 2.002 0 0 1-2-2V4a2.002 2.002 0 0 1 2-2h16a2.002 2.002 0 0 1 2 2v10h-2V4H6v24h6z"
		fill="currentColor"
	/>
</svg>
