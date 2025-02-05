export function toggle_header_menu(
	event: MouseEvent,
	col: number,
	active_header_menu: { col: number; x: number; y: number } | null,
	set_active_header_menu: (
		menu: { col: number; x: number; y: number } | null
	) => void
): void {
	event.stopPropagation();
	if (active_header_menu && active_header_menu.col === col) {
		set_active_header_menu(null);
	} else {
		const header = (event.target as HTMLElement).closest("th");
		if (header) {
			const rect = header.getBoundingClientRect();
			set_active_header_menu({ col, x: rect.right, y: rect.bottom });
		}
	}
}

export function toggle_cell_menu(
	event: MouseEvent,
	row: number,
	col: number,
	active_cell_menu: { row: number; col: number; x: number; y: number } | null,
	set_active_cell_menu: (
		menu: { row: number; col: number; x: number; y: number } | null
	) => void
): void {
	event.stopPropagation();
	if (
		active_cell_menu &&
		active_cell_menu.row === row &&
		active_cell_menu.col === col
	) {
		set_active_cell_menu(null);
	} else {
		const cell = (event.target as HTMLElement).closest("td");
		if (cell) {
			const rect = cell.getBoundingClientRect();
			set_active_cell_menu({ row, col, x: rect.right, y: rect.bottom });
		}
	}
}

export function add_row_at(
	index: number,
	position: "above" | "below",
	add_row: (index?: number) => void,
	clear_menus: () => void
): void {
	const row_index = position === "above" ? index : index + 1;
	add_row(row_index);
	clear_menus();
}

export function add_col_at(
	index: number,
	position: "left" | "right",
	add_col: (index?: number) => void,
	clear_menus: () => void
): void {
	const col_index = position === "left" ? index : index + 1;
	add_col(col_index);
	clear_menus();
}

export function delete_row_at(
	index: number,
	delete_row: (index: number) => void,
	clear_menus: () => void
): void {
	delete_row(index);
	clear_menus();
}

export function delete_col_at(
	index: number,
	delete_col: (index: number) => void,
	clear_menus: () => void
): void {
	delete_col(index);
	clear_menus();
}

export function toggle_header_button(
	col: number,
	active_button: { type: "header" | "cell"; row?: number; col: number } | null,
	set_active_button: (
		button: { type: "header" | "cell"; row?: number; col: number } | null
	) => void
): void {
	set_active_button(
		active_button?.type === "header" && active_button.col === col
			? null
			: { type: "header", col }
	);
}

export function toggle_cell_button(
	row: number,
	col: number,
	active_button: { type: "header" | "cell"; row?: number; col: number } | null,
	set_active_button: (
		button: { type: "header" | "cell"; row?: number; col: number } | null
	) => void
): void {
	set_active_button(
		active_button?.type === "cell" &&
			active_button.row === row &&
			active_button.col === col
			? null
			: { type: "cell", row, col }
	);
}
