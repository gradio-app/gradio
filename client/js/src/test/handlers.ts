import { HttpResponse, http, RequestHandler } from "msw";
import {
	HOST_URL,
	API_INFO_URL,
	CONFIG_URL,
	RUNTIME_URL,
	SLEEPTIME_URL,
	UPLOAD_URL,
	BROKEN_CONNECTION_MSG,
	LOGIN_URL
} from "../constants";
import {
	response_api_info,
	config_response,
	whoami_response,
	duplicate_response,
	hardware_sleeptime_response,
	discussions_response,
	runtime_response
} from "./test_data";

const root_url = "https://huggingface.co";

export const direct_space_url = "https://hmb-hello-world.hf.space";
const private_space_url = "https://hmb-secret-world.hf.space";
const private_auth_space_url = "https://hmb-private-auth-space.hf.space";

const server_error_space_url = "https://hmb-server-error.hf.space";
const upload_server_test_space_url = "https://hmb-server-test.hf.space";
const auth_app_space_url = "https://hmb-auth-space.hf.space";
const unauth_app_space_url = "https://hmb-unauth-space.hf.space";
const invalid_auth_space_url = "https://hmb-invalid-auth-space.hf.space";

const server_error_reference = "hmb/server_error";
const app_reference = "hmb/hello_world";
const broken_app_reference = "hmb/bye_world";
const duplicate_app_reference = "gradio/hello_world";
const private_app_reference = "hmb/secret_world";
const server_test_app_reference = "hmb/server_test";
const auth_app_reference = "hmb/auth_space";
const unauth_app_reference = "hmb/unauth_space";
const invalid_auth_app_reference = "hmb/invalid_auth_space";
const private_auth_app_reference = "hmb/private_auth_space";

export const handlers: RequestHandler[] = [
	// /host requests
	http.get(`${root_url}/api/spaces/${app_reference}/${HOST_URL}`, () => {
		return new HttpResponse(
			JSON.stringify({
				subdomain: "hmb-hello-world",
				host: "https://hmb-hello-world.hf.space"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${root_url}/api/spaces/${broken_app_reference}/${HOST_URL}`, () => {
		return new HttpResponse(null, {
			status: 404,
			headers: {
				"Content-Type": "application/json",
				hf_token: "hf_123"
			}
		});
	}),
	http.get(
		`${root_url}/api/spaces/${private_auth_app_reference}/${HOST_URL}`,
		() => {
			return new HttpResponse(
				JSON.stringify({
					subdomain: "hmb-private-auth-space",
					host: "https://hmb-private-auth-space.hf.space"
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	),
	http.get(
		`${root_url}/api/spaces/${private_app_reference}/${HOST_URL}`,
		({ request }) => {
			const token = request.headers.get("authorization")?.substring(7);

			if (!token || token !== "hf_123") {
				return new HttpResponse(null, {
					status: 401,
					headers: {
						"Content-Type": "application/json"
					}
				});
			}

			return new HttpResponse(
				JSON.stringify({
					subdomain: private_app_reference,
					host: private_space_url
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	),
	http.get(
		`${root_url}/api/spaces/${server_error_reference}/${HOST_URL}`,
		() => {
			return new HttpResponse(
				JSON.stringify({
					subdomain: "hmb-server-test",
					host: "https://hmb-server-test.hf.space"
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	),
	http.get(
		`${root_url}/api/spaces/${server_test_app_reference}/${HOST_URL}`,
		() => {
			return new HttpResponse(
				JSON.stringify({
					subdomain: "hmb-server-test",
					host: "https://hmb-server-test.hf.space"
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	),
	http.get(`${root_url}/api/spaces/${auth_app_reference}/${HOST_URL}`, () => {
		return new HttpResponse(
			JSON.stringify({
				subdomain: "hmb-auth-space",
				host: "https://hmb-auth-space.hf.space"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(
		`${root_url}/api/spaces/${invalid_auth_app_reference}/${HOST_URL}`,
		() => {
			return new HttpResponse(
				JSON.stringify({
					subdomain: "hmb-invalid-auth-space",
					host: "https://hmb-invalid-auth-space.hf.space"
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	),
	http.get(
		`${root_url}/api/spaces/${duplicate_app_reference}/${HOST_URL}`,
		() => {
			return new HttpResponse(
				JSON.stringify({
					subdomain: "gradio-hello-world",
					host: "https://gradio-hello-world.hf.space"
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	),
	http.get(`${root_url}/api/spaces/${unauth_app_reference}/${HOST_URL}`, () => {
		return new HttpResponse(
			JSON.stringify({
				subdomain: "hmb-unath-space",
				host: "https://hmb-unauth-space.hf.space"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	// /info requests
	http.get(`${direct_space_url}/${API_INFO_URL}`, () => {
		return new HttpResponse(JSON.stringify(response_api_info), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${upload_server_test_space_url}/${API_INFO_URL}`, () => {
		return new HttpResponse(JSON.stringify(response_api_info), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${private_space_url}/${API_INFO_URL}`, () => {
		return new HttpResponse(JSON.stringify(response_api_info), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${server_error_space_url}/${API_INFO_URL}`, () => {
		return new HttpResponse(JSON.stringify(response_api_info), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${auth_app_space_url}/${API_INFO_URL}`, async () => {
		return new HttpResponse(JSON.stringify(response_api_info), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${private_auth_space_url}/${API_INFO_URL}`, async () => {
		return new HttpResponse(JSON.stringify(response_api_info), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// /config requests
	http.get(`${direct_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(JSON.stringify(config_response), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${private_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(
			JSON.stringify({
				...config_response,
				root: "https://hmb-secret-world.hf.space"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${upload_server_test_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(
			JSON.stringify({
				...config_response,
				root: "https://hmb-server-test.hf.space"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${private_auth_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(
			JSON.stringify({
				...config_response,
				root: "https://hmb-private-auth-space.hf.space"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${direct_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(JSON.stringify(config_response), {
			status: 500,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${server_error_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(JSON.stringify(config_response), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${invalid_auth_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(JSON.stringify({ detail: "Unauthorized" }), {
			status: 401,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${auth_app_space_url}/${CONFIG_URL}`, ({ request }) => {
		return new HttpResponse(
			JSON.stringify({
				...config_response,
				root: "https://hmb-auth-space.hf.space",
				space_id: "hmb/auth_space"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${unauth_app_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(
			JSON.stringify({
				detail: "Unauthorized"
			}),
			{
				status: 401,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	// /whoami requests
	http.get(`${root_url}/api/whoami-v2`, () => {
		return new HttpResponse(JSON.stringify(whoami_response), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"hf-token": "hf_123"
			}
		});
	}),
	// /duplicate requests
	http.post(
		`${root_url}/api/spaces/${duplicate_app_reference}/duplicate`,
		({ request }) => {
			if (request.headers.get("authorization")?.substring(7) !== "hf_123") {
				throw new HttpResponse(null, {
					status: 401,
					headers: {
						"Content-Type": "application/json"
					}
				});
			}
			return new HttpResponse(JSON.stringify(duplicate_response), {
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			});
		}
	),
	// /sleeptime requests
	http.post(`${root_url}/api/spaces/${app_reference}/${SLEEPTIME_URL}`, () => {
		return new HttpResponse(JSON.stringify(hardware_sleeptime_response), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.post(
		`${root_url}/api/spaces/${server_test_app_reference}/${SLEEPTIME_URL}`,
		() => {
			throw new HttpResponse(null, {
				status: 500,
				headers: {
					"Content-Type": "application/json"
				}
			});
		}
	),
	// /runtime requests
	http.get(
		`${root_url}/api/spaces/${broken_app_reference}/${RUNTIME_URL}`,
		() => {
			return new HttpResponse(null, {
				status: 404,
				headers: {
					"Content-Type": "application/json"
				}
			});
		}
	),
	http.get(`${root_url}/api/spaces/${app_reference}/${RUNTIME_URL}`, () => {
		return new HttpResponse(JSON.stringify(hardware_sleeptime_response), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// queue requests
	http.get(`${direct_space_url}/queue/data`, () => {
		return new HttpResponse(JSON.stringify({ event_id: "123" }), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.post(`${direct_space_url}/queue/join`, () => {
		return new HttpResponse(JSON.stringify({ event_id: "123" }), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// upload requests
	http.post(`${direct_space_url}/${UPLOAD_URL}`, () => {
		return new HttpResponse(JSON.stringify(["lion.jpg"]), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.post(`${upload_server_test_space_url}/${UPLOAD_URL}`, () => {
		throw new HttpResponse(JSON.parse("Internal Server Error"), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// discussions requests
	http.head(`${root_url}/api/spaces/${app_reference}/discussions`, () => {
		return new HttpResponse(JSON.stringify(discussions_response), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.head(
		`${root_url}/api/spaces/${broken_app_reference}/discussions`,
		() => {
			throw new HttpResponse(
				JSON.parse("Discussions are disabled for this repo"),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		}
	),
	// space requests
	http.get(`${root_url}/api/spaces/${app_reference}`, () => {
		return new HttpResponse(
			JSON.stringify({ id: app_reference, runtime: runtime_response }),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${root_url}/api/spaces/hmb/paused_space`, () => {
		return new HttpResponse(
			JSON.stringify({
				id: app_reference,
				runtime: { ...runtime_response, stage: "PAUSED" }
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${root_url}/api/spaces/hmb/building_space`, () => {
		return new HttpResponse(
			JSON.stringify({
				id: app_reference,
				runtime: { ...runtime_response, stage: "BUILDING" }
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${root_url}/api/spaces/hmb/stopped_space`, () => {
		return new HttpResponse(
			JSON.stringify({
				id: app_reference,
				runtime: { ...runtime_response, stage: "STOPPED" }
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${root_url}/api/spaces/hmb/failed_space`, () => {
		throw new HttpResponse(null, {
			status: 500,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.get(`${root_url}/api/spaces/${unauth_app_reference}`, () => {
		return new HttpResponse(
			JSON.stringify({
				id: unauth_app_reference,
				runtime: { ...runtime_response }
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	// jwt requests
	http.get(`${root_url}/api/spaces/${app_reference}/jwt`, () => {
		return new HttpResponse(
			JSON.stringify({
				token: "jwt_123"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
	http.get(`${root_url}/api/spaces/${broken_app_reference}/jwt`, () => {
		return new HttpResponse(null, {
			status: 500,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// post_data requests
	http.post(`${direct_space_url}`, () => {
		return new HttpResponse(JSON.stringify({}), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.post(`${private_space_url}`, () => {
		return new HttpResponse(JSON.stringify(BROKEN_CONNECTION_MSG), {
			status: 500,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// heartbeat requests
	http.get(`*/heartbeat/*`, () => {
		return new HttpResponse(null, {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// login requests
	http.post(`${auth_app_space_url}/${LOGIN_URL}`, async ({ request }) => {
		let username;
		let password;

		await request.formData().then((data) => {
			username = data.get("username");
			password = data.get("password");
		});

		if (username === "admin" && password === "pass1234") {
			return new HttpResponse(
				JSON.stringify({
					success: true
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Set-Cookie":
							"access-token-123=abc; HttpOnly; Path=/; SameSite=none; Secure",
						// @ts-ignore - multiple Set-Cookie headers are returned
						"Set-Cookie":
							"access-token-unsecure-123=abc; HttpOnly; Path=/; SameSite=none; Secure"
					}
				}
			);
		}

		return new HttpResponse(null, {
			status: 401,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.post(`${invalid_auth_space_url}/${LOGIN_URL}`, async () => {
		return new HttpResponse(null, {
			status: 401,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	http.post(`${private_auth_space_url}/${LOGIN_URL}`, async ({ request }) => {
		let username;
		let password;

		await request.formData().then((data) => {
			username = data.get("username");
			password = data.get("password");
		});

		if (username === "admin" && password === "pass1234") {
			return new HttpResponse(
				JSON.stringify({
					success: true
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Set-Cookie":
							"access-token-123=abc; HttpOnly; Path=/; SameSite=none; Secure",
						// @ts-ignore - multiple Set-Cookie headers are returned
						"Set-Cookie":
							"access-token-unsecure-123=abc; HttpOnly; Path=/; SameSite=none; Secure"
					}
				}
			);
		}

		return new HttpResponse(null, {
			status: 401,
			headers: {
				"Content-Type": "application/json"
			}
		});
	})
];
