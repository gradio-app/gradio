<script lang="ts">
	let checkbox_checked = false;
</script>

<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full">
		<label class="gradio-checkbox-container">
			<input
				type="checkbox"
				bind:checked={checkbox_checked}
				class="gradio-checkbox"
			/>
			<span class="gradio-checkbox-label">Accept terms</span>
		</label>
	</div>
	<a
		href="/docs/gradio/checkbox"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Checkbox
	</a>
</div>

<style>
	.gradio-checkbox-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.gradio-checkbox {
		appearance: none;
		-webkit-appearance: none;
		width: 1rem;
		height: 1rem;
		border: 1px solid rgb(209 213 219);
		border-radius: 0.25rem;
		background-color: white;
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
	}

	.gradio-checkbox:hover {
		border-color: rgb(209 213 219);
		background-color: rgb(249 250 251);
	}

	.gradio-checkbox:checked {
		background-color: rgb(249 115 22);
		border-color: rgb(249 115 22);
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
		background-size: 100% 100%;
		background-position: center;
		background-repeat: no-repeat;
	}

	.gradio-checkbox-label {
		color: rgb(31 41 55);
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:global(.dark) .gradio-checkbox {
		border-color: rgb(64 64 64);
		background-color: rgb(23 23 23);
	}

	:global(.dark) .gradio-checkbox:hover {
		border-color: rgb(82 82 82);
		background-color: rgb(38 38 38);
	}

	:global(.dark) .gradio-checkbox:checked {
		background-color: rgb(249 115 22);
		border-color: rgb(249 115 22);
	}

	:global(.dark) .gradio-checkbox-label {
		color: rgb(229 231 235);
	}
</style>
