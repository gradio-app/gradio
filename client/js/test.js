import { client, duplicate } from "./dist/index.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const image_path = join(
	__dirname,

	"..",
	"..",
	"demo",
	"kitchen_sink",
	"files",
	"lion.jpg"
);
const img = readFileSync(image_path);
async function run() {
	const app = await client("https://gradio-zip-files.hf.space/");

	const job = app
		.submit("/predict", [img])
		.on("status", console.log)
		.on("data", console.log);

	// setTimeout(() => {
	// 	job.cancel();
	// }, 2000);

	console.log(JSON.stringify(await app.view_api(), null, 2));
}

run();
