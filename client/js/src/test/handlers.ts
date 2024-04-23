import { HttpResponse, http, RequestHandler } from "msw";
import {
	HOST_URL,
	API_INFO_URL,
	CONFIG_URL,
	RUNTIME_URL,
	SLEEPTIME_URL
} from "../constants";
import {
	response_api_info,
	config_response,
	whoami_response,
	duplicate_response,
	hardware_sleeptime_response
} from "./test_data";

const root_url = "https://huggingface.co";
const direct_space_url = "https://hmb-hello-world.hf.space";
const private_space_url = "https://hmb-secret-world.hf.space";
const app_reference = "hmb/hello_world";
const broken_app_reference = "hmb/bye_world";
const duplicate_app_reference = "gradio/hello_world";
const private_app_reference = "hmb/secret_world";

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
					subdomain: "hmb-secret-world",
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
	// /info requests
	http.get(`${direct_space_url}/${API_INFO_URL}`, () => {
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
	http.get(`${direct_space_url}/${CONFIG_URL}`, () => {
		return new HttpResponse(JSON.stringify(config_response), {
			status: 500,
			headers: {
				"Content-Type": "application/json"
			}
		});
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
	// /runtime requests
	http.get(`${root_url}/api/spaces/${app_reference}/${RUNTIME_URL}`, () => {
		return new HttpResponse(JSON.stringify(hardware_sleeptime_response), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}),
	// /duplicate requests
	http.post(
		`${root_url}/api/spaces/${duplicate_app_reference}/duplicate`,
		({ request }) => {
			if (request.headers.get("authorization")?.substring(7) !== "hf_123") {
				return new HttpResponse(null, {
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
	// /jwt requests
	http.get(`${root_url}/api/spaces/${app_reference}/jwt`, () => {
		return new HttpResponse(
			JSON.stringify({
				token: "hf_123"
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	}),
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
	)
];
