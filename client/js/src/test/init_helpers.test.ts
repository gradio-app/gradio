import {
	resolve_root,
	get_jwt,
	determine_protocol,
	parse_and_set_cookies,
	resolve_config,
	resolve_config_root
} from "../helpers/init_helpers";
import { initialise_server } from "./server";
import { beforeAll, afterEach, afterAll, it, expect, describe } from "vitest";
import { Client } from "../client";
import { INVALID_CREDENTIALS_MSG, MISSING_CREDENTIALS_MSG } from "../constants";
import { config_response } from "./test_data";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

describe("resolve_config", () => {
	it("uses the public protocol and port for a same-host proxy root", () => {
		expect(
			resolve_config_root(
				"http://machine.local:7862/gradio",
				"https://machine.local:20443/gradio"
			)
		).toBe("https://machine.local:20443/gradio");
	});

	it("keeps the configured origin for a remote root", () => {
		expect(
			resolve_config_root(
				"https://remote.example/gradio",
				"https://host.example/page"
			)
		).toBe("https://remote.example/gradio");
	});

	it("requests /config without a Content-Type header and with same-origin credentials, so the cross-origin embed fetch is not blocked by CORS", async () => {
		let captured_init: RequestInit | undefined;
		const fake_client = {
			options: {},
			deep_link: null,
			fetch: (_url: string, init: RequestInit) => {
				captured_init = init;
				return Promise.resolve(
					new Response(JSON.stringify(config_response), { status: 200 })
				);
			}
		} as unknown as Client;

		await resolve_config.call(fake_client, "https://hmb-hello-world.hf.space");

		expect(captured_init).toBeDefined();
		const header_names = Object.keys(
			captured_init?.headers as Record<string, string>
		).map((h) => h.toLowerCase());
		expect(header_names).not.toContain("content-type");
		expect(captured_init?.credentials).toBe("same-origin");
	});

	const in_browser = typeof window !== "undefined";

	it.skipIf(!in_browser)(
		"uses the browser origin for a same-host config root behind a proxy",
		async () => {
			const page = new URL(window.location.href);
			const internal_root = `${page.protocol}//${page.hostname}:7862/gradio`;
			window.gradio_config = {
				...config_response,
				root: internal_root
			};
			const fake_client = {
				options: {},
				deep_link: null
			} as unknown as Client;

			try {
				const config = await resolve_config.call(fake_client, internal_root);
				expect(config?.root).toBe(`${page.origin}/gradio`);
			} finally {
				delete (window as Partial<Window>).gradio_config;
			}
		}
	);

	it.skipIf(!in_browser)(
		"keeps a remote config root when the page and backend hostnames differ",
		async () => {
			const remote_root = "https://remote.example/gradio";
			window.gradio_config = {
				...config_response,
				root: remote_root
			};
			const fake_client = {
				options: {},
				deep_link: null
			} as unknown as Client;

			try {
				const config = await resolve_config.call(fake_client, remote_root);
				expect(config?.root).toBe(remote_root);
			} finally {
				delete (window as Partial<Window>).gradio_config;
			}
		}
	);
});

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
			token: "hf_123",
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
