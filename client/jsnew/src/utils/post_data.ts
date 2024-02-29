import { BROKEN_CONNECTION_MSG } from "../constants";
import { PostResponse } from "../types";

export async function post_data(
	url: string,
	body: unknown,
	token?: `hf_${string}`
): Promise<[PostResponse, number]> {
	const headers: {
		Authorization?: string;
		"Content-Type": "application/json";
	} = { "Content-Type": "application/json" };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	try {
		var response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers
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
