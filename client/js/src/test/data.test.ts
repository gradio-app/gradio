import { describe, it, expect, vi, afterEach } from "vitest";
import {
	update_object,
	walk_and_store_blobs,
	skip_queue,
	post_message,
	handle_file
} from "../helpers/data";
import { config_response, endpoint_info } from "./test_data";
import { BlobRef, Command } from "../types";
import { FileData } from "../upload";

describe("walk_and_store_blobs", () => {
	it("should convert a Buffer to a Blob", async () => {
		const buffer = Buffer.from("test data");
		const parts = await walk_and_store_blobs(buffer, "text");

		expect(parts).toHaveLength(1);
		expect(parts[0].blob).toBeInstanceOf(Blob);
	});

	it("should return a Blob when passed a Blob", async () => {
		const blob = new Blob(["test data"]);
		const parts = await walk_and_store_blobs(
			blob,
			undefined,
			[],
			true,
			endpoint_info
		);

		expect(parts[0].blob).toBeInstanceOf(Blob);
	});

	it("should handle arrays", async () => {
		const image = new Blob([]);
		const parts = await walk_and_store_blobs([image]);

		expect(parts).toHaveLength(1);
		expect(parts[0].blob).toBeInstanceOf(Blob);
		expect(parts[0].path).toEqual(["0"]);
	});

	it("should handle deep structures", async () => {
		const image = new Blob([]);
		const parts = await walk_and_store_blobs({ a: { b: { data: { image } } } });

		expect(parts).toHaveLength(1);
		expect(parts[0].blob).toBeInstanceOf(Blob);
		expect(parts[0].path).toEqual(["a", "b", "data", "image"]);
	});

	it("should handle deep structures with arrays", async () => {
		const image = new Blob([]);
		const parts = await walk_and_store_blobs({
			a: [
				{
					b: [
						{
							data: [
								{
									image
								}
							]
						}
					]
				}
			]
		});

		expect(parts[0].blob).toBeInstanceOf(Blob);
	});

	it("should handle deep structures with arrays (with equality check)", async () => {
		const image = new Blob([]);

		const obj = {
			a: [
				{
					b: [
						{
							data: [[image], image, [image, [image]]]
						}
					]
				}
			]
		};
		const parts = await walk_and_store_blobs(obj);

		async function map_path(obj: Record<string, any>, parts: BlobRef[]) {
			const { path, blob } = parts[parts.length - 1];
			let ref = obj;
			path.forEach((p) => (ref = ref[p]));

			// since ref is a Blob and blob is a Blob, we deep equal check the two buffers instead
			if (ref instanceof Blob && blob instanceof Blob) {
				const refBuffer = Buffer.from(await ref.arrayBuffer());
				const blobBuffer = Buffer.from(await blob.arrayBuffer());
				return refBuffer.equals(blobBuffer);
			}

			return ref === blob;
		}

		expect(parts[0].blob).toBeInstanceOf(Blob);
		expect(map_path(obj, parts)).toBeTruthy();
	});

	it("should handle buffer instances and return a BlobRef", async () => {
		const buffer = Buffer.from("test");
		const parts = await walk_and_store_blobs(buffer, undefined, ["blob"]);

		expect(parts).toHaveLength(1);
		expect(parts[0].blob).toBeInstanceOf(Blob);
		expect(parts[0].path).toEqual(["blob"]);
	});

	it("should handle buffer instances with a path and return a BlobRef with the path", async () => {
		const buffer = Buffer.from("test data");
		const parts = await walk_and_store_blobs(buffer);

		expect(parts).toHaveLength(1);
		expect(parts[0].path).toEqual([]);
		expect(parts[0].blob).toBeInstanceOf(Blob);
	});

	it("should convert an object with deep structures to BlobRefs", async () => {
		const param = {
			a: {
				b: {
					data: {
						image: Buffer.from("test image")
					}
				}
			}
		};
		const parts = await walk_and_store_blobs(param);

		expect(parts).toHaveLength(1);
		expect(parts[0].path).toEqual(["a", "b", "data", "image"]);
		expect(parts[0].blob).toBeInstanceOf(Blob);
	});
});
describe("update_object", () => {
	it("should update the value of a nested property", () => {
		const obj = {
			a: {
				b: {
					c: "old value"
				}
			}
		};

		const stack = ["a", "b", "c"];
		const new_val = "new value";

		update_object(obj, new_val, stack);

		expect(obj.a.b.c).toBe(new_val);
	});

	it("should throw an error for invalid key type", () => {
		const obj = {
			a: {
				b: {
					c: "value"
				}
			}
		};

		const stack = ["a", "b", true];
		const newValue = "new value";

		expect(() => {
			// @ts-ignore
			update_object(obj, newValue, stack);
		}).toThrowError("Invalid key type");
	});
});

describe("skip_queue", () => {
	const id = 0;
	const config = config_response;

	it("should not skip queue when global and dependency queue is enabled", () => {
		config.enable_queue = true;
		config.dependencies.find((dep) => dep.id === id)!.queue = true;

		const result = skip_queue(id, config_response);

		expect(result).toBe(false);
	});

	it("should not skip queue when global queue is disabled and dependency queue is enabled", () => {
		config.enable_queue = false;
		config.dependencies.find((dep) => dep.id === id)!.queue = true;

		const result = skip_queue(id, config_response);

		expect(result).toBe(false);
	});

	it("should should skip queue when global queue and dependency queue is disabled", () => {
		config.enable_queue = false;
		config.dependencies.find((dep) => dep.id === id)!.queue = false;

		const result = skip_queue(id, config_response);

		expect(result).toBe(true);
	});

	it("should should skip queue when global queue is enabled and dependency queue is disabled", () => {
		config.enable_queue = true;
		config.dependencies.find((dep) => dep.id === id)!.queue = false;

		const result = skip_queue(id, config_response);

		expect(result).toBe(true);
	});
});

describe("post_message", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should send a message to the parent window and resolve with received data", async () => {
		const test_data = { key: "value" };
		const test_origin = "https://huggingface.co";

		const post_message_mock = vi.fn();

		global.window = {
			// @ts-ignore
			parent: {
				postMessage: post_message_mock
			}
		};

		const message_channel_mock = {
			port1: {
				onmessage: (handler) => {
					onmessage = handler;
				},
				close: vi.fn()
			},
			port2: {}
		};

		vi.stubGlobal("MessageChannel", function () {
			this.port1 = message_channel_mock.port1;
			this.port2 = message_channel_mock.port2;
			return this;
		});

		const promise = post_message(test_data, test_origin);

		if (message_channel_mock.port1.onmessage) {
			message_channel_mock.port1.onmessage({ data: test_data });
		}

		await expect(promise).resolves.toEqual(test_data);
		expect(post_message_mock).toHaveBeenCalledWith(test_data, test_origin, [
			message_channel_mock.port2
		]);
	});
});
describe("handle_file", () => {
	it("should handle a Blob object and return the blob", () => {
		const blob = new Blob(["test data"], { type: "image/png" });
		const result = handle_file(blob) as FileData;

		expect(result).toBe(blob);
	});

	it("should handle a Buffer object and return it as a blob", () => {
		const buffer = Buffer.from("test data");
		const result = handle_file(buffer) as FileData;
		expect(result).toBeInstanceOf(Blob);
	});
	it("should handle a local file path and return a Command object", () => {
		const file_path = "./owl.png";
		const result = handle_file(file_path) as Command;
		expect(result).toBeInstanceOf(Command);
		expect(result).toEqual({
			type: "command",
			command: "upload_file",
			meta: { path: "./owl.png", name: "owl.png", orig_path: "./owl.png" },
			fileData: undefined
		});
	});

	it("should handle a File object and return it as FileData", () => {
		const file = new File(["test image"], "test.png", { type: "image/png" });
		const result = handle_file(file) as FileData;
		console.log(result);
		expect(result.path).toBe("test.png");
		expect(result.orig_name).toBe("test.png");
		expect(result.blob).toBeInstanceOf(Blob);
		expect(result.size).toBe(file.size);
		expect(result.mime_type).toBe("image/png");
		expect(result.meta).toEqual({ _type: "gradio.FileData" });
	});

	it("should throw an error for invalid input", () => {
		const invalid_input = 123;

		expect(() => {
			// @ts-ignore
			handle_file(invalid_input);
		}).toThrowError(
			"Invalid input: must be a URL, File, Blob, or Buffer object."
		);
	});
});
