import {
	resolve_root,
	get_jwt,
	determine_protocol,
	parse_and_set_cookies
} from "../helpers/init_helpers";
import { initialise_server } from "./server";
import { beforeAll, afterEach, afterAll, it, expect, describe } from "vitest";
import { Client } from "../client";
import { INVALID_CREDENTIALS_MSG, MISSING_CREDENTIALS_MSG } from "../constants";

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
});

describe("parse_and_set_cookies", () => {
	it("should return an empty array when the cookie header is empty", () => {
		const cookie_header = "";
		const result = parse_and_set_cookies(cookie_header);
		expect(result).toEqual([]);
	});

	it("should parse the cookie header and return an array of cookies", () => {
		const cookie_header = "access-token-123=abc;access-token-unsecured-456=def";
		const result = parse_and_set_cookies(cookie_header);
		expect(result).toEqual(["access-token-123=abc"]);
	});
});

describe("resolve_cookies", () => {
	it("should set the cookies when correct auth credentials are provided", async () => {
		const client = await Client.connect("hmb/auth_space", {
			auth: ["admin", "pass1234"]
		});

		const api = client.view_api();
		expect((await api).named_endpoints["/predict"]).toBeDefined();
	});

	it("should connect to a private and authenticated space", async () => {
		const client = await Client.connect("hmb/private_auth_space", {
			hf_token: "hf_123",
			auth: ["admin", "pass1234"]
		});

		const api = client.view_api();
		expect((await api).named_endpoints["/predict"]).toBeDefined();
	});

	it("should not set the cookies when auth credentials are invalid", async () => {
		await expect(
			Client.connect("hmb/invalid_auth_space", {
				auth: ["admin", "wrong_password"]
			})
		).rejects.toThrowError(INVALID_CREDENTIALS_MSG);
	});

	it("should not set the cookies when auth option is not provided in an auth space", async () => {
		await expect(Client.connect("hmb/unauth_space")).rejects.toThrowError(
			MISSING_CREDENTIALS_MSG
		);
	});
});
