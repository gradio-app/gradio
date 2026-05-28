/**
 * Custom filter function for TanStack Table that handles Gradio's
 * { dtype, filter, value } column filter format.
 */
export function gradio_filter_fn(
	row: any,
	columnId: string,
	filterValue: any
): boolean {
	const { dtype, filter, value: fval, case_sensitive = false } = filterValue;
	const cell_value = String(row.getValue(columnId) ?? "");
	const compare_val = fval ?? "";

	if (dtype === "number") {
		const num = parseFloat(cell_value);
		const target = parseFloat(compare_val);
		if (isNaN(num) || isNaN(target)) {
			if (filter === "Is empty") return cell_value.trim() === "";
			if (filter === "Is not empty") return cell_value.trim() !== "";
			return true;
		}
		switch (filter) {
			case "=":
				return num === target;
			case "≠":
				return num !== target;
			case ">":
				return num > target;
			case "<":
				return num < target;
			case "≥":
				return num >= target;
			case "≤":
				return num <= target;
			case "Is empty":
				return cell_value.trim() === "";
			case "Is not empty":
				return cell_value.trim() !== "";
			default:
				return true;
		}
	}

	const normalise = (s: string): string => (case_sensitive ? s : s.toLowerCase());
	const cv = normalise(cell_value);
	const query = normalise(compare_val);
	switch (filter) {
		case "Contains":
			return cv.includes(query);
		case "Does not contain":
			return !cv.includes(query);
		case "Starts with":
			return cv.startsWith(query);
		case "Ends with":
			return cv.endsWith(query);
		case "Is":
			return cv === query;
		case "Is not":
			return cv !== query;
		case "Is empty":
			return cell_value.trim() === "";
		case "Is not empty":
			return cell_value.trim() !== "";
		default:
			return true;
	}
}
