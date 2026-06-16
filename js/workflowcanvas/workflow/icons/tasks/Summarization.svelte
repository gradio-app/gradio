<script lang="ts">
	interface Props {
		classNames?: string;
	}
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
	viewBox="0 0 18 19"
>
	<path
		d="M15.4988 8.79309L12.1819 5.47621C12.0188 5.25871 11.7469 5.14996 11.475 5.14996H7.12501C6.52688 5.14996 6.03751 5.63934 6.03751 6.23746V16.025C6.03751 16.6231 6.52688 17.1125 7.12501 17.1125H14.7375C15.3356 17.1125 15.825 16.6231 15.825 16.025V9.55434C15.825 9.28246 15.7163 9.01059 15.4988 8.79309V8.79309ZM11.475 6.23746L14.6831 9.49996H11.475V6.23746ZM7.12501 16.025V6.23746H10.3875V9.49996C10.3875 10.0981 10.8769 10.5875 11.475 10.5875H14.7375V16.025H7.12501Z"
	/>
	<path
		d="M3.8625 10.5875H2.775V2.97498C2.775 2.37686 3.26438 1.88748 3.8625 1.88748H11.475V2.97498H3.8625V10.5875Z"
	/>
</svg>
