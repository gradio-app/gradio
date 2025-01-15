import {
	INVALID_URL_MSG,
	QUEUE_FULL_MSG,
	SPACE_METADATA_ERROR_MSG
} from "../constants";
import { beforeAll, afterEach, afterAll, it, expect, describe } from "vitest";
import {
	handle_message,
	get_description,
	get_type,
	process_endpoint,
	join_urls,
	map_data_to_params
} from "../helpers/api_info";
import { initialise_server } from "./server";
import { transformed_api_info } from "./test_data";

const server = initialise_server();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("handle_message", () => {
	it("should return type 'data' when msg is 'send_data'", () => {
		const data = { msg: "send_data" };
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({ type: "data" });
	});

	it("should return type 'hash' when msg is 'send_hash'", () => {
		const data = { msg: "send_hash" };
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({ type: "hash" });
	});

	it("should return type 'update' with queue full message when msg is 'queue_full'", () => {
		const data = { msg: "queue_full", code: 500, success: false };
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "update",
			status: {
				queue: true,
				message: QUEUE_FULL_MSG,
				stage: "error",
				code: 500,
				success: false
			}
		});
	});

	it("should return type 'heartbeat' when msg is 'heartbeat'", () => {
		const data = { msg: "heartbeat" };
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({ type: "heartbeat" });
	});

	it("should return type 'unexpected_error' with error message when msg is 'unexpected_error'", () => {
		const data = { msg: "unexpected_error", message: "Something went wrong" };
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "unexpected_error",
			status: {
				queue: true,
				message: "Something went wrong",
				stage: "error",
				success: false
			}
		});
	});

	it("should return type 'update' with estimation status when msg is 'estimation'", () => {
		const data = {
			msg: "estimation",
			code: 200,
			queue_size: 10,
			rank: 5,
			rank_eta: 60,
			success: true
		};
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "update",
			status: {
				queue: true,
				stage: "pending",
				code: 200,
				size: 10,
				position: 5,
				eta: 60,
				success: true
			}
		});
	});

	it("should return type 'update' with progress status when msg is 'progress'", () => {
		const data = {
			msg: "progress",
			code: 200,
			progress_data: { current: 50, total: 100 },
			success: true
		};
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "update",
			status: {
				queue: true,
				stage: "pending",
				code: 200,
				progress_data: { current: 50, total: 100 },
				success: true
			}
		});
	});

	it("should return type 'log' with the provided data when msg is 'log'", () => {
		const data = { msg: "log", log_data: "Some log message" };
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "log",
			data: { msg: "log", log_data: "Some log message" }
		});
	});

	it("should return type 'generating' with generating status when msg is 'process_generating' and success is true", () => {
		const data = {
			msg: "process_generating",
			success: true,
			code: 200,
			progress_data: { current: 50, total: 100 },
			average_duration: 120,
			output: { result: "Some result" }
		};
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "generating",
			status: {
				queue: true,
				message: null,
				stage: "generating",
				code: 200,
				progress_data: { current: 50, total: 100 },
				eta: 120
			},
			data: { result: "Some result" }
		});
	});

	it("should return type 'update' with error status when msg is 'process_generating' and success is false", () => {
		const data = {
			msg: "process_generating",
			success: false,
			code: 500,
			progress_data: { current: 50, total: 100 },
			average_duration: 120,
			output: { error: "Error" }
		};
		const last_status = "pending";
		const result = handle_message(data, last_status);

		expect(result).toEqual({
			type: "generating",
			data: null,
			status: {
				eta: 120,
				queue: true,
				message: "Error",
				stage: "error",
				code: 500,
				progress_data: { current: 50, total: 100 }
			}
		});
	});

	it("should return type 'complete' with success status when msg is 'process_completed' and success is true", () => {
		const data = {
			msg: "process_completed",
			success: true,
			code: 200,
			progress_data: { current: 100, total: 100 },
			output: { result: "Some result" }
		};
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "complete",
			status: {
				queue: true,
				message: undefined,
				stage: "complete",
				code: 200,
				progress_data: { current: 100, total: 100 }
			},
			data: { result: "Some result" }
		});
	});

	it("should return type 'update' with error status when msg is 'process_completed' and success is false", () => {
		const data = {
			msg: "process_completed",
			success: false,
			code: 500,
			progress_data: { current: 100, total: 100 },
			output: { error: "Some error message" }
		};
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "update",
			status: {
				queue: true,
				message: "Some error message",
				stage: "error",
				code: 500,
				success: false
			}
		});
	});

	it("should return type 'update' with pending status when msg is 'process_starts'", () => {
		const data = {
			msg: "process_starts",
			code: 200,
			rank: 5,
			success: true,
			eta: 60
		};
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "update",
			original_msg: "process_starts",
			status: {
				queue: true,
				stage: "pending",
				code: 200,
				size: 5,
				position: 0,
				success: true,
				eta: 60
			}
		});
	});

	it("should return type 'none' with error status when msg is unknown", () => {
		const data = { msg: "unknown" };
		const last_status = "pending";
		const result = handle_message(data, last_status);
		expect(result).toEqual({
			type: "none",
			status: { stage: "error", queue: true }
		});
	});
});

describe("get_description", () => {
	it("should return 'array of [file, label] tuples' when serializer is 'GallerySerializable'", () => {
		const type = { type: "string", description: "param description" };
		const serializer = "GallerySerializable";
		const result = get_description(type, serializer);
		expect(result).toEqual("array of [file, label] tuples");
	});

	it("should return 'array of strings' when serializer is 'ListStringSerializable'", () => {
		const type = { type: "string", description: "param description" };
		const serializer = "ListStringSerializable";
		const result = get_description(type, serializer);
		expect(result).toEqual("array of strings");
	});

	it("should return 'array of files or single file' when serializer is 'FileSerializable'", () => {
		const type = { type: "string", description: "param description" };
		const serializer = "FileSerializable";
		const result = get_description(type, serializer);
		expect(result).toEqual("array of files or single file");
	});

	it("should return the type's description when serializer is not 'GallerySerializable', 'ListStringSerializable', or 'FileSerializable'", () => {
		const type = { type: "string", description: "param description" };
		const serializer = "SomeOtherSerializer";
		const result = get_description(type, serializer);
		expect(result).toEqual(type.description);
	});
});

describe("get_type", () => {
	it("should return 'string' when type is 'string'", () => {
		const type = { type: "string", description: "param description" };
		const component = "Component";
		const serializer = "Serializer";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("string");
	});

	it("should return 'boolean' when type is 'boolean'", () => {
		const type = { type: "boolean", description: "param description" };
		const component = "Component";
		const serializer = "Serializer";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("boolean");
	});

	it("should return 'number' when type is 'number'", () => {
		const type = { type: "number", description: "param description" };
		const component = "Component";
		const serializer = "Serializer";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("number");
	});

	it("should return 'any' when serializer is 'JSONSerializable'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Component";
		const serializer = "JSONSerializable";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("any");
	});

	it("should return 'any' when serializer is 'StringSerializable'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Component";
		const serializer = "StringSerializable";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("any");
	});

	it("should return 'string[]' when serializer is 'ListStringSerializable'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Component";
		const serializer = "ListStringSerializable";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("string[]");
	});

	it("should return 'Blob | File | Buffer' when component is 'Image' and signature_type is 'parameter'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Image";
		const serializer = "Serializer";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("Blob | File | Buffer");
	});

	it("should return 'string' when component is 'Image' and signature_type is 'return'", () => {
		const type = { type: "string", description: "param description" };
		const component = "Image";
		const serializer = "Serializer";
		const signature_type = "return";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("string");
	});

	it("should return '(Blob | File | Buffer)[]' when serializer is 'FileSerializable' and type is an array and signature_type is 'parameter'", () => {
		const type = { type: "array", description: "param description" };
		const component = "Component";
		const serializer = "FileSerializable";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("(Blob | File | Buffer)[]");
	});

	it("should return 'Blob | File | Buffer' when serializer is 'FileSerializable' and type is not an array and signature_type is 'return'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Component";
		const serializer = "FileSerializable";
		const signature_type = "return";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual(
			"{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}"
		);
	});

	it("should return a FileData object when serializer is 'FileSerializable' and type is not an array and signature_type is 'return'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Component";
		const serializer = "FileSerializable";
		const signature_type = "return";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual(
			"{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}"
		);
	});

	it("should return '[(Blob | File | Buffer), (string | null)][]' when serializer is 'GallerySerializable' and signature_type is 'parameter'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Component";
		const serializer = "GallerySerializable";
		const signature_type = "parameter";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual("[(Blob | File | Buffer), (string | null)][]");
	});

	it("should return a FileData object when serializer is 'GallerySerializable' and signature_type is 'return'", () => {
		const type = { type: "any", description: "param description" };
		const component = "Component";
		const serializer = "GallerySerializable";
		const signature_type = "return";
		const result = get_type(type, component, serializer, signature_type);
		expect(result).toEqual(
			"[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]"
		);
	});
});

describe("process_endpoint", () => {
	it("should return space_id, host, ws_protocol, and http_protocol when app_reference is a valid space name", async () => {
		const app_reference = "hmb/hello_world";
		const host = "hmb-hello-world.hf.space";

		const hf_token = "hf_token";
		const expected = {
			space_id: app_reference,
			host,
			ws_protocol: "wss",
			http_protocol: "https:"
		};

		const result = await process_endpoint(app_reference, hf_token);
		expect(result).toEqual(expected);
	});

	it("should throw an error when fetching space metadata fails", async () => {
		const app_reference = "hmb/bye_world";
		const hf_token = "hf_token";

		try {
			await process_endpoint(app_reference, hf_token);
		} catch (error) {
			expect(error.message).toEqual(SPACE_METADATA_ERROR_MSG);
		}
	});

	it("should return the correct data when app_reference is a valid space domain", async () => {
		const app_reference = "hmb/hello_world";
		const host = "hmb-hello-world.hf.space";

		const expected = {
			space_id: app_reference,
			host,
			ws_protocol: "wss",
			http_protocol: "https:"
		};

		const result = await process_endpoint("hmb/hello_world");
		expect(result).toEqual(expected);
	});

	it("processes local server URLs correctly", async () => {
		const local_url = "http://localhost:7860/gradio";
		const response_local_url = await process_endpoint(local_url);
		expect(response_local_url.space_id).toBe(false);
		expect(response_local_url.host).toBe("localhost:7860/gradio");

		const local_url_2 = "http://localhost:7860/gradio/";
		const response_local_url_2 = await process_endpoint(local_url_2);
		expect(response_local_url_2.space_id).toBe(false);
		expect(response_local_url_2.host).toBe("localhost:7860/gradio");
	});

	it("handles hugging face space references", async () => {
		const space_id = "hmb/hello_world";

		const response = await process_endpoint(space_id);
		expect(response.space_id).toBe(space_id);
		expect(response.host).toContain("hf.space");
	});

	it("handles hugging face domain URLs", async () => {
		const app_reference = "https://hmb-hello-world.hf.space/";
		const response = await process_endpoint(app_reference);
		expect(response.space_id).toBe("hmb-hello-world");
		expect(response.host).toBe("hmb-hello-world.hf.space");
	});

	it("handles huggingface subpath urls", async () => {
		const app_reference =
			"https://pngwn-pr-demos-test.hf.space/demo/audio_debugger/";
		const response = await process_endpoint(app_reference);
		expect(response.space_id).toBe("pngwn-pr-demos-test");
		expect(response.host).toBe(
			"pngwn-pr-demos-test.hf.space/demo/audio_debugger"
		);

		expect(response.http_protocol).toBe("https:");
	});
});

describe("join_urls", () => {
	it("joins URLs correctly", () => {
		expect(join_urls("http://localhost:7860", "/gradio")).toBe(
			"http://localhost:7860/gradio"
		);
		expect(join_urls("http://localhost:7860/", "/gradio")).toBe(
			"http://localhost:7860/gradio"
		);
		expect(join_urls("http://localhost:7860", "app/", "/gradio")).toBe(
			"http://localhost:7860/app/gradio"
		);
		expect(join_urls("http://localhost:7860/", "/app/", "/gradio/")).toBe(
			"http://localhost:7860/app/gradio/"
		);

		expect(join_urls("http://127.0.0.1:8000/app", "/config")).toBe(
			"http://127.0.0.1:8000/app/config"
		);

		expect(join_urls("http://127.0.0.1:8000/app/gradio", "/config")).toBe(
			"http://127.0.0.1:8000/app/gradio/config"
		);
	});
	it("throws an error when the URLs are not valid", () => {
		expect(() => join_urls("localhost:7860", "/gradio")).toThrowError(
			INVALID_URL_MSG
		);

		expect(() => join_urls("localhost:7860", "/gradio", "app")).toThrowError(
			INVALID_URL_MSG
		);
	});
});

describe("map_data_params", () => {
	let test_data = transformed_api_info;

	test_data.named_endpoints["/predict"].parameters = [
		{
			parameter_name: "param1",
			parameter_has_default: false,
			label: "",
			component: "",
			serializer: "",
			python_type: {
				type: "",
				description: ""
			},
			type: {
				type: "",
				description: ""
			}
		},
		{
			parameter_name: "param2",
			parameter_has_default: false,
			label: "",
			type: {
				type: "",
				description: ""
			},
			component: "",
			serializer: "",
			python_type: {
				type: "",
				description: ""
			}
		},
		{
			parameter_name: "param3",
			parameter_has_default: true,
			parameter_default: 3,
			label: "",
			type: {
				type: "",
				description: ""
			},
			component: "",
			serializer: "",
			python_type: {
				type: "",
				description: ""
			}
		}
	];

	let endpoint_info = test_data.named_endpoints["/predict"];

	it("should return an array of data when data is an array", () => {
		const data = [1, 2];

		const result = map_data_to_params(data, endpoint_info);
		expect(result).toEqual(data);
	});

	it("should return an empty array when data is an empty array", () => {
		const data = [];

		const result = map_data_to_params(data, endpoint_info);
		expect(result).toEqual(data);
	});

	it("should return an empty array when data is not defined", () => {
		const data = undefined;

		const result = map_data_to_params(data, endpoint_info);
		expect(result).toEqual([]);
	});

	it("should return the data when too many arguments are provided for the endpoint", () => {
		const data = [1, 2, 3, 4];

		const result = map_data_to_params(data, endpoint_info);
		expect(result).toEqual(data);
	});

	it("should return an array of resolved data when data is an object", () => {
		const data = {
			param1: 1,
			param2: 2,
			param3: 3
		};

		const result = map_data_to_params(data, endpoint_info);
		expect(result).toEqual([1, 2, 3]);
	});

	it("should use the default value when a keyword argument is not provided and has a default value", () => {
		const data = {
			param1: 1,
			param2: 2
		};

		const result = map_data_to_params(data, endpoint_info);
		expect(result).toEqual([1, 2, 3]);
	});

	it("should throw an error when an invalid keyword argument is provided", () => {
		const data = {
			param1: 1,
			param2: 2,
			param3: 3,
			param4: 4
		};

		expect(() => map_data_to_params(data, endpoint_info)).toThrowError(
			"Parameter `param4` is not a valid keyword argument. Please refer to the API for usage."
		);
	});

	it("should throw an error when no value is provided for a required parameter", () => {
		const data = {};

		expect(() => map_data_to_params(data, endpoint_info)).toThrowError(
			"No value provided for required parameter: param1"
		);
	});
});
