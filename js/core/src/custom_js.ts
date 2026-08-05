import { AsyncFunction } from "./init_utils";

export async function execute_custom_js(js: string): Promise<void> {
	let custom_js: () => Promise<unknown>;

	try {
		custom_js = new AsyncFunction(`return (${js});`);
	} catch {
		custom_js = new AsyncFunction(js);
	}

	const result = await custom_js();
	if (typeof result === "function") {
		await result();
	}
}
