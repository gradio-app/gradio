/**
 * Custom filter function for TanStack Table that handles Gradio's
 * { dtype, filter, value } column filter format.
 */
export function gradio_filter_fn(
	row: any,
	columnId: string,
	filterValue: any
): boolean {
	const { dtype, filter, value: fval } = filterValue;
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

	const lower = cell_value.toLowerCase();
	const target_lower = compare_val.toLowerCase();
	switch (filter) {
		case "Contains":
			return lower.includes(target_lower);
		case "Does not contain":
			return !lower.includes(target_lower);
		case "Starts with":
			return lower.startsWith(target_lower);
		case "Ends with":
			return lower.endsWith(target_lower);
		case "Is":
			return lower === target_lower;
		case "Is not":
			return lower !== target_lower;
		case "Is empty":
			return cell_value.trim() === "";
		case "Is not empty":
			return cell_value.trim() !== "";
		default:
			return true;
	}
}
