<div class="flex flex-col items-center w-full h-full pb-2">
	<div
		class="flex-1 flex flex-col items-center justify-center w-full px-2 gap-1"
	>
		<div class="annotated-image-wrapper">
			<div class="annotated-image-container">
				<img src="/dog.jpg" alt="Annotated" class="annotated-base-image" />
				<div class="annotation-mask annotation-mask-1"></div>
				<div class="annotation-mask annotation-mask-2"></div>
			</div>
		</div>
		<div class="annotation-legend">
			<button class="legend-item legend-1">Face</button>
			<button class="legend-item legend-2">Ear</button>
		</div>
	</div>
	<a
		href="/docs/gradio/annotatedimage"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>AnnotatedImage</a
	>
</div>

<style>
	.annotated-image-wrapper {
		width: 100%;
		position: relative;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.annotated-image-container {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.annotated-base-image {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.annotation-mask {
		position: absolute;
		opacity: 0.85;
		transition: opacity 0.2s ease-in-out;
		pointer-events: none;
	}

	.annotated-image-container:hover .annotation-mask {
		opacity: 0.3;
	}

	.annotation-mask-1 {
		top: 20%;
		left: 25%;
		width: 50%;
		height: 55%;
		background: radial-gradient(
			ellipse at center,
			hsla(0, 100%, 50%, 0.7) 0%,
			hsla(0, 100%, 50%, 0.5) 40%,
			transparent 70%
		);
	}

	.annotation-mask-2 {
		top: 15%;
		right: 10%;
		width: 35%;
		height: 40%;
		background: radial-gradient(
			ellipse at center,
			hsla(120, 100%, 50%, 0.7) 0%,
			hsla(120, 100%, 50%, 0.5) 40%,
			transparent 70%
		);
	}

	.annotation-legend {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	.legend-item {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		color: rgb(31 41 55);
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: all 0.15s ease;
	}

	.legend-item:hover {
		opacity: 0.8;
	}

	.legend-item.legend-1 {
		background-color: hsla(0, 100%, 50%, 0.3);
	}

	.legend-item.legend-2 {
		background-color: hsla(120, 100%, 50%, 0.3);
	}

	:global(.dark) .legend-item {
		color: rgb(229 231 235);
	}
</style>
