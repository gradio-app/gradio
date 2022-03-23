import polka from "polka";
import sirv from "sirv";
import path from "path";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const template = path.join(__dirname, "..", "gradio", "templates", "frontend");

export default async function global_setup() {
	const serve = sirv(template);
	const app = polka()
		.use(serve)
		.listen("3000", () => {
			console.log(`> Running on localhost: 3000`);
		});

	return () => {
		app.server.close();
	};
}
