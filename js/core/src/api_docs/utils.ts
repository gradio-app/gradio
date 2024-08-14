// eslint-disable-next-line complexity
export function represent_value(
	value: string,
	type: string | undefined,
	lang: "js" | "py" | "bash" | null = null
): string | null | number | boolean | Record<string, unknown> {
	if (type === undefined) {
		return lang === "py" ? "None" : null;
	}
	if (value === null && lang === "py") {
		return "None";
	}
	if (type === "string" || type === "str") {
		return lang === null ? value : '"' + value + '"';
	} else if (type === "number") {
		return lang === null ? parseFloat(value) : value;
	} else if (type === "boolean" || type == "bool") {
		if (lang === "py") {
			value = String(value);
			return value === "true" ? "True" : "False";
		} else if (lang === "js" || lang === "bash") {
			return value;
		}
		return value === "true";
	} else if (type === "List[str]") {
		value = JSON.stringify(value);
		return value;
	} else if (type.startsWith("Literal['")) {
		// a literal of strings
		return '"' + value + '"';
	}
	// assume object type
	if (lang === null) {
		return value === "" ? null : JSON.parse(value);
	} else if (typeof value === "string") {
		if (value === "") {
			return lang === "py" ? "None" : "null";
		}
		return value;
	}
	if (lang === "bash") {
		value = simplify_file_data(value);
	}
	if (lang === "py") {
		value = replace_file_data_with_file_function(value);
	}
	return stringify_except_file_function(value);
}

export function is_potentially_nested_file_data(obj: any): boolean {
	if (typeof obj === "object" && obj !== null) {
		if (obj.hasOwnProperty("url") && obj.hasOwnProperty("meta")) {
			if (
				typeof obj.meta === "object" &&
				obj.meta !== null &&
				obj.meta._type === "gradio.FileData"
			) {
				return true;
			}
		}
	}
	if (typeof obj === "object" && obj !== null) {
		for (let key in obj) {
			if (typeof obj[key] === "object") {
				let result = is_potentially_nested_file_data(obj[key]);
				if (result) {
					return true;
				}
			}
		}
	}
	return false;
}

function simplify_file_data(obj: any): any {
	if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
		if (
			"url" in obj &&
			obj.url &&
			"meta" in obj &&
			obj.meta?._type === "gradio.FileData"
		) {
			return { path: obj.url };
		}
	}
	if (Array.isArray(obj)) {
		obj.forEach((item, index) => {
			if (typeof item === "object" && item !== null) {
				obj[index] = simplify_file_data(item); // Recurse and update array elements
			}
		});
	} else if (typeof obj === "object" && obj !== null) {
		Object.keys(obj).forEach((key) => {
			obj[key] = simplify_file_data(obj[key]); // Recurse and update object properties
		});
	}
	return obj;
}

function replace_file_data_with_file_function(obj: any): any {
	if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
		if (
			"url" in obj &&
			obj.url &&
			"meta" in obj &&
			obj.meta?._type === "gradio.FileData"
		) {
			return `handle_file('${obj.url}')`;
		}
	}
	if (Array.isArray(obj)) {
		obj.forEach((item, index) => {
			if (typeof item === "object" && item !== null) {
				obj[index] = replace_file_data_with_file_function(item); // Recurse and update array elements
			}
		});
	} else if (typeof obj === "object" && obj !== null) {
		Object.keys(obj).forEach((key) => {
			obj[key] = replace_file_data_with_file_function(obj[key]); // Recurse and update object properties
		});
	}
	return obj;
}

function stringify_except_file_function(obj: any): string {
	let jsonString = JSON.stringify(obj, (key, value) => {
		if (value === null) {
			return "UNQUOTEDNone";
		}
		if (
			typeof value === "string" &&
			value.startsWith("handle_file(") &&
			value.endsWith(")")
		) {
			return `UNQUOTED${value}`; // Flag the special strings
		}
		return value;
	});
	const regex = /"UNQUOTEDhandle_file\(([^)]*)\)"/g;
	jsonString = jsonString.replace(regex, (match, p1) => `handle_file(${p1})`);
	const regexNone = /"UNQUOTEDNone"/g;
	return jsonString.replace(regexNone, "None");
}
