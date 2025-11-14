<script lang="ts">
	import type { DraggableProps, DraggableEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { StatusTracker } from "@gradio/statustracker";
	import { onMount, tick } from "svelte";

	const props = $props();
	const gradio = new Gradio<DraggableEvents, DraggableProps>(props);

	let container_el: HTMLDivElement;
	let dragged_el: HTMLElement | null = null;
	let dragged_index = -1;
	let items: HTMLElement[] = [];
	let current_drop_target: HTMLElement | null = null;

	const drag_event_handlers = [
		{ event: "dragstart", handler: handle_drag_start },
		{ event: "dragend", handler: handle_drag_end }
	] as const;

	const drop_event_handlers = [
		{ event: "dragover", handler: handle_drag_over },
		{ event: "drop", handler: handle_drop },
		{ event: "dragenter", handler: handle_drag_enter }
	] as const;

	function add_drag_listeners(element: HTMLElement): void {
		drag_event_handlers.forEach(({ event, handler }) => {
			element.addEventListener(event, handler);
		});
	}

	function remove_drag_listeners(element: HTMLElement): void {
		drag_event_handlers.forEach(({ event, handler }) => {
			element.removeEventListener(event, handler);
		});
	}

	function add_drop_listeners(element: HTMLElement): void {
		drop_event_handlers.forEach(({ event, handler }) => {
			element.addEventListener(event, handler);
		});
	}

	function remove_drop_listeners(element: HTMLElement): void {
		drop_event_handlers.forEach(({ event, handler }) => {
			element.removeEventListener(event, handler);
		});
	}

	function setup_draggable_item(element: HTMLElement, index: number): void {
		element.classList.add("draggable-item");
		element.setAttribute("data-index", index.toString());
		element.style.position = "relative";

		const handle = document.createElement("div");
		handle.className = "drag-handle";
		handle.setAttribute("draggable", "true");
		handle.setAttribute("aria-grabbed", "false");
		handle.setAttribute("data-index", index.toString());
		handle.innerHTML = "⋮⋮";

		element.appendChild(handle);
		add_drag_listeners(handle);
		add_drop_listeners(element);
	}

	function setup_drag_and_drop(): void {
		if (!container_el) return;

		items.forEach((item) => {
			const handle = item.querySelector(".drag-handle");
			if (handle) {
				remove_drag_listeners(handle as HTMLElement);
				handle.remove();
			}
			remove_drop_listeners(item);
		});
		items = [];

		const children = Array.from(container_el.children) as HTMLElement[];
		let item_index = 0;

		children.forEach((child) => {
			if (child.classList.contains("status-tracker")) return;

			if (child.classList.contains("form") && child.children.length > 0) {
				const form_children = Array.from(child.children) as HTMLElement[];
				form_children.forEach((form_child) => {
					items.push(form_child);
					setup_draggable_item(form_child, item_index);
					item_index++;
				});
			} else {
				items.push(child);
				setup_draggable_item(child, item_index);
				item_index++;
			}
		});
	}

	function handle_drag_start(e: DragEvent): void {
		e.stopPropagation?.();

		const handle = e.currentTarget as HTMLElement;
		const element = handle.parentElement as HTMLElement;
		dragged_el = element;
		dragged_index = parseInt(handle.dataset.index || "-1");

		handle.setAttribute("aria-grabbed", "true");
		element.classList.add("dragging");

		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", element.outerHTML);
			e.dataTransfer.setDragImage(element, 10, 10);
		}
	}

	function handle_drag_end(e: DragEvent): void {
		e.stopPropagation?.();

		const handle = e.currentTarget as HTMLElement;
		const element = handle.parentElement as HTMLElement;
		element.classList.remove("dragging");
		handle.setAttribute("aria-grabbed", "false");

		if (current_drop_target) {
			current_drop_target.classList.remove("drop-target");
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

		const dragged_parent = dragged_el.parentElement;
		const target_parent = target.parentElement;

		const is_dragged_in_form =
			dragged_parent?.classList.contains("form") &&
			dragged_parent.parentElement === container_el;
		const is_target_in_form =
			target_parent?.classList.contains("form") &&
			target_parent.parentElement === container_el;
		const is_dragged_direct = dragged_parent === container_el;
		const is_target_direct = target_parent === container_el;

		if (
			!(
				(is_dragged_in_form || is_dragged_direct) &&
				(is_target_in_form || is_target_direct)
			)
		) {
			return;
		}

		if (current_drop_target && current_drop_target !== target) {
			current_drop_target.classList.remove("drop-target");
		}

		target.classList.add("drop-target");
		current_drop_target = target;
	}

	async function handle_drop(e: DragEvent): Promise<boolean> {
		e.stopPropagation?.();

		const target = e.currentTarget as HTMLElement;
		target.classList.remove("drop-target");

		if (current_drop_target) {
			current_drop_target.classList.remove("drop-target");
			current_drop_target = null;
		}

		if (dragged_el && dragged_el !== target && container_el) {
			const dragged_parent = dragged_el.parentElement;
			const target_parent = target.parentElement;

			const is_dragged_in_form =
				dragged_parent?.classList.contains("form") &&
				dragged_parent.parentElement === container_el;
			const is_target_in_form =
				target_parent?.classList.contains("form") &&
				target_parent.parentElement === container_el;
			const is_dragged_direct = dragged_parent === container_el;
			const is_target_direct = target_parent === container_el;

			if (
				!(
					(is_dragged_in_form || is_dragged_direct) &&
					(is_target_in_form || is_target_direct)
				)
			) {
				return false;
			}

			const placeholder = document.createElement("div");
			placeholder.style.display = "none";

			dragged_parent!.insertBefore(placeholder, dragged_el);

			target_parent!.insertBefore(dragged_el, target);
			dragged_parent!.insertBefore(target, placeholder);

			placeholder.remove();

			dragged_el?.classList.remove("dragging");
			const dragged_handle = dragged_el?.querySelector(
				".drag-handle"
			) as HTMLElement;
			if (dragged_handle) {
				dragged_handle.setAttribute("aria-grabbed", "false");
			}

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
				const handle = item.querySelector(".drag-handle");
				if (handle) {
					remove_drag_listeners(handle as HTMLElement);
				}
				remove_drop_listeners(item);
			});
		};
	});
</script>

<div
	bind:this={container_el}
	class:hide={!gradio.shared.visible}
	class:horizontal={gradio.props.orientation === "row"}
	class:vertical={gradio.props.orientation === "column"}
	id={gradio.shared.elem_id}
	class="draggable {(gradio.shared.elem_classes || []).join(' ')}"
	role="region"
	aria-label="Draggable items container"
>
	{#if gradio.shared.loading_status && gradio.props.show_progress}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			status={gradio.shared.loading_status
				? gradio.shared.loading_status.status == "pending"
					? "generating"
					: gradio.shared.loading_status.status
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
		transition:
			transform 0.2s ease,
			border 0.2s ease;
	}

	.draggable > :global(.draggable-item.drop-target),
	.draggable > :global(.form > .draggable-item.drop-target) {
		border: 2px dashed var(--border-color-primary) !important;
		border-radius: 8px;
		transform: scale(0.98);
		opacity: 0.8;
	}

	.draggable > :global(.draggable-item.dragging),
	.draggable > :global(.form > .draggable-item.dragging) {
		opacity: 0.5;
		transform: scale(1.02);
		z-index: 1001;
	}

	.draggable > :global(.draggable-item .drag-handle) {
		position: absolute;
		top: 4px;
		left: 4px;
		width: 20px;
		height: 20px;
		min-width: 20px;
		max-width: 20px;
		min-height: 20px;
		max-height: 20px;
		background: var(--background-fill-secondary);
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		cursor: grab;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		color: var(--body-text-color-subdued);
		opacity: 0;
		transition: opacity 0.2s ease;
		z-index: 100;
		user-select: none;
		flex-shrink: 0;
	}

	.draggable > :global(.draggable-item:hover .drag-handle) {
		opacity: 1;
	}

	.draggable > :global(.draggable-item .drag-handle:hover) {
		background: var(--background-fill-secondary);
		border-color: var(--border-color-primary);
		opacity: 1;
		z-index: 101;
	}

	.draggable > :global(.draggable-item .drag-handle:active) {
		cursor: grabbing;
		background: var(--background-fill-secondary);
		opacity: 1;
		z-index: 101;
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
</style>
