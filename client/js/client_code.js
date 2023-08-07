import { client } from "./dist/index.js";

async function run() {
	const app = await client("http://127.0.0.1:7861");
	let result = [];

	// This api route streams outputs
	const job = await app.predict("/click", []);
	const job2 = await app.predict("/click", []);

	// Get the final output
	console.log(job2.data);
}

await run();
