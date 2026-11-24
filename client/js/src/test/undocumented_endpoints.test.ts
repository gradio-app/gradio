import { describe, beforeAll, afterEach, afterAll, test, expect } from "vitest";
import { HttpResponse, http } from "msw";

import { Client } from "../client";
import { API_INFO_URL, CONFIG_URL } from "../constants";
import { direct_space_url } from "./handlers";
import { initialise_server } from "./server";
import {
	config_response,
	response_api_info,
	transformed_api_info
} from "./test_data";

let server: Awaited<ReturnType<typeof initialise_server>>;

beforeAll(async () => {
	server = await initialise_server();
	await server.start({ quiet: true });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.stop());

const json = (body: unknown, status = 200): HttpResponse<any> =>
	new HttpResponse(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});

const hidden_dependency = {
	...config_response.dependencies[0],
	id: 5,
	targets: [],
	inputs: [1, 2],
	outputs: [],
	api_name: "hidden",
	api_visibility: "undocumented"
};

const parameter = (name: string): any => ({
	...response_api_info.named_endpoints["/predict"].parameters[0],
	label: name,
	parameter_name: name,
	parameter_has_default: false
});

// /info lists the endpoint only when asked for all endpoints, as Gradio does
// for api_visibility="undocumented"
function serve(
	dependencies: any[],
	all_endpoints_status = 200
): { info_urls: string[]; joins: any[] } {
	const info_urls: string[] = [];
	const joins: any[] = [];
	server.use(
		http.get(`${direct_space_url}/${CONFIG_URL}`, () =>
			json({ ...config_response, dependencies })
		),
		http.get(`${direct_space_url}/${API_INFO_URL}`, ({ request }) => {
			info_urls.push(request.url);
			if (!new URL(request.url).searchParams.get("all_endpoints")) {
				return json(response_api_info);
			}
			if (all_endpoints_status !== 200) return json({}, all_endpoints_status);
			return json({
				...response_api_info,
				named_endpoints: {
					...response_api_info.named_endpoints,
					"/hidden": {
						parameters: [parameter("a"), parameter("b")],
						returns: [],
						api_visibility: "undocumented"
					}
				}
			});
		}),
		http.post(`${direct_space_url}/queue/join`, async ({ request }) => {
			joins.push(await request.json());
			return json({ event_id: "123" });
		})
	);
	return { info_urls, joins };
}

describe("an undocumented endpoint", () => {
	test("takes named arguments, and stays out of view_api()", async () => {
		const { joins } = serve([
			...config_response.dependencies,
			hidden_dependency
		]);
		const app = await Client.connect("hmb/hello_world");

		expect(await app.view_api()).toEqual(transformed_api_info);

		const job = app.submit("/hidden", { b: 2, a: 1 });
		const errors: string[] = [];
		const reading = (async () => {
			for await (const message of job) {
				if (message.type === "status" && message.stage === "error") {
					errors.push(String(message.message));
				}
			}
		})();
		await expect.poll(() => joins.length + errors.length).toBeGreaterThan(0);
		job.cancel();
		await Promise.race([reading, new Promise((r) => setTimeout(r, 100))]);

		expect(errors).toEqual([]);
		expect(joins[0].data).toEqual([1, 2]);
	});

	test("does not cost a request when the app has none", async () => {
		const { info_urls } = serve(config_response.dependencies);
		await Client.connect("hmb/hello_world");

		expect(
			info_urls.filter((url) => new URL(url).searchParams.get("all_endpoints"))
		).toEqual([]);
	});

	test("an app whose full endpoint list fails to load still connects", async () => {
		serve([...config_response.dependencies, hidden_dependency], 500);
		const app = await Client.connect("hmb/hello_world");

		expect(await app.view_api()).toEqual(transformed_api_info);
	});
});
