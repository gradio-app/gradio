export type CellCoordinate = [number, number];
export type EditingState = CellCoordinate | false;

export type Headers = (string | null)[];

export interface HeadersWithIDs {
	id: string;
	value: string;
}
[];

export type CellValue = string | number | boolean;

export interface TableCell {
	id: string;
	value: CellValue;
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
