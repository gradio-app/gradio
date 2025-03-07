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
	_values: (string | number)[][],
	row_count: [number, "fixed" | "dynamic"],
	col_count: [number, "fixed" | "dynamic"],
	headers: Headers,
	els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	>,
	data_binding: Record<string, { value: string | number; id: string }>,
	make_id: () => string
): {
	value: string | number;
	id: string;
}[][] {
	const data_row_length = _values.length;
	if (data_row_length === 0) return [];
	return Array(row_count[1] === "fixed" ? row_count[0] : data_row_length)
		.fill(0)
		.map((_, i) => {
			return Array(
				col_count[1] === "fixed"
					? col_count[0]
					: _values[0].length || headers.length
			)
				.fill(0)
				.map((_, j) => {
					const id = make_id();
					els[id] = els[id] || { input: null, cell: null };
					const obj = { value: _values?.[i]?.[j] ?? "", id };
					data_binding[id] = obj;
					return obj;
				});
		});
}
