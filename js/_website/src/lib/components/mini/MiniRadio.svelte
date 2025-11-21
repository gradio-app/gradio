<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full">
		<div class="gradio-radio-group">
			<label class="gradio-radio-item">
				<input type="radio" name="radio-demo" class="gradio-radio" checked />
				<span class="gradio-radio-label">Option 1</span>
			</label>
			<label class="gradio-radio-item">
				<input type="radio" name="radio-demo" class="gradio-radio" />
				<span class="gradio-radio-label">Option 2</span>
			</label>
		</div>
	</div>
	<a
		href="/docs/gradio/radio"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>Radio</a
	>
</div>

<style>
	.gradio-radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.gradio-radio-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.gradio-radio {
		appearance: none;
		-webkit-appearance: none;
		width: 1rem;
		height: 1rem;
		border: 1px solid rgb(209 213 219);
		border-radius: 50%;
		background-color: white;
		flex-shrink: 0;
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
	}

	.gradio-radio:hover {
		border-color: rgb(209 213 219);
		background-color: rgb(249 250 251);
	}

	.gradio-radio:checked {
		border-color: rgb(249 115 22);
		background-color: white;
	}

	.gradio-radio:checked::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0.5rem;
		height: 0.5rem;
		background-color: rgb(249 115 22);
		border-radius: 50%;
	}

	.gradio-radio-label {
		color: rgb(31 41 55);
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:global(.dark) .gradio-radio {
		border-color: rgb(64 64 64);
		background-color: rgb(23 23 23);
	}

	:global(.dark) .gradio-radio:hover {
		border-color: rgb(82 82 82);
		background-color: rgb(38 38 38);
	}

	:global(.dark) .gradio-radio:checked {
		border-color: rgb(249 115 22);
		background-color: rgb(23 23 23);
	}

	:global(.dark) .gradio-radio-label {
		color: rgb(229 231 235);
	}
</style>
