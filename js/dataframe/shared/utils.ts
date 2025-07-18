export type Headers = string[];
export type Data = (string | number)[][];
export type Datatype = "str" | "markdown" | "html" | "number" | "bool" | "date";
export type Metadata = {
	[key: string]: string[][] | null;
} | null;
export type HeadersWithIDs = { value: string; id: string }[];
export type DataframeValue = {
	data: Data;
	headers: Headers;
	metadata: Metadata;
};

/**
 * Coerce a value to a given type.
 * @param v - The value to coerce.
 * @param t - The type to coerce to.
 * @returns The coerced value.
 */
export function cast_value_to_type(
	v: any,
	t: Datatype
): string | number | boolean {
	if (t === "number") {
		const n = Number(v);
		return isNaN(n) ? v : n;
	}
	if (t === "bool") {
		if (typeof v === "boolean") return v;
		if (typeof v === "number") return v !== 0;
		const s = String(v).toLowerCase();
		if (s === "true" || s === "1") return true;
		if (s === "false" || s === "0") return false;
		return v;
	}
	if (t === "date") {
		const d = new Date(v);
		return isNaN(d.getTime()) ? v : d.toISOString();
	}
	return v;
}
