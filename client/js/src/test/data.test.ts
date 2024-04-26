import { describe, it, expect, vi, test, assert } from "vitest";
import { update_object, walk_and_store_blobs } from "../helpers/data";
import { NodeBlob } from "../client";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { endpoint_info } from "./test_data";
import { BlobRef } from "../types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const image_path = join(__dirname, "..", "test", "lion.jpg");

describe("walk_and_store_blobs", () => {
	it("should convert a Buffer to a Blob", async () => {
		const buffer = Buffer.from("test data");
		const parts = await walk_and_store_blobs(buffer, "text");

		expect(parts).toHaveLength(1);
		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
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

		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
	});

	it("should return blob: false when passed an image", async () => {
		const blob = new Blob([readFileSync(image_path)]);
		const parts = await walk_and_store_blobs(
			blob,
			"Image",
			[],
			true,
			endpoint_info
		);
		expect(parts[0].blob).toBe(false);
	});

	it("should handle deep structures", async () => {
		const image = new Blob([readFileSync(image_path)]);
		const parts = await walk_and_store_blobs({ a: { b: { data: { image } } } });

		expect(parts).toHaveLength(1);
		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
		expect(parts[0].path).toEqual(["a", "b", "data", "image"]);
	});

	it("should handle deep structures with arrays", async () => {
		const image = new Blob([readFileSync(image_path)]);
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

		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
	});

	it("should handle deep structures with arrays (with equality check)", async () => {
		const image = new Blob([readFileSync(image_path)]);

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

			// since ref is a Blob and blob is a NodeBlob, we deep equal check the two buffers instead
			if (ref instanceof Blob && blob instanceof NodeBlob) {
				const refBuffer = Buffer.from(await ref.arrayBuffer());
				const blobBuffer = Buffer.from(await blob.arrayBuffer());
				return refBuffer.equals(blobBuffer);
			}

			return ref === blob;
		}

		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
		expect(map_path(obj, parts)).toBeTruthy();
	});

	it("should handle buffer instances and return a BlobRef", async () => {
		const buffer = Buffer.from("test");
		const parts = await walk_and_store_blobs(buffer, undefined, ["blob"]);

		expect(parts).toHaveLength(1);
		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
		expect(parts[0].path).toEqual(["blob"]);
	});

	it("should handle buffer instances with a path and return a BlobRef with the path", async () => {
		const buffer = Buffer.from("test data");
		const parts = await walk_and_store_blobs(buffer);

		expect(parts).toHaveLength(1);
		expect(parts[0].path).toEqual([]);
		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
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
		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
	});

	it("should convert an object with primitive values to BlobRefs", async () => {
		const param = {
			test: "test"
		};
		const parts = await walk_and_store_blobs(param);

		expect(parts).toHaveLength(1);
		expect(parts[0].path).toEqual([]);
		expect(parts[0].blob).toBeInstanceOf(NodeBlob);
		expect(parts[0].type).toEqual("object");
	});
});
