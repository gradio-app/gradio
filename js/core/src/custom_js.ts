import { AsyncFunction } from "./init_utils";

export function create_custom_js_handler(
	js: string
): (...args: unknown[]) => Promise<unknown> {
	let custom_js: (...args: unknown[]) => Promise<unknown>;
	let is_expression = true;
	const expression = js.trim().replace(/;+$/, "");

	try {
		custom_js = new AsyncFunction(`return (\n${expression}\n);`);
	} catch {
		is_expression = false;
		custom_js = new AsyncFunction(js);
	}

	return async (...args: unknown[]) => {
		const result = await custom_js(...args);
		if (typeof result === "function") {
			return await result(...args);
		}

		return is_expression ? undefined : result;
	};
}

export async function execute_custom_js(
	js: string,
	args: unknown[] = []
): Promise<unknown> {
	return await create_custom_js_handler(js)(...args);
}
