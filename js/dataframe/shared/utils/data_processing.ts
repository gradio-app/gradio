import type { Headers, HeadersWithIDs } from "../utils";

export function make_headers(
	_head: Headers,
	col_count: [number, "fixed" | "dynamic"],
	els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	>,
	make_id: () => string
): HeadersWithIDs {
	let _h = _head || [];
	if (col_count[1] === "fixed" && _h.length < col_count[0]) {
		const fill = Array(col_count[0] - _h.length)
			.fill("")
			.map((_, i) => `${i + _h.length}`);
		_h = _h.concat(fill);
	}

	if (!_h || _h.length === 0) {
		return Array(col_count[0])
			.fill(0)
			.map((_, i) => {
				const _id = make_id();
				els[_id] = { cell: null, input: null };
				return { id: _id, value: JSON.stringify(i + 1) };
			});
	}

	return _h.map((h, i) => {
		const _id = make_id();
		els[_id] = { cell: null, input: null };
		return { id: _id, value: h ?? "" };
	});
}

export function process_data(
	values: (string | number)[][],
	els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	>,
	data_binding: Record<string, any>,
	make_id: () => string,
	display_value: string[][] | null = null
): { id: string; value: string | number; display_value?: string }[][] {
	if (!values || values.length === 0) {
		return [];
	}

	const result = values.map((row, i) => {
		return row.map((value, j) => {
			const _id = make_id();
			els[_id] = { cell: null, input: null };
			data_binding[_id] = value;

			let display = display_value?.[i]?.[j];

			if (display === undefined) {
				display = String(value);
			}

			return {
				id: _id,
				value,
				display_value: display
			};
		});
	});

	return result;
}
