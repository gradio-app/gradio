<svg
	xmlns="http://www.w3.org/2000/svg"
	width="100%"
	height="100%"
	viewBox="0 0 50 50"
>
	<circle
		cx="25"
		cy="25"
		r="20"
		fill="none"
		stroke-width="3.0"
		stroke-linecap="round"
		stroke-dasharray="94.2477796076938 94.2477796076938"
		stroke-dashoffset="0"
	>
		<animateTransform
			attributeName="transform"
			type="rotate"
			from="0 25 25"
			to="360 25 25"
			repeatCount="indefinite"
		/>
	</circle>
</svg>

<style>
	svg {
		animation: spin 1.5s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
