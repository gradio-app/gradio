import type { CellCoordinate, CellValue } from "../types";
import type { DataframeValue, Datatype } from "../utils/utils";

export type SortDirection = "asc" | "desc";

export interface SortColumn {
	col: number;
	direction: SortDirection;
}

export interface FilterColumn {
	col: number;
	datatype: "string" | "number";
	filter: string;
	value: string;
}

export interface StoreCell {
	id: string;
	value: CellValue;
	display_value?: string;
	styling?: string;
}

export interface RowView {
	rowIndex: number;
	cells: StoreCell[];
}

export interface DataframeStoreInit {
	value: DataframeValue;
	datatype: Datatype | Datatype[];
	pinned_columns?: number;
	column_widths?: string[];
	max_height?: number;
}

export const DATAFRAME_STORE_KEY = Symbol("dataframe-store");

export class DataframeStore {
	// --- canonical state ---
	data = $state<StoreCell[][]>([]);
	headers = $state<string[]>([]);
	datatype = $state<Datatype | Datatype[]>("str");
	metadata = $state({
		display_value: null as string[][] | null,
		styling: null as string[][] | null
	});

	config = $state({
		pinned_columns: 0,
		column_widths: [] as string[],
		max_height: 500
	});

	search = $state({ query: null as string | null });
	filter = $state({ columns: [] as FilterColumn[] });
	sort = $state({ columns: [] as SortColumn[] });

	layout = $state({
		viewport: { height: 0, scrollTop: 0 }
	});

	selection = $state({
		cells: [] as CellCoordinate[],
		anchor: null as CellCoordinate | null,
		selected: false as CellCoordinate | false,
		editing: false as CellCoordinate | false,
		headerEdit: false as number | false,
		selectedHeader: false as number | false
	});

	ui = $state({
		activeCellMenu: null as
			| { row: number; col: number; x: number; y: number }
			| null,
		activeHeaderMenu: null as { col: number; x: number; y: number } | null,
		activeButton: null as { type: "header" | "cell"; row?: number; col: number } | null,
		copyFlash: false
	});

	constructor(init: DataframeStoreInit) {
		this.config.pinned_columns = init.pinned_columns ?? 0;
		this.config.column_widths = init.column_widths ?? [];
		this.config.max_height = init.max_height ?? 500;
		this.datatype = init.datatype;
		this.setValue(init.value);
	}

	// --- derived projections ---
	filteredRows = $derived.by(() =>
		this.applyFilters(this.baseRowViews(this.data))
	);

	searchedRows = $derived.by(() =>
		this.search.query
			? this.applySearch(this.filteredRows, this.search.query)
			: this.filteredRows
	);

	sortedRows = $derived.by(() => this.applySort(this.searchedRows));

	visibleRows = $derived.by(() =>
		this.applyViewport(this.sortedRows, this.layout.viewport.height)
	);

	visibleCells = $derived.by(() => this.visibleRows.map((row) => row.cells));
	visibleRowIndices = $derived(this.visibleRows.map((row) => row.rowIndex));
	selectedCell = $derived(this.selection.selected);
	columns = $derived.by(() => this.transpose(this.visibleCells));

	// --- public commands ---
	setValue(value: DataframeValue): void {
		const display = value.metadata?.display_value ?? null;
		const styling = value.metadata?.styling ?? null;

		this.data = value.data.map((row, rowIndex) =>
			row.map((cell, colIndex) =>
				this.createCell(
					cell,
					display?.[rowIndex]?.[colIndex],
					styling?.[rowIndex]?.[colIndex]
				)
			)
		);

		this.headers = value.headers.map((header) => header ?? "");
		this.metadata.display_value = display;
		this.metadata.styling = styling;
	}

	setSearch(query: string | null): void {
		this.search.query = query;
	}

	toggleFilter(column: FilterColumn): void {
		const index = this.filter.columns.findIndex(
			(existing) => existing.col === column.col
		);
		if (index >= 0) {
			const next = [...this.filter.columns];
			next.splice(index, 1);
			this.filter.columns = next;
		} else {
			this.filter.columns = [...this.filter.columns, column];
		}
	}

	clearFilters(): void {
		this.filter.columns = [];
	}

	setSort(column: number, direction: SortDirection): void {
		const existingIndex = this.sort.columns.findIndex(
			(item) => item.col === column
		);
		const next = { col: column, direction };
		if (
			existingIndex >= 0 &&
			this.sort.columns[existingIndex].direction === direction
		) {
			const clone = [...this.sort.columns];
			clone.splice(existingIndex, 1);
			this.sort.columns = clone;
			return;
		}

		const updated = [...this.sort.columns.filter((item) => item.col !== column), next];
		this.sort.columns = updated.slice(-3);
	}

	clearSort(): void {
		this.sort.columns = [];
	}

	setViewport(height: number, scrollTop: number): void {
		this.layout.viewport = { height, scrollTop };
	}

	selectCell(coord: CellCoordinate, extend = false): void {
		let cells: CellCoordinate[];
		if (extend && this.selection.anchor) {
			cells = this.getRange(this.selection.anchor, coord);
		} else {
			this.selection.anchor = coord;
			cells = [coord];
		}
		this.setSelectedCells(cells);
		this.selection.editing =
			cells.length === 1 ? (cells[0] as CellCoordinate) : false;
	}

	updateCell(coord: CellCoordinate, value: CellValue): void {
		const [row, col] = coord;
		if (!this.data[row] || !this.data[row][col]) return;
		this.data[row][col] = {
			...this.data[row][col],
			value
		};
	}

	addRow(insertIndex?: number): void {
		const columnCount = this.data[0]?.length ?? this.headers.length ?? 1;
		const newRow = Array.from({ length: columnCount }, () => this.createCell(""));

		if (insertIndex === undefined || insertIndex < 0 || insertIndex > this.data.length) {
			this.data = [...this.data, newRow];
		} else {
			this.data = [
				...this.data.slice(0, insertIndex),
				newRow,
				...this.data.slice(insertIndex)
			];
		}
	}

	addColumn(insertIndex?: number, headerLabel?: string): void {
		const newHeader = headerLabel ?? `Header ${this.headers.length + 1}`;
		const headers = [...this.headers, newHeader];
		if (
			insertIndex !== undefined &&
			insertIndex >= 0 &&
			insertIndex < headers.length - 1
		) {
			headers.splice(insertIndex, 0, headers.pop()!);
		}
		this.headers = headers;

		this.data = this.data.map((row) => {
			const newCell = this.createCell("");
			const updatedRow = [...row, newCell];
			if (
				insertIndex !== undefined &&
				insertIndex >= 0 &&
				insertIndex < updatedRow.length - 1
			) {
				updatedRow.splice(insertIndex, 0, updatedRow.pop()!);
			}
			return updatedRow;
		});
	}

	deleteRow(index: number): void {
		if (index < 0 || index >= this.data.length) return;
		this.data = [...this.data.slice(0, index), ...this.data.slice(index + 1)];
	}

	deleteColumn(index: number): void {
		if (!this.data[0] || index < 0 || index >= this.data[0].length) return;
		this.data = this.data.map((row) => [
			...row.slice(0, index),
			...row.slice(index + 1)
		]);
		this.headers = [
			...this.headers.slice(0, index),
			...this.headers.slice(index + 1)
		];
	}

	setSelectedCells(cells: CellCoordinate[]): void {
		this.selection.cells = cells;
		this.selection.selected = cells[0] ?? false;
		if (cells[0]) {
			this.selection.anchor = cells[0];
		}
	}

	setSelected(selection: CellCoordinate | false): void {
		this.selection.selected = selection;
		if (selection) {
			this.selection.anchor = selection;
		}
	}

	setEditing(editing: CellCoordinate | false): void {
		this.selection.editing = editing;
	}

	setHeaderEdit(index: number | false): void {
		this.selection.headerEdit = index;
	}

	setSelectedHeader(index: number | false): void {
		this.selection.selectedHeader = index;
	}

	setActiveCellMenu(
		menu:
			| {
					row: number;
					col: number;
					x: number;
					y: number;
			  }
			| null
	): void {
		this.ui.activeCellMenu = menu;
	}

	setActiveHeaderMenu(
		menu: { col: number; x: number; y: number } | null
	): void {
		this.ui.activeHeaderMenu = menu;
	}

	setActiveButton(
		button: { type: "header" | "cell"; row?: number; col: number } | null
	): void {
		this.ui.activeButton = button;
	}

	setCopyFlash(value: boolean): void {
		this.ui.copyFlash = value;
	}

	clearUIState(): void {
		this.ui.activeCellMenu = null;
		this.ui.activeHeaderMenu = null;
		this.ui.activeButton = null;
		this.selection.cells = [];
		this.selection.selected = false;
		this.selection.editing = false;
		this.selection.headerEdit = false;
		this.selection.selectedHeader = false;
	}

	// --- helpers ---
	private applyFilters(rows: RowView[]): RowView[] {
		if (!this.filter.columns.length) return rows;
		return rows.filter((row) =>
			this.filter.columns.every((column) => {
				const cell = row.cells[column.col];
				return this.matchFilter(cell, column);
			})
		);
	}

	private applySearch(rows: RowView[], query: string): RowView[] {
		const target = query?.toLowerCase() ?? "";
		if (!target) return rows;
		return rows.filter((row) =>
			row.cells.some((cell) =>
				String(cell?.value ?? "").toLowerCase().includes(target)
			)
		);
	}

	private applySort(rows: RowView[]): RowView[] {
		if (!this.sort.columns.length) return rows;
		const sorted = [...rows];

		sorted.sort((a, b) => {
			for (const { col, direction } of this.sort.columns) {
				const aValue = a.cells[col]?.value;
				const bValue = b.cells[col]?.value;
				if (aValue === bValue) continue;
				if (aValue == null) return direction === "asc" ? -1 : 1;
				if (bValue == null) return direction === "asc" ? 1 : -1;
				if (aValue < bValue) return direction === "asc" ? -1 : 1;
				if (aValue > bValue) return direction === "asc" ? 1 : -1;
			}
			return 0;
		});

		return sorted;
	}

	private applyViewport(rows: RowView[], _height: number): RowView[] {
		// placeholder for future virtualization; currently returns all rows
		return rows;
	}

	private transpose(rows: StoreCell[][]): StoreCell[][] {
		if (!rows.length) return [];
		const colCount = rows[0].length;
		const columns: StoreCell[][] = Array.from(
			{ length: colCount },
			() => []
		);
		for (const row of rows) {
			for (let col = 0; col < colCount; col++) {
				columns[col].push(row[col]);
			}
		}
		return columns;
	}

	private baseRowViews(rows: StoreCell[][]): RowView[] {
		return rows.map((cells, rowIndex) => ({
			rowIndex,
			cells
		}));
	}

	private matchFilter(cell: StoreCell | undefined, column: FilterColumn): boolean {
		const value = cell?.value;
		const stringValue = String(value ?? "");
		if (column.datatype === "number") {
			const numericValue = Number(value);
			const numericTarget = Number(column.value);
			switch (column.filter) {
				case "=":
					return numericValue === numericTarget;
				case "≠":
					return numericValue !== numericTarget;
				case ">":
					return numericValue > numericTarget;
				case "<":
					return numericValue < numericTarget;
				case "≥":
					return numericValue >= numericTarget;
				case "≤":
					return numericValue <= numericTarget;
				case "Is empty":
					return stringValue === "";
				case "Is not empty":
					return stringValue !== "";
				default:
					return true;
			}
		} else {
			const target = column.value ?? "";
			switch (column.filter) {
				case "Contains":
					return stringValue.includes(target);
				case "Does not contain":
					return !stringValue.includes(target);
				case "Starts with":
					return stringValue.startsWith(target);
				case "Ends with":
					return stringValue.endsWith(target);
				case "Is":
					return stringValue === target;
				case "Is not":
					return stringValue !== target;
				case "Is empty":
					return stringValue === "";
				case "Is not empty":
					return stringValue !== "";
				default:
					return true;
			}
		}
	}

	private getRange(
		start: CellCoordinate,
		end: CellCoordinate
	): CellCoordinate[] {
		const [startRow, startCol] = start;
		const [endRow, endCol] = end;
		const minRow = Math.min(startRow, endRow);
		const maxRow = Math.max(startRow, endRow);
		const minCol = Math.min(startCol, endCol);
		const maxCol = Math.max(startCol, endCol);

		const cells: CellCoordinate[] = [];
		for (let row = minRow; row <= maxRow; row++) {
			for (let col = minCol; col <= maxCol; col++) {
				cells.push([row, col]);
			}
		}
		return cells;
	}

	private createCell(
		value: CellValue,
		display_value?: string,
		styling?: string
	): StoreCell {
		return {
			id: this.makeId(),
			value,
			display_value,
			styling
		};
	}

	private makeId(): string {
		return Math.random().toString(36).substring(2, 15);
	}
}
