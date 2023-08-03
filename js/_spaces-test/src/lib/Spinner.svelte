<span class="loader" />

<style>
	.loader {
		display: block;
		position: relative;
		animation: shadowPulse 2s linear infinite;
		box-sizing: border-box;
		margin: var(--spacing-xxl) 0 var(--spacing-lg) var(--spacing-xxl) !important;
		box-shadow:
			-24px 0 #fff,
			24px 0 #fff;
		border-radius: 50%;
		background: #fff;
		width: 16px;
		height: 16px;
	}

	@keyframes shadowPulse {
		33% {
			box-shadow:
				-24px 0 #ff3d00,
				24px 0 #fff;
			background: #fff;
		}
		66% {
			box-shadow:
				-24px 0 #fff,
				24px 0 #fff;
			background: #ff3d00;
		}
		100% {
			box-shadow:
				-24px 0 #fff,
				24px 0 #ff3d00;
			background: #fff;
		}
	}

	.loader {
		transform: scale(0.4) translateY(7px);
	}
</style>
