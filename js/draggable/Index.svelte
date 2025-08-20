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
	let dragged_index = -1;
	let items: HTMLElement[] = [];
	let is_horizontal = orientation === "row";
	let drag_preview: HTMLElement | null = null;
	let current_drop_target: HTMLElement | null = null;

	function setup_drag_and_drop() {
		if (!container_el) return;
		
		items = [];
		
		const children = Array.from(container_el.children) as HTMLElement[];
		children.forEach((child, index) => {
			if (child.classList.contains("status-tracker")) return;
			
			items.push(child);
			child.setAttribute("draggable", "true");
			child.setAttribute("data-index", index.toString());
			child.setAttribute("aria-grabbed", "false");
			
			// Add drag event listeners to the child
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
		
		// Create drag preview
		drag_preview = target.cloneNode(true) as HTMLElement;
		drag_preview.classList.add("drag-preview");
		drag_preview.style.position = "fixed";
		drag_preview.style.top = "-1000px";
		drag_preview.style.left = "-1000px";
		drag_preview.style.opacity = "0.7";
		drag_preview.style.pointerEvents = "none";
		drag_preview.style.zIndex = "1000";
		document.body.appendChild(drag_preview);
		
		// Update ARIA
		target.setAttribute("aria-grabbed", "true");
		target.classList.add("dragging");
		
		// Announce to screen readers
		announce_to_screen_reader(`Started dragging item ${dragged_index + 1}`);
		
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", target.outerHTML);
		}
	}

	function handle_drag_end(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		
		const target = e.currentTarget as HTMLElement;
		target.classList.remove("dragging");
		target.setAttribute("aria-grabbed", "false");
		
		// Remove drag preview
		if (drag_preview && drag_preview.parentNode) {
			drag_preview.parentNode.removeChild(drag_preview);
			drag_preview = null;
		}
		
		// Remove dashed border from current drop target
		if (current_drop_target) {
			current_drop_target.style.border = "";
			current_drop_target.style.borderRadius = "";
			current_drop_target = null;
		}
		
		dragged_el = null;
		dragged_index = -1;
		
		// Announce to screen readers
		announce_to_screen_reader("Drag operation completed");
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
		if (target === dragged_el) return;
		
		// Remove border from previous drop target
		if (current_drop_target && current_drop_target !== target) {
			current_drop_target.style.border = "";
			current_drop_target.style.borderRadius = "";
		}
		
		// Add dashed border to the new target component
		target.style.border = "2px dashed var(--border-color-primary)";
		target.style.borderRadius = "8px";
		current_drop_target = target;
		
		target.classList.add("drag-over");
		
		// Announce to screen readers
		const target_index = parseInt(target.dataset.index || "-1");
		announce_to_screen_reader(`Can drop item ${dragged_index + 1} at position ${target_index + 1}`);
	}

	function handle_drag_leave(e: DragEvent) {
		// Don't remove the border on dragleave - keep it until drop
		// This prevents the border from flickering as you move the cursor
	}

	async function handle_drop(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		
		const target = e.currentTarget as HTMLElement;
		target.classList.remove("drag-over");
		
		// Remove dashed border
		if (current_drop_target) {
			current_drop_target.style.border = "";
			current_drop_target.style.borderRadius = "";
			current_drop_target = null;
		}
		
		if (dragged_el && dragged_el !== target && container_el) {
			const target_index = parseInt(target.dataset.index || "-1");
			
			// Create a temporary placeholder to mark where the dragged element was
			const placeholder = document.createElement("div");
			placeholder.style.display = "none";
			container_el.insertBefore(placeholder, dragged_el);
			
			// Move the dragged element to the target's position
			container_el.insertBefore(dragged_el, target);
			
			// Move the target element to where the dragged element was
			container_el.insertBefore(target, placeholder);
			
			// Remove the placeholder
			container_el.removeChild(placeholder);
			
			// Announce the reordering to screen readers
			announce_to_screen_reader(`Swapped item ${dragged_index + 1} with item ${target_index + 1}`);
			
			await tick();
			setup_drag_and_drop();
		}
		
		return false;
	}

	function announce_to_screen_reader(message: string) {
		// Create a live region for screen reader announcements
		let live_region = document.getElementById("drag-announcements");
		if (!live_region) {
			live_region = document.createElement("div");
			live_region.id = "drag-announcements";
			live_region.setAttribute("aria-live", "polite");
			live_region.setAttribute("aria-atomic", "true");
			live_region.style.position = "absolute";
			live_region.style.left = "-10000px";
			live_region.style.width = "1px";
			live_region.style.height = "1px";
			live_region.style.overflow = "hidden";
			document.body.appendChild(live_region);
		}
		
		live_region.textContent = message;
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
	role="region"
	aria-label="Draggable items container"
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

	.draggable > :global(.dragging) {
		opacity: 0.5;
		transform: scale(1.02);
		z-index: 1001;
	}

	.draggable > :global(.reordering) {
		transition: all 0.3s ease;
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 1000;
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