interface DragActionOptions {
	disable_click?: boolean;
	accepted_types?: string | string[] | null;
	mode?: "single" | "multiple" | "directory";
	on_drag_change?: (dragging: boolean) => void;
	on_files?: (files: File[]) => void;
}

export function drag(
	node: HTMLElement,
	options: DragActionOptions = {}
): {
	update: (new_options: DragActionOptions) => void;
	destroy: () => void;
} {
	let hidden_input: HTMLInputElement;

	// Create and configure hidden file input
	function setup_hidden_input(): void {
		hidden_input = document.createElement("input");
		hidden_input.type = "file";
		hidden_input.style.display = "none";
		const accept_options = Array.isArray(options.accepted_types)
			? options.accepted_types.join(",")
			: options.accepted_types || undefined;

		if (accept_options) {
			hidden_input.accept = accept_options;
		}

		hidden_input.multiple = options.mode === "multiple" || false;
		if (options.mode === "directory") {
			hidden_input.webkitdirectory = true;
			hidden_input.setAttribute("directory", "");
			hidden_input.setAttribute("mozdirectory", "");
		}
		node.appendChild(hidden_input);
	}

	setup_hidden_input();

	function handle_drag(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
	}

	function handle_drag_enter(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		options.on_drag_change?.(true);
	}

	function handle_drag_leave(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		options.on_drag_change?.(false);
	}

	function handle_drop(e: DragEvent): void {
		e.preventDefault();
		e.stopPropagation();
		options.on_drag_change?.(false);

		if (!e.dataTransfer?.files) return;
		const files = Array.from(e.dataTransfer.files);
		if (files.length > 0) {
			options.on_files?.(files);
		}
	}

	function handle_click(): void {
		if (!options.disable_click) {
			hidden_input.value = "";
			hidden_input.click();
		}
	}

	function handle_file_input_change(): void {
		if (hidden_input.files) {
			const files = Array.from(hidden_input.files);
			if (files.length > 0) {
				options.on_files?.(files);
			}
		}
	}

	// Add all event listeners
	node.addEventListener("drag", handle_drag);
	node.addEventListener("dragstart", handle_drag);
	node.addEventListener("dragend", handle_drag);
	node.addEventListener("dragover", handle_drag);
	node.addEventListener("dragenter", handle_drag_enter);
	node.addEventListener("dragleave", handle_drag_leave);
	node.addEventListener("drop", handle_drop);
	node.addEventListener("click", handle_click);
	hidden_input!.addEventListener("change", handle_file_input_change);

	return {
		update(new_options: DragActionOptions) {
			options = new_options;
			// Recreate hidden input with new options
			hidden_input.remove();
			setup_hidden_input();
			hidden_input.addEventListener("change", handle_file_input_change);
		},
		destroy() {
			node.removeEventListener("drag", handle_drag);
			node.removeEventListener("dragstart", handle_drag);
			node.removeEventListener("dragend", handle_drag);
			node.removeEventListener("dragover", handle_drag);
			node.removeEventListener("dragenter", handle_drag_enter);
			node.removeEventListener("dragleave", handle_drag_leave);
			node.removeEventListener("drop", handle_drop);
			node.removeEventListener("click", handle_click);
			hidden_input.removeEventListener("change", handle_file_input_change);
			hidden_input.remove();
		}
	};
}
