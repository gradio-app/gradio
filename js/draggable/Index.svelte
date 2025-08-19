<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";
	import { onMount, tick } from "svelte";

	export let elem_id: string;
	export let elem_classes: string[] = [];
	export let visible = true;
	export let variant: "default" | "panel" | "compact" = "default";
	export let loading_status: LoadingStatus | undefined = undefined;
	export let gradio: Gradio | undefined = undefined;
	export let show_progress = false;
	export let height: number | string | undefined;
	export let min_height: number | string | undefined;
	export let max_height: number | string | undefined;

	let containerEl: HTMLDivElement;
	let draggedEl: HTMLElement | null = null;
	let draggedIndex: number = -1;
	let dropTargetIndex: number = -1;
	let items: HTMLElement[] = [];
	let isHorizontal = false;
	let dragPlaceholder: HTMLDivElement | null = null;

	const get_dimension = (
		dimension_value: string | number | undefined
	): string | undefined => {
		if (dimension_value === undefined) {
			return undefined;
		}
		if (typeof dimension_value === "number") {
			return dimension_value + "px";
		} else if (typeof dimension_value === "string") {
			return dimension_value;
		}
	};

	function detectLayout() {
		if (!containerEl) return;
		
		// Check parent's layout direction
		const parent = containerEl.parentElement;
		if (parent) {
			const computedStyle = window.getComputedStyle(parent);
			const flexDirection = computedStyle.flexDirection;
			
			// If parent is a row or has row flex-direction, continue horizontally
			// Otherwise, layout vertically
			isHorizontal = flexDirection === "row" || flexDirection === "row-reverse" || 
						  parent.classList.contains("row");
		}
	}

	function setupDragAndDrop() {
		if (!containerEl) return;
		
		// Get all direct children that are draggable
		items = Array.from(containerEl.children).filter(
			(child): child is HTMLElement => 
				child instanceof HTMLElement && !child.classList.contains("drag-placeholder")
		);
		
		items.forEach((item, index) => {
			item.draggable = true;
			item.style.cursor = "grab";
			item.dataset.index = index.toString();
			
			// Add drag event listeners
			item.addEventListener("dragstart", handleDragStart);
			item.addEventListener("dragend", handleDragEnd);
			item.addEventListener("dragover", handleDragOver);
			item.addEventListener("drop", handleDrop);
			item.addEventListener("dragenter", handleDragEnter);
			item.addEventListener("dragleave", handleDragLeave);
		});
	}

	function handleDragStart(e: DragEvent) {
		const target = e.currentTarget as HTMLElement;
		draggedEl = target;
		draggedIndex = parseInt(target.dataset.index || "-1");
		
		// Add dragging styles
		target.style.opacity = "0.5";
		target.style.cursor = "grabbing";
		
		// Set drag effect
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", target.innerHTML);
		}
	}

	function handleDragEnd(e: DragEvent) {
		const target = e.currentTarget as HTMLElement;
		
		// Remove dragging styles
		target.style.opacity = "";
		target.style.cursor = "grab";
		
		// Remove any placeholders
		if (dragPlaceholder && dragPlaceholder.parentNode) {
			dragPlaceholder.parentNode.removeChild(dragPlaceholder);
			dragPlaceholder = null;
		}
		
		// Reset all hover states
		items.forEach(item => {
			item.classList.remove("drag-over");
		});
		
		draggedEl = null;
		draggedIndex = -1;
		dropTargetIndex = -1;
	}

	function handleDragOver(e: DragEvent) {
		if (e.preventDefault) {
			e.preventDefault(); // Allows us to drop
		}
		
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
		
		return false;
	}

	function handleDragEnter(e: DragEvent) {
		const target = e.currentTarget as HTMLElement;
		if (target !== draggedEl) {
			target.classList.add("drag-over");
			
			// Create and show placeholder
			if (!dragPlaceholder) {
				dragPlaceholder = document.createElement("div");
				dragPlaceholder.className = "drag-placeholder";
				dragPlaceholder.style.transition = "all 0.2s ease";
			}
			
			// Calculate where to show placeholder
			const targetIndex = parseInt(target.dataset.index || "-1");
			if (targetIndex !== -1 && draggedIndex !== -1) {
				const rect = target.getBoundingClientRect();
				const midpoint = isHorizontal ? 
					rect.left + rect.width / 2 : 
					rect.top + rect.height / 2;
				
				const cursorPos = isHorizontal ? e.clientX : e.clientY;
				const insertBefore = cursorPos < midpoint;
				
				dropTargetIndex = insertBefore ? targetIndex : targetIndex + 1;
				
				// Show placeholder
				if (draggedEl) {
					const draggedRect = draggedEl.getBoundingClientRect();
					if (isHorizontal) {
						dragPlaceholder.style.width = draggedRect.width + "px";
						dragPlaceholder.style.height = "100%";
					} else {
						dragPlaceholder.style.width = "100%";
						dragPlaceholder.style.height = draggedRect.height + "px";
					}
				}
			}
		}
	}

	function handleDragLeave(e: DragEvent) {
		const target = e.currentTarget as HTMLElement;
		target.classList.remove("drag-over");
	}

	async function handleDrop(e: DragEvent) {
		if (e.stopPropagation) {
			e.stopPropagation(); // stops some browsers from redirecting
		}
		
		const target = e.currentTarget as HTMLElement;
		target.classList.remove("drag-over");
		
		if (draggedEl && draggedEl !== target && containerEl) {
			const targetIndex = parseInt(target.dataset.index || "-1");
			
			// Calculate drop position based on cursor position
			const rect = target.getBoundingClientRect();
			const midpoint = isHorizontal ? 
				rect.left + rect.width / 2 : 
				rect.top + rect.height / 2;
			
			const cursorPos = isHorizontal ? e.clientX : e.clientY;
			const insertBefore = cursorPos < midpoint;
			
			// Reorder the DOM elements
			if (insertBefore) {
				containerEl.insertBefore(draggedEl, target);
			} else {
				// Insert after target
				if (target.nextSibling) {
					containerEl.insertBefore(draggedEl, target.nextSibling);
				} else {
					containerEl.appendChild(draggedEl);
				}
			}
			
			// Wait for DOM update then re-setup drag handlers
			await tick();
			setupDragAndDrop();
		}
		
		return false;
	}

	onMount(() => {
		detectLayout();
		setupDragAndDrop();
		
		// Re-detect layout on window resize
		const resizeObserver = new ResizeObserver(() => {
			detectLayout();
		});
		
		if (containerEl) {
			resizeObserver.observe(containerEl);
		}
		
		return () => {
			resizeObserver.disconnect();
			
			// Clean up event listeners
			items.forEach(item => {
				item.removeEventListener("dragstart", handleDragStart);
				item.removeEventListener("dragend", handleDragEnd);
				item.removeEventListener("dragover", handleDragOver);
				item.removeEventListener("drop", handleDrop);
				item.removeEventListener("dragenter", handleDragEnter);
				item.removeEventListener("dragleave", handleDragLeave);
			});
		};
	});

	// Re-setup when children change
	$: if (containerEl) {
		const observer = new MutationObserver(() => {
			setupDragAndDrop();
		});
		
		observer.observe(containerEl, {
			childList: true,
			subtree: false
		});
	}
</script>

<div
	bind:this={containerEl}
	class:compact={variant === "compact"}
	class:panel={variant === "panel"}
	class:hide={!visible}
	class:horizontal={isHorizontal}
	class:vertical={!isHorizontal}
	style:height={get_dimension(height)}
	style:max-height={get_dimension(max_height)}
	style:min-height={get_dimension(min_height)}
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

	.compact > :global(*),
	.compact :global(.box) {
		border-radius: 0;
	}

	.compact,
	.panel {
		border-radius: var(--container-radius);
		background: var(--background-fill-secondary);
		padding: var(--size-2);
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

	:global(.drag-placeholder) {
		background: var(--background-fill-primary);
		border: 2px dashed var(--border-color-primary);
		border-radius: var(--radius-md);
		opacity: 0.5;
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