import { vi, test, describe, expect, beforeEach, afterEach, it } from "vitest";
import {
	resolve_config,
	map_names_to_ids,
	resolve_root,
	determine_protocol,
	get_type,
	get_description,
	process_endpoint,
	transform_api_info
} from "../src/helpers";
import { Config } from "../src/types";
import fetchMock from "fetch-mock";
import { post_data } from "../src/utils/post_data";
import { handle_blob } from "../src/utils/handle_blob";
import { BROKEN_CONNECTION_MSG, UPLOAD_URL } from "../src/constants";
import * as uploadModule from "../src/utils/upload_files";
import { update_object, walk_and_store_blobs } from "../src/helpers/data";
import { test_api_info, test_config, test_endpoint_info } from "../test_data";

describe("utility functions", async () => {
	beforeEach(() => {
		fetchMock.restore();
	});

	afterEach(() => {
		fetchMock.restore();
	});

	describe("map_names_to_ids", async () => {
		test("runs map_names_to_ids", async () => {
			let test_deps: Config["dependencies"] = [
				{
					targets: [[0, ""]],
					inputs: [],
					outputs: [0],
					backend_fn: true,
					js: null,
					scroll_to_output: false,
					show_progress: "full",
					queue: true,
					api_name: null,
					cancels: [],
					types: { continuous: false, generator: false },
					collects_event_data: false,
					trigger_mode: "once",
					final_event: null,
					show_api: false
				}
			];

			let result = map_names_to_ids(test_deps);
			expect(result).toEqual({});
		});
	});

	describe("resolve_config", async () => {
		test("runs resolve_config", async () => {
			let endpoint = `https://abidlabs-whisper.hf.space`;

			fetchMock.mock(`${endpoint}/config`, {
				status: 200,
				body: JSON.stringify(test_config)
			});

			let fetch_implementation: typeof fetch = fetch;
			let token: `hf_${string}` = "hf_123";
			let result = await resolve_config(fetch_implementation, endpoint, token);

			let expected_keys = {
				root: "https://abidlabs-whisper.hf.space",
				title: "Gradio",
				mode: "blocks",
				theme: "default",
				dev_mode: false,
				enable_queue: true,
				is_colab: false,
				is_space: true
			};

			expect(result).toEqual(expect.objectContaining(expected_keys));
			expect(result?.dependencies).toHaveLength(2);
			expect(result?.components).toHaveLength(13);
		});

		test("runs resolve_config without token", async () => {
			let endpoint = `https://abidlabs-whisper.hf.space`;

			fetchMock.mock(`${endpoint}/config`, {
				status: 200,
				body: JSON.stringify(test_config)
			});

			let fetch_implementation: typeof fetch = fetch;
			let result = await resolve_config(fetch_implementation, endpoint);

			let expected_keys = {
				root: "https://abidlabs-whisper.hf.space",
				title: "Gradio",
				mode: "blocks",
				theme: "default",
				dev_mode: false,
				enable_queue: true,
				is_colab: false,
				is_space: true
			};

			expect(result).toEqual(expect.objectContaining(expected_keys));
			expect(result?.dependencies).toHaveLength(2);
			expect(result?.components).toHaveLength(13);
		});
	});

	describe("resolve_root", async () => {
		test("runs resolve_root", async () => {
			let base_url = "http://localhost:7860";
			let root_path = "/gradio";
			let prioritize_base = true;

			let result = resolve_root(base_url, root_path, prioritize_base);
			expect(result).toBe("http://localhost:7860/gradio");
		});
	});

	describe("determine_protocol", async () => {
		it("runs determine_protocol", async () => {
			let endpoint = "http://localhost:7860";
			let result = determine_protocol(endpoint);

			expect(result).toEqual({
				http_protocol: "http:",
				host: "localhost:7860"
			});
		});
	});

	describe("get_type", async () => {
		it("runs get_type", async () => {
			let type = { type: "image", description: "image component" };
			let component = "Image";
			let serializer = "ImgSerializable";
			let signature_type: "parameter" | "return" = "parameter";

			let result = get_type(type, component, serializer, signature_type);
			expect(result).toEqual("Blob | File | Buffer");
		});
	});

	describe("get_description", async () => {
		it("runs get_description", async () => {
			let type = {
				type: "array",
				description: "array of files or single file"
			};
			let serializer = "JSONSerializable";

			let result = get_description(type, serializer);
			expect(result).toEqual("array of files or single file");
		});
	});

	describe("process_endpoint", async () => {
		it("runs process_endpoint", async () => {
			let app_reference = `abidlabs-whisper.hf.space`;
			let token: `hf_${string}` = "hf_abcdef";

			let result = await process_endpoint(app_reference, token);

			expect(result).toEqual({
				host: "abidlabs-whisper.hf.space",
				http_protocol: "https:",
				space_id: "abidlabs-whisper"
			});
		});
	});

	describe("transform_api_info", async () => {
		it("runs transform_api_info", async () => {
			let api_info = test_api_info;

			let result = transform_api_info(api_info, test_config, {});

			expect(result).toEqual(
				expect.objectContaining({
					named_endpoints: {
						"/predict": {
							parameters: [
								{
									component: "TextInput",
									label: "TextInput",
									description: "",
									type: "string"
								}
							],
							returns: [
								{
									label: "Checkbox",
									component: "Checkbox",
									description: "",
									type: "boolean"
								}
							]
						}
					},
					unnamed_endpoints: {
						0: {
							parameters: [
								{
									component: "TextInput",
									label: "TextInput",
									description: "",
									type: "string"
								}
							],
							returns: [
								{
									label: "Checkbox",
									component: "Checkbox",
									description: "",
									type: "boolean"
								}
							]
						}
					}
				})
			);
		});
	});

	describe("post_data", () => {
		const test_url = `https://huggingface.co/api/spaces/abidlabs/whisper`;
		const token = "hf_token";
		const test_data = { key: "value" };

		it("successfully posts data with valid token", async () => {
			fetchMock.post(test_url, {
				status: 200,
				body: { result: "success" }
			});

			const [response, status] = await post_data(test_url, test_data, token);
			expect(response).toEqual({ result: "success" });
			expect(status).toBe(200);
			expect(fetchMock.lastOptions()?.headers).toEqual({
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json"
			});
		});

		it("returns an error message on server error", async () => {
			fetchMock.post(test_url, 500);

			const [response, status] = await post_data(test_url, test_data);
			expect(response).toHaveProperty("error");
			expect(status).toBe(500);
		});

		it("handles network error gracefully", async () => {
			fetchMock.post(test_url, { throws: new Error("Network failure") });

			const [response, status] = await post_data(test_url, test_data);
			expect(response).toEqual({ error: BROKEN_CONNECTION_MSG });
			expect(status).toBe(500);
		});

		it("returns an error when response cannot be parsed", async () => {
			fetchMock.post(test_url, {
				status: 200,
				body: "invalid JSON",
				headers: { "Content-Type": "application/json" }
			});

			const [response, status] = await post_data(test_url, test_data);
			expect(response.error).toMatch(/Could not parse server response:/);
			expect(status).toBe(500);
		});
	});

	describe("update_object", () => {
		it("updates a top-level property", () => {
			const obj = { top: "original" };
			update_object(obj, "updated", ["top"]);
			expect(obj.top).toBe("updated");
		});

		it("updates a deeply nested property", () => {
			const obj = { level1: { level2: { target: "original" } } };
			update_object(obj, "updated", ["level1", "level2", "target"]);
			expect(obj.level1.level2.target).toBe("updated");
		});

		it("updates an item within an array", () => {
			const obj = { array: ["first", "second", "third"] };
			update_object(obj, "updated", ["array", 1]);
			expect(obj.array[1]).toBe("updated");
		});

		it("throws an error for an invalid key type", () => {
			const obj = {};
			expect(() => {
				// @ts-ignore
				update_object(obj, "value", [{}]);
			}).toThrow("Invalid key type");
		});

		it("throws an error for a path that does not exist", () => {
			const obj = { exists: {} };
			expect(() => {
				update_object(obj, "value", ["doesNotExist", "subPath"]);
			}).toThrow();
		});
	});

	// describe("handle_blob", () => {
	// 	const endpoint = `https://huggingface.co/api/spaces/abidlabs/whisper/${UPLOAD_URL}`;
	// 	const token = "hf_token";
	// 	const inputData: unknown[] = [
	// 		{
	// 			label: "Test Label",
	// 			type: "string",
	// 			component: "Test Component",
	// 			example_input: "Example Input",
	// 			serializer: "Test Serializer",
	// 			python_type: "string"
	// 		}
	// 	];

	// 	beforeEach(() => {
	// 		fetchMock.restore();
	// 		vi.restoreAllMocks();

	// 		vi.spyOn(uploadModule, "upload_files").mockResolvedValue({
	// 			files: [
	// 				`https://huggingface.co/api/spaces/abidlabs/whisper/${UPLOAD_URL}`
	// 			]
	// 		});
	// 	});

	// 	afterEach(() => {
	// 		fetchMock.restore();
	// 		vi.restoreAllMocks();
	// 	});

	// 	it("processes input data and updates with file URLs", async () => {
	// 		const processedData = await handle_blob(
	// 			endpoint,
	// 			inputData,
	// 			test_endpoint_info,
	// 			token
	// 		);

	// 		expect(uploadModule.upload_files).toHaveBeenCalled();
	// 		expect(processedData).toEqual({});
	// 	});
	// });

	describe("walk_and_store_blobs", () => {
		it("handles an empty array", async () => {
			const result = await walk_and_store_blobs(
				[],
				undefined,
				[],
				false,
				test_endpoint_info
			);
			expect(result).toEqual([]);
		});

		it("processes nested arrays and objects", async () => {
			const input = [{ nested: [Buffer.from("test")] }];
			const result = await walk_and_store_blobs(
				input,
				undefined,
				[],
				true,
				test_endpoint_info
			);

			expect(result.length).toBeGreaterThan(0);
			expect(result[0].blob).toBeInstanceOf(Blob);
		});

		it("correctly identifies and skips Image type blobs", async () => {
			const imageBuffer = Buffer.from("image data");
			const result = await walk_and_store_blobs(
				[imageBuffer],
				"Image",
				["image"],
				false,
				test_endpoint_info
			);

			expect(result[0].blob).toBeFalsy();
		});

		it("accumulates paths correctly for nested structures", async () => {
			const input = { a: { b: Buffer.from("nested") } };
			const result = await walk_and_store_blobs(
				input,
				undefined,
				[],
				false,
				test_endpoint_info
			);

			expect(result[0].path).toEqual(["a", "b"]);
			expect(result[0].blob).toBeInstanceOf(Blob);
		});
	});
});
