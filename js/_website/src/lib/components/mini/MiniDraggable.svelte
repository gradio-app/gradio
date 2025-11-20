<script lang="ts">
	let draggable_items = ["Item 1", "Item 2", "Item 3"];
	let drag_over_index: number | null = null;

	function handle_drag_start(e: DragEvent, index: number) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", index.toString());
		}
	}

	function handle_drag_over(e: DragEvent, index: number) {
		e.preventDefault();
		drag_over_index = index;
	}

	function handle_drag_leave() {
		drag_over_index = null;
	}

	function handle_drop(e: DragEvent, drop_index: number) {
		e.preventDefault();
		const drag_index = parseInt(e.dataTransfer?.getData("text/plain") || "");
		if (!isNaN(drag_index) && drag_index !== drop_index) {
			const items = [...draggable_items];
			const [removed] = items.splice(drag_index, 1);
			items.splice(drop_index, 0, removed);
			draggable_items = items;
		}
		drag_over_index = null;
	}
</script>

<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div class="gradio-draggable">
			{#each draggable_items as item, idx}
				<div
					class="draggable-item"
					class:drag-over={drag_over_index === idx}
					draggable="true"
					on:dragstart={(e) => handle_drag_start(e, idx)}
					on:dragover={(e) => handle_drag_over(e, idx)}
					on:dragleave={handle_drag_leave}
					on:drop={(e) => handle_drop(e, idx)}
					role="button"
					tabindex="0"
				>
					<span class="drag-handle">⋮⋮</span>
					<span class="draggable-content">{item}</span>
				</div>
			{/each}
		</div>
	</div>
	<a
		href="/docs/dataframe"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>Draggable</a
	>
</div>
