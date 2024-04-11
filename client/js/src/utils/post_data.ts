import { BROKEN_CONNECTION_MSG } from "../constants";
import type { PostResponse } from "../types";

export async function post_data(
	url: string,
	body: unknown,
	fetch_implementation: typeof fetch = fetch,
	token?: `hf_${string}`,
	additional_headers?: any
): Promise<[PostResponse, number]> {
	const headers: {
		Authorization?: string;
		"Content-Type": "application/json";
	} = { "Content-Type": "application/json" };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	try {
		var response = await fetch_implementation(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { ...headers, ...additional_headers }
		});
	} catch (e) {
		return [{ error: BROKEN_CONNECTION_MSG }, 500];
	}
	let output: PostResponse;
	let status: number;
	try {
		output = await response.json();
		status = response.status;
	} catch (e) {
		output = { error: `Could not parse server response: ${e}` };
		status = 500;
	}
	return [output, status];
}
