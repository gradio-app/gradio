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
	let drag_preview: HTMLElement | null = null;
	let current_drop_target: HTMLElement | null = null;

	function setup_drag_and_drop(): void {
		if (!container_el) return;

		items.forEach((item) => {
			item.removeEventListener("dragstart", handle_drag_start);
			item.removeEventListener("dragend", handle_drag_end);
			item.removeEventListener("dragover", handle_drag_over);
			item.removeEventListener("drop", handle_drop);
			item.removeEventListener("dragenter", handle_drag_enter);
		});

		items = [];

		const children = Array.from(container_el.children) as HTMLElement[];
		let itemIndex = 0;

		children.forEach((child) => {
			if (child.classList.contains("status-tracker")) return;

			if (child.classList.contains("form") && child.children.length > 0) {
				const formChildren = Array.from(child.children) as HTMLElement[];
				formChildren.forEach((formChild) => {
					items.push(formChild);
					formChild.classList.add("draggable-item");
					formChild.setAttribute("draggable", "true");
					formChild.setAttribute("data-index", itemIndex.toString());
					formChild.setAttribute("aria-grabbed", "false");

					formChild.addEventListener("dragstart", handle_drag_start);
					formChild.addEventListener("dragend", handle_drag_end);
					formChild.addEventListener("dragover", handle_drag_over);
					formChild.addEventListener("drop", handle_drop);
					formChild.addEventListener("dragenter", handle_drag_enter);

					itemIndex++;
				});
			} else {
				items.push(child);
				child.classList.add("draggable-item");
				child.setAttribute("draggable", "true");
				child.setAttribute("data-index", itemIndex.toString());
				child.setAttribute("aria-grabbed", "false");

				child.addEventListener("dragstart", handle_drag_start);
				child.addEventListener("dragend", handle_drag_end);
				child.addEventListener("dragover", handle_drag_over);
				child.addEventListener("drop", handle_drop);
				child.addEventListener("dragenter", handle_drag_enter);

				itemIndex++;
			}
		});
	}

	function handle_drag_start(e: DragEvent): void {
		e.stopPropagation?.();

		const target = e.currentTarget as HTMLElement;
		dragged_el = target;
		dragged_index = parseInt(target.dataset.index || "-1");

		drag_preview = target.cloneNode(true) as HTMLElement;
		drag_preview.classList.add("drag-preview");
		document.body.appendChild(drag_preview);

		target.setAttribute("aria-grabbed", "true");
		target.classList.add("dragging");

		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", target.outerHTML);
		}
	}

	function handle_drag_end(e: DragEvent): void {
		e.stopPropagation?.();

		const target = e.currentTarget as HTMLElement;
		target.classList.remove("dragging");
		target.setAttribute("aria-grabbed", "false");

		drag_preview?.remove();
		drag_preview = null;

		if (current_drop_target) {
			current_drop_target.style.border = "";
			current_drop_target.style.borderRadius = "";
			current_drop_target = null;
		}

		dragged_el = null;
		dragged_index = -1;
	}

	function handle_drag_over(e: DragEvent): boolean {
		e.preventDefault();
		e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		return false;
	}

	function handle_drag_enter(e: DragEvent): void {
		e.stopPropagation?.();

		const target = e.currentTarget as HTMLElement;
		if (target === dragged_el) return;

		if (!dragged_el || !container_el) return;

		const draggedParent = dragged_el.parentElement;
		const targetParent = target.parentElement;

		const isDraggedInForm =
			draggedParent?.classList.contains("form") &&
			draggedParent.parentElement === container_el;
		const isTargetInForm =
			targetParent?.classList.contains("form") &&
			targetParent.parentElement === container_el;
		const isDraggedDirect = draggedParent === container_el;
		const isTargetDirect = targetParent === container_el;

		if (
			!(
				(isDraggedInForm || isDraggedDirect) &&
				(isTargetInForm || isTargetDirect)
			)
		) {
			return;
		}

		if (current_drop_target && current_drop_target !== target) {
			current_drop_target.style.border = "";
			current_drop_target.style.borderRadius = "";
		}

		target.style.border = "2px dashed var(--border-color-primary)";
		target.style.borderRadius = "8px";
		current_drop_target = target;

		target.classList.add("drag-over");
	}

	async function handle_drop(e: DragEvent): Promise<boolean> {
		e.stopPropagation?.();

		const target = e.currentTarget as HTMLElement;
		target.classList.remove("drag-over");

		if (current_drop_target) {
			current_drop_target.style.border = "";
			current_drop_target.style.borderRadius = "";
			current_drop_target = null;
		}

		if (dragged_el && dragged_el !== target && container_el) {
			const draggedParent = dragged_el.parentElement;
			const targetParent = target.parentElement;

			const isDraggedInForm =
				draggedParent?.classList.contains("form") &&
				draggedParent.parentElement === container_el;
			const isTargetInForm =
				targetParent?.classList.contains("form") &&
				targetParent.parentElement === container_el;
			const isDraggedDirect = draggedParent === container_el;
			const isTargetDirect = targetParent === container_el;

			if (
				!(
					(isDraggedInForm || isDraggedDirect) &&
					(isTargetInForm || isTargetDirect)
				)
			) {
				return false;
			}

			const placeholder = document.createElement("div");
			placeholder.style.display = "none";

			draggedParent!.insertBefore(placeholder, dragged_el);

			targetParent!.insertBefore(dragged_el, target);
			draggedParent!.insertBefore(target, placeholder);

			placeholder.remove();

			await tick();
			setup_drag_and_drop();
		}

		return false;
	}

	onMount(() => {
		setup_drag_and_drop();

		const observer = new MutationObserver(setup_drag_and_drop);

		if (container_el) {
			observer.observe(container_el, {
				childList: true,
				subtree: false
			});
		}

		return () => {
			observer.disconnect();

			items.forEach((item) => {
				item.removeEventListener("dragstart", handle_drag_start);
				item.removeEventListener("dragend", handle_drag_end);
				item.removeEventListener("dragover", handle_drag_over);
				item.removeEventListener("drop", handle_drop);
				item.removeEventListener("dragenter", handle_drag_enter);
			});
		};
	});
</script>

<div
	bind:this={container_el}
	class:hide={!visible}
	class:horizontal={orientation === "row"}
	class:vertical={orientation === "column"}
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

	.draggable > :global(.draggable-item),
	.draggable > :global(.form > .draggable-item) {
		transition: transform 0.2s ease;
	}

	.draggable > :global(.draggable-item.drag-over),
	.draggable > :global(.form > .draggable-item.drag-over) {
		transform: scale(0.98);
		opacity: 0.8;
	}

	.draggable > :global(.draggable-item:hover),
	.draggable > :global(.form > .draggable-item:hover) {
		cursor: grab;
	}

	.draggable > :global(.draggable-item:active),
	.draggable > :global(.form > .draggable-item:active) {
		cursor: grabbing;
	}

	.draggable > :global(.draggable-item.dragging),
	.draggable > :global(.form > .draggable-item.dragging) {
		opacity: 0.5;
		transform: scale(1.02);
		z-index: 1001;
	}

	.draggable > :global(.draggable-item.reordering),
	.draggable > :global(.form > .draggable-item.reordering) {
		transition: all 0.3s ease;
	}

	.horizontal > :global(.draggable-item),
	.horizontal > :global(.form > .draggable-item) {
		flex: 1 1 0%;
		flex-wrap: wrap;
		min-width: min(160px, 100%);
	}

	.vertical > :global(.draggable-item),
	.vertical > :global(.form > .draggable-item) {
		width: var(--size-full);
	}

	.drag-preview {
		position: fixed;
		visibility: hidden;
		opacity: 0.7;
		pointer-events: none;
		z-index: 1000;
	}
</style>
