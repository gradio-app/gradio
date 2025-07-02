export type CellCoordinate = [number, number];
export type EditingState = CellCoordinate | false;

export type Headers = (string | null)[];

export interface HeadersWithIDs {
	id: string;
	value: string;
}
[];

export interface TableCell {
	id: string;
	value: string | number;
}

export type TableData = TableCell[][];

export type CountConfig = [number, "fixed" | "dynamic"];

export type ElementRefs = Record<
	string,
	{
		cell: null | HTMLTableCellElement;
		input: null | HTMLTextAreaElement;
	}
>;

export type DataBinding = Record<string, TableCell>;
