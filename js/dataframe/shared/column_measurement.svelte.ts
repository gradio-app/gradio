/**
 * measures header cell positions/widths and provides inline styles
 * for absolutely-positioned body cells to match.
 */
export function create_column_measurement(opts: {
	header_row_el: () => HTMLTableRowElement | undefined;
	header_table_el: () => HTMLTableElement | undefined;
	resolved_headers: () => string[];
	row_data: () => any[];
	show_row_numbers: () => boolean;
	column_widths: () => string[];
}): {
	readonly col_widths: number[];
	readonly col_lefts: number[];
	readonly total_header_width: number;
	readonly row_num_width: number;
	get_col_style: (index: number) => string;
} {
	let col_widths: number[] = $state([]);
	let total_header_width: number = $state(0);

	// use offsets (not just widths) avoids accumulated subpixel rounding errors
	let col_lefts: number[] = $state([]);

	$effect(() => {
		// read reactive dependencies to trigger re-measurement
		void opts.resolved_headers();
		void opts.row_data();
		const row_el = opts.header_row_el();
		if (!row_el) return;

		requestAnimationFrame(() => {
			const current_row_el = opts.header_row_el();
			const current_table_el = opts.header_table_el();
			if (!current_row_el) return;

			const cells =
				current_row_el.querySelectorAll<HTMLElement>(".header-cell");
			const table_rect = current_table_el?.getBoundingClientRect();
			const table_left = table_rect?.left ?? 0;

			col_lefts = Array.from(cells).map(
				(c) => c.getBoundingClientRect().left - table_left
			);
			col_widths = Array.from(cells).map(
				(c) => c.getBoundingClientRect().width
			);
			if (current_table_el) {
				total_header_width = table_rect?.width ?? 0;
			}
		});
	});

	let row_num_width = $derived.by(() => {
		if (!opts.show_row_numbers()) return 0;
		const row_el = opts.header_row_el();
		if (!row_el) return 0;
		const el = row_el.querySelector<HTMLElement>(".row-number-header");
		return el?.getBoundingClientRect().width ?? 48;
	});

	function get_col_style(index: number): string {
		if (col_lefts[index] !== undefined && col_widths[index] !== undefined) {
			return `position: absolute; left: ${col_lefts[index]}px; width: ${col_widths[index]}px; top: 0; bottom: 0;`;
		}
		const user_widths = opts.column_widths();
		if (user_widths[index]) return `width: ${user_widths[index]};`;
		return "width: 150px;";
	}

	return {
		get col_widths() {
			return col_widths;
		},
		get col_lefts() {
			return col_lefts;
		},
		get total_header_width() {
			return total_header_width;
		},
		get row_num_width() {
			return row_num_width;
		},
		get_col_style
	};
}
