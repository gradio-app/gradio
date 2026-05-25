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
	viewport_width: () => number;
	on_resize?: () => void;
}): {
	readonly col_widths: number[];
	readonly col_lefts: number[];
	readonly total_header_width: number;
	readonly header_height: number;
	readonly row_num_width: number;
	get_col_style: (index: number) => string;
} {
	let col_widths: number[] = $state([]);
	let total_header_width: number = $state(0);
	let header_height: number = $state(0);

	// use offsets (not just widths) avoids accumulated subpixel rounding errors
	let col_lefts: number[] = $state([]);

	function resolve_user_width(
		raw: string | undefined,
		vw: number
	): number | null {
		if (!raw || raw === "auto") return null;
		if (raw.endsWith("%")) {
			const pct = parseFloat(raw);
			if (!isFinite(pct) || vw <= 0) return null;
			return (pct / 100) * vw;
		}
		if (raw.endsWith("px")) {
			const n = parseFloat(raw);
			return isFinite(n) ? n : null;
		}
		const n = parseFloat(raw);
		return isFinite(n) ? n : null;
	}

	function clear_pin(el: HTMLElement): void {
		if (el.style.width) el.style.width = "";
		if (el.style.minWidth) el.style.minWidth = "";
		if (el.style.maxWidth) el.style.maxWidth = "";
	}

	function pin(el: HTMLElement, target: string): void {
		if (el.style.width !== target) el.style.width = target;
		if (el.style.minWidth !== target) el.style.minWidth = target;
		if (el.style.maxWidth !== target) el.style.maxWidth = target;
	}

	function measure(): void {
		const current_row_el = opts.header_row_el();
		const current_table_el = opts.header_table_el();
		if (!current_row_el || !current_table_el) return;

		const cells = Array.from(
			current_row_el.querySelectorAll<HTMLElement>(".header-cell")
		);
		// sizing-body mirrors the data columns to give auto-layout a read on
		// body-content widths. we also pin its cells so user widths are
		// honored exactly (otherwise the sizing row's nowrap min-content
		// forces the column wider than the user asked for).
		const sizing_tds_all = Array.from(
			current_table_el.querySelectorAll<HTMLElement>(".sizing-body > tr > td")
		);
		const sizing_data_tds = opts.show_row_numbers()
			? sizing_tds_all.slice(1)
			: sizing_tds_all;

		cells.forEach(clear_pin);
		sizing_data_tds.forEach(clear_pin);
		current_table_el.style.width = "auto";
		current_table_el.getBoundingClientRect(); // force layout flush

		const vw = opts.viewport_width();
		const user_widths = opts.column_widths();

		const next_widths = cells.map((cell, i) => {
			const resolved = resolve_user_width(user_widths[i], vw);
			if (resolved != null) return resolved;
			// cap auto-sized columns at the viewport so a single column
			// can never be wider than the visible scroll area
			const measured = cell.getBoundingClientRect().width;
			return vw > 0 ? Math.min(measured, vw) : measured;
		});

		cells.forEach((cell, i) => pin(cell, `${next_widths[i]}px`));
		sizing_data_tds.forEach((cell, i) => {
			if (next_widths[i] == null) return;
			pin(cell, `${next_widths[i]}px`);
		});

		// set the table width to the sum of columns so auto-layout
		// has no extra space to redistribute
		let table_w = next_widths.reduce((a, b) => a + b, 0);
		if (opts.show_row_numbers()) {
			const rn =
				current_row_el.querySelector<HTMLElement>(".row-number-header");
			if (rn) table_w += rn.getBoundingClientRect().width;
		}
		current_table_el.style.width = `${table_w}px`;

		const after_rect = current_table_el.getBoundingClientRect();
		col_lefts = cells.map(
			(c) => c.getBoundingClientRect().left - after_rect.left
		);
		col_widths = next_widths;
		total_header_width = after_rect.width;
		header_height = after_rect.height;
		opts.on_resize?.();
	}

	$effect(() => {
		const table_el = opts.header_table_el();
		const row_el = opts.header_row_el();
		if (!table_el || !row_el) return;

		// re-run when columns change so we observe new cells
		opts.resolved_headers();

		const ro = new ResizeObserver(measure);
		ro.observe(table_el);

		// observe individual header cells so content-driven column
		// width changes (editing, data updates) trigger a re-measure
		// even when the overall table dimensions stay the same
		const cells = row_el.querySelectorAll<HTMLElement>(".header-cell");
		cells.forEach((cell) => ro.observe(cell));

		return () => ro.disconnect();
	});

	$effect(() => {
		opts.viewport_width();
		opts.column_widths();
		measure();
	});

	let row_num_width = $derived.by(() => {
		if (!opts.show_row_numbers()) return 0;
		const row_el = opts.header_row_el();
		if (!row_el) return 0;
		const el = row_el.querySelector<HTMLElement>(".row-number-header");
		return el?.getBoundingClientRect().width ?? 48;
	});

	function get_col_style(index: number): string {
		if (col_widths[index] !== undefined) {
			return `width: ${col_widths[index]}px; flex: 0 0 ${col_widths[index]}px;`;
		}
		const resolved = resolve_user_width(
			opts.column_widths()[index],
			opts.viewport_width()
		);
		if (resolved != null) {
			return `width: ${resolved}px; flex: 0 0 ${resolved}px;`;
		}
		return "width: 150px; flex: 0 0 150px;";
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
		get header_height() {
			return header_height;
		},
		get row_num_width() {
			return row_num_width;
		},
		get_col_style
	};
}
