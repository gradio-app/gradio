export function represent_value(
	value: string,
	type: string | undefined,
	lang: "js" | "py" | null = null
) {
	if (type === undefined) {
		return lang === "py" ? "None" : null;
	}
	if (type === "string") {
		return lang === null ? value : '"' + value + '"';
	} else if (type === "number") {
		return lang === null ? parseFloat(value) : value;
	} else if (type === "boolean") {
		if (lang === "py") {
			return value === "true" ? "True" : "False";
		} else if (lang === "js") {
			return value;
		} else {
			return value === "true";
		}
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
