<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";
	import { onMount, tick } from "svelte";

	export let elem_id: string;
	export let elem_classes: string[] = [];
	export let visible = true;
	export let orientation: "row" | "column" = "row";
	export let loading_status: LoadingStatus | undefined = undefined;
	export let gradio: Gradio | undefined = undefined;
	export let show_progress = false;

	let container_el: HTMLDivElement;
	let dragged_el: HTMLElement | null = null;
	let dragged_index: number = -1;
	let items: HTMLElement[] = [];
	let is_horizontal = orientation === "row";

	function setup_drag_and_drop() {
		if (!container_el) return;
		
		items = [];
		
		const children = Array.from(container_el.children) as HTMLElement[];
		children.forEach((child, index) => {
			if (child.classList.contains("status-tracker")) return;
			
			items.push(child);
			child.setAttribute("draggable", "true");
			child.setAttribute("data-index", index.toString());
			
			child.removeEventListener("dragstart", handle_drag_start);
			child.removeEventListener("dragend", handle_drag_end);
			child.removeEventListener("dragover", handle_drag_over);
			child.removeEventListener("drop", handle_drop);
			child.removeEventListener("dragenter", handle_drag_enter);
			child.removeEventListener("dragleave", handle_drag_leave);
			
			child.addEventListener("dragstart", handle_drag_start);
			child.addEventListener("dragend", handle_drag_end);
			child.addEventListener("dragover", handle_drag_over);
			child.addEventListener("drop", handle_drop);
			child.addEventListener("dragenter", handle_drag_enter);
			child.addEventListener("dragleave", handle_drag_leave);
		});
	}

	function handle_drag_start(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		
		const target = e.currentTarget as HTMLElement;
		dragged_el = target;
		dragged_index = parseInt(target.dataset.index || "-1");
		
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", target.outerHTML);
		}
		
		target.classList.add("dragging");
	}

	function handle_drag_end(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		
		const target = e.currentTarget as HTMLElement;
		target.classList.remove("dragging");
		
		dragged_el = null;
		dragged_index = -1;
	}

	function handle_drag_over(e: DragEvent) {
		if (e.preventDefault) {
			e.preventDefault();
		}
		
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
		
		return false;
	}

	function handle_drag_enter(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		
		const target = e.currentTarget as HTMLElement;
		target.classList.add("drag-over");
	}

	function handle_drag_leave(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		
		const target = e.currentTarget as HTMLElement;
		target.classList.remove("drag-over");
	}

	async function handle_drop(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		
		const target = e.currentTarget as HTMLElement;
		target.classList.remove("drag-over");
		
		if (dragged_el && dragged_el !== target && container_el) {
			const target_index = parseInt(target.dataset.index || "-1");
			
			const rect = target.getBoundingClientRect();
			const midpoint = is_horizontal ? 
				rect.left + rect.width / 2 : 
				rect.top + rect.height / 2;
			
			const cursor_pos = is_horizontal ? e.clientX : e.clientY;
			const insert_before = cursor_pos < midpoint;
			
			if (insert_before) {
				container_el.insertBefore(dragged_el, target);
			} else {
				if (target.nextSibling) {
					container_el.insertBefore(dragged_el, target.nextSibling);
				} else {
					container_el.appendChild(dragged_el);
				}
			}
			
			await tick();
			setup_drag_and_drop();
		}
		
		return false;
	}

	onMount(() => {
		setup_drag_and_drop();
		
		const observer = new MutationObserver(() => {
			setup_drag_and_drop();
		});
		
		if (container_el) {
			observer.observe(container_el, {
				childList: true,
				subtree: false
			});
		}
		
		return () => {
			observer.disconnect();
			
			items.forEach(item => {
				item.removeEventListener("dragstart", handle_drag_start);
				item.removeEventListener("dragend", handle_drag_end);
				item.removeEventListener("dragover", handle_drag_over);
				item.removeEventListener("drop", handle_drop);
				item.removeEventListener("dragenter", handle_drag_enter);
				item.removeEventListener("dragleave", handle_drag_leave);
			});
		};
	});

	$: is_horizontal = orientation === "row";
</script>

<div
	bind:this={container_el}
	class:hide={!visible}
	class:horizontal={is_horizontal}
	class:vertical={!is_horizontal}
	id={elem_id}
	class="draggable {elem_classes.join(' ')}"
>
	{#if loading_status && show_progress && gradio}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			status={loading_status
				? loading_status.status == "pending"
					? "generating"
					: loading_status.status
				: null}
		/>
	{/if}
	<slot />
</div>

<style>
	.draggable {
		display: flex;
		gap: var(--layout-gap);
		width: var(--size-full);
		position: relative;
	}

	.horizontal {
		flex-direction: row;
		flex-wrap: wrap;
	}

	.vertical {
		flex-direction: column;
	}

	.hide {
		display: none;
	}

	.draggable > :global(*) {
		transition: transform 0.2s ease;
	}

	.draggable > :global(.drag-over) {
		transform: scale(0.98);
		opacity: 0.8;
	}

	.draggable > :global(*:hover) {
		cursor: grab;
	}

	.draggable > :global(*:active) {
		cursor: grabbing;
	}

	.horizontal > :global(*),
	.horizontal > :global(.form > *) {
		flex: 1 1 0%;
		flex-wrap: wrap;
		min-width: min(160px, 100%);
	}

	.vertical > :global(*),
	.vertical > :global(.form > *) {
		width: var(--size-full);
	}
</style>