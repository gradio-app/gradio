<span class="loader" />

<style>
	.loader {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: block;
		margin: var(--spacing-xxl) 0 var(--spacing-lg) var(--spacing-xxl) !important;
		position: relative;
		background: #fff;
		box-shadow: -24px 0 #fff, 24px 0 #fff;
		box-sizing: border-box;
		animation: shadowPulse 2s linear infinite;
	}

	@keyframes shadowPulse {
		33% {
			background: #fff;
			box-shadow: -24px 0 #ff3d00, 24px 0 #fff;
		}
		66% {
			background: #ff3d00;
			box-shadow: -24px 0 #fff, 24px 0 #fff;
		}
		100% {
			background: #fff;
			box-shadow: -24px 0 #fff, 24px 0 #ff3d00;
		}
	}

	.loader {
		transform: scale(0.4) translateY(7px);
	}
</style>
