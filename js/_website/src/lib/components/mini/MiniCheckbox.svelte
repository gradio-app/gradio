<script lang="ts">
	let checkbox_checked = false;
</script>

<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full">
		<label class="gradio-checkbox-container">
			<input type="checkbox" bind:checked={checkbox_checked} class="gradio-checkbox" />
			<span class="gradio-checkbox-label">Accept terms</span>
		</label>
	</div>
	<a
		href="/docs/checkbox"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Checkbox
	</a>
</div>
