<div class="flex flex-col items-center w-full h-full pb-2 overflow-hidden">
	<div class="flex-1 flex items-center justify-center w-full overflow-hidden">
		<div class="gradio-model3d-container">
			<div class="model3d-scene">
				<div class="model3d-cube">
					<div class="cube-face front"></div>
					<div class="cube-face back"></div>
					<div class="cube-face right"></div>
					<div class="cube-face left"></div>
					<div class="cube-face top"></div>
					<div class="cube-face bottom"></div>
				</div>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/model3d"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Model3D
	</a>
</div>

<style>
	.gradio-model3d-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			135deg,
			rgb(243 244 246) 0%,
			rgb(229 231 235) 100%
		);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.5rem;
		min-height: 85px;
		pointer-events: none !important;
	}

	.model3d-scene {
		width: 60px;
		height: 60px;
		position: relative;
	}

	.model3d-cube {
		width: 100%;
		height: 100%;
		position: relative;
		animation: rotate2d 4s linear infinite;
		transform-origin: center center;
	}

	@keyframes rotate2d {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.cube-face {
		position: absolute;
		width: 60px;
		height: 60px;
		border: 2px solid rgb(249 115 22);
		opacity: 0.9;
		pointer-events: none !important;
		background: linear-gradient(
			135deg,
			rgba(249, 115, 22, 0.8),
			rgba(251, 146, 60, 0.6)
		);
	}

	.cube-face.front {
		top: 0;
		left: 0;
	}

	.cube-face.back {
		top: 0;
		left: 0;
		opacity: 0.3;
	}

	.cube-face.right {
		display: none;
	}

	.cube-face.left {
		display: none;
	}

	.cube-face.top {
		display: none;
	}

	.cube-face.bottom {
		display: none;
	}

	:global(.dark) .gradio-model3d-container {
		background: linear-gradient(135deg, rgb(38 38 38) 0%, rgb(23 23 23) 100%);
		border-color: rgb(64 64 64);
	}
</style>
