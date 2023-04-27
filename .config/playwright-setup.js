import polka from "polka";
import sirv from "sirv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const template = path.join(__dirname, "..", "gradio", "templates", "frontend");

export default async function global_setup() {
	const serve = sirv(template);
	const app = polka()
		.use(serve)
		.listen("9876", () => {
			console.log(`> Running on localhost: 9876`);
		});

	return () => {
		app.server.close();
	};
}
