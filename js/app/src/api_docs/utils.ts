export function represent_value(
	value: string,
	type: string | undefined,
	lang: "js" | "py" | null = null
) {
	if (type === undefined) {
		return lang === "py" ? "None" : null;
	}
	if (type === "string" || type === "str") {
		return lang === null ? value : '"' + value + '"';
	} else if (type === "number") {
		return lang === null ? parseFloat(value) : value;
	} else if (type === "boolean" || type == "bool") {
		if (lang === "py") {
			value = String(value);
			return value === "true" ? "True" : "False";
		} else if (lang === "js") {
			return value;
		} else {
			return value === "true";
		}
	} else if (type === "List[str]") {
		value = JSON.stringify(value);
		return value;
	} else {
		// assume object type
		if (lang === null) {
			return value === "" ? null : JSON.parse(value);
		} else if (typeof value === "string") {
			if (value === "") {
				return lang === "py" ? "None" : "null";
			}
			return value;
		} else {
			return JSON.stringify(value);
		}
	}
}
