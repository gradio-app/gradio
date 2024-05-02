import {
	resolve_root,
	get_jwt,
	determine_protocol
} from "../helpers/init_helpers";
import { initialise_server } from "./server";
import { beforeAll, afterEach, afterAll, it, expect, describe } from "vitest";

const server = initialise_server();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("resolve_root", () => {
	it('should return the base URL if the root path starts with "http://"', () => {
		const base_url = "https://huggingface.co";
		const root_path = "https://hmb-hello-world.hf.space";
		const prioritize_base = true;
		const result = resolve_root(base_url, root_path, prioritize_base);
		expect(result).toBe(base_url);
	});

	it('should return the base URL if the root path starts with "https://"', () => {
		const base_url = "https://huggingface.co";
		const root_path = "https://hmb-hello-world.hf.space";
		const prioritize_base = true;
		const result = resolve_root(base_url, root_path, prioritize_base);
		expect(result).toBe(base_url);
	});
});

describe("get_jwt", () => {
	it("should return a valid JWT token when the API call is successful", async () => {
		const space = "hmb/hello_world";
		const token = "hf_123";
		const expected_jwt = "jwt_123";

		const result = await get_jwt(space, token);

		expect(result).toBe(expected_jwt);
	});

	it("should return false when the API call fails", async () => {
		const space = "hmb/bye_world";
		const token = "hf_123";

		const result = await get_jwt(space, token);

		expect(result).toBe(false);
	});
});

describe("determine_protocol", () => {
	it('should return the correct protocols and host when the endpoint starts with "http"', () => {
		const endpoint = "http://huggingface.co";
		const result = determine_protocol(endpoint);
		expect(result).toEqual({
			ws_protocol: "ws",
			http_protocol: "http:",
			host: "huggingface.co"
		});
	});

	it('should return the correct protocols and host when the endpoint starts with "https"', () => {
		const endpoint = "https://huggingface.co";
		const result = determine_protocol(endpoint);
		expect(result).toEqual({
			ws_protocol: "wss",
			http_protocol: "https:",
			host: "huggingface.co"
		});
	});

	it('should return the correct protocols and host when the endpoint starts with "file"', () => {
		const endpoint = "file:///path/to/app.html";
		const result = determine_protocol(endpoint);
		expect(result).toEqual({
			ws_protocol: "ws",
			http_protocol: "http:",
			host: "lite.local"
		});
	});

	it('should return the default protocols and host when the endpoint does not start with "http" or "file"', () => {
		const endpoint = "huggingface.co";
		const result = determine_protocol(endpoint);
		expect(result).toEqual({
			ws_protocol: "wss",
			http_protocol: "https:",
			host: "huggingface.co"
		});
	});
});
