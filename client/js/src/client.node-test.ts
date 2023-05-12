import { test, describe, assert } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Blob } from "node:buffer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const image_path = join(
	__dirname,
	"..",
	"..",
	"..",
	"demo",
	"kitchen_sink",
	"files",
	"lion.jpg"
);

import { walk_and_store_blobs, client, handle_blob } from "./client";

describe.skip("extract blob parts", () => {
	test("convert Buffer to Blob", async () => {
		const image = readFileSync(image_path);
		await client("gradio/hello_world_main");
		const parts = walk_and_store_blobs({
			data: {
				image
			}
		});

		assert.isTrue(parts[0].blob instanceof Blob);
	});

	test("leave node Blob as Blob", async () => {
		const image = new Blob([readFileSync(image_path)]);

		await client("gradio/hello_world_main");
		const parts = walk_and_store_blobs({
			data: {
				image
			}
		});

		assert.isTrue(parts[0].blob instanceof Blob);
	});

	test("handle deep structures", async () => {
		const image = new Blob([readFileSync(image_path)]);

		await client("gradio/hello_world_main");
		const parts = walk_and_store_blobs({
			a: {
				b: {
					data: {
						image
					}
				}
			}
		});

		assert.isTrue(parts[0].blob instanceof Blob);
	});

	test("handle deep structures with arrays", async () => {
		const image = new Blob([readFileSync(image_path)]);

		await client("gradio/hello_world_main");
		const parts = walk_and_store_blobs({
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

		assert.isTrue(parts[0].blob instanceof Blob);
	});

	test("handle deep structures with arrays 2", async () => {
		const image = new Blob([readFileSync(image_path)]);

		await client("gradio/hello_world_main");
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
		const parts = walk_and_store_blobs(obj);

		function map_path(
			obj: Record<string, any>,
			parts: { path: string[]; blob: any }[]
		) {
			const { path, blob } = parts[parts.length - 1];
			let ref = obj;
			path.forEach((p) => (ref = ref[p]));

			return ref === blob;
		}

		assert.isTrue(parts[0].blob instanceof Blob);
		// assert.isTrue(map_path(obj, parts));
	});
});

describe("handle_blob", () => {
	test("handle blobs", async () => {
		const image = new Blob([readFileSync(image_path)]);

		const app = await client("gradio/hello_world_main");
		const obj = [
			{
				a: [
					{
						b: [
							{
								data: [[image], image, [image, [image]]]
							}
						]
					}
				]
			}
		];

		const parts = await handle_blob(app.config.root, obj, undefined);
		//@ts-ignore
		// assert.isString(parts.data[0].a[0].b[0].data[0][0]);
	});
});

describe.skip("private space", () => {
	test("can access a private space", async () => {
		const image = new Blob([readFileSync(image_path)]);

		const app = await client("pngwn/hello_world", {
			hf_token: "hf_"
		});

		console.log(app);
		const obj = [
			{
				a: [
					{
						b: [
							{
								data: [[image], image, [image, [image]]]
							}
						]
					}
				]
			}
		];

		const parts = await handle_blob(app.config.root, obj, "hf_");
		//@ts-ignore
		assert.isString(parts.data[0].a[0].b[0].data[0][0]);
	});
});
