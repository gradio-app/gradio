<svg
	width="1em"
	height="1em"
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		class="up-arrow"
		d="M7 10l5-5 5 5"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		class="down-arrow"
		d="M7 14l5 5 5-5"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

<style>
	svg {
		fill: none;
		display: block;
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	:global(.sort-button.des) .up-arrow {
		opacity: 0.2;
	}

	:global(.sort-button:not(.des)) .down-arrow {
		opacity: 0.2;
	}

	:global(.sort-button:not(.sorted)) .up-arrow,
	:global(.sort-button:not(.sorted)) .down-arrow {
		opacity: 1;
	}
</style>
