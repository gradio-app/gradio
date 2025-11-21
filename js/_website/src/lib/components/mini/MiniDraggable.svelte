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
		href="/docs/gradio/dataframe"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>Draggable</a
	>
</div>

<style>
	.gradio-draggable {
		width: 100%;
		background-color: white;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		padding: 0.5rem;
	}

	.draggable-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		background-color: rgb(249 250 251);
		border: 1px solid rgb(229 231 235);
		border-radius: 0.25rem;
		margin-bottom: 0.375rem;
		cursor: move;
		transition: all 0.15s ease;
	}

	.draggable-item:last-child {
		margin-bottom: 0;
	}

	.draggable-item:hover {
		background-color: rgb(243 244 246);
		border-color: rgb(209 213 219);
	}

	.draggable-item.drag-over {
		border-color: rgb(249 115 22);
		background-color: rgba(249, 115, 22, 0.1);
	}

	.drag-handle {
		color: rgb(156 163 175);
		font-size: 0.75rem;
		cursor: grab;
		user-select: none;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.draggable-content {
		color: rgb(31 41 55);
		font-size: 0.75rem;
		flex: 1;
	}

	:global(.dark) .gradio-draggable {
		background-color: rgb(23 23 23);
		border-color: rgb(64 64 64);
	}

	:global(.dark) .draggable-item {
		background-color: rgb(38 38 38);
		border-color: rgb(64 64 64);
	}

	:global(.dark) .draggable-item:hover {
		background-color: rgb(50 50 50);
		border-color: rgb(82 82 82);
	}

	:global(.dark) .draggable-item.drag-over {
		border-color: rgb(249 115 22);
		background-color: rgba(249, 115, 22, 0.15);
	}

	:global(.dark) .drag-handle {
		color: rgb(115 115 115);
	}

	:global(.dark) .draggable-content {
		color: rgb(229 231 235);
	}
</style>
