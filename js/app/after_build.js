import { writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(import.meta.url);
const out_path = resolve(__dirname, "../../../gradio/templates/node/build");

writeFileSync(
	resolve(out_path, "package.json"),
	JSON.stringify({ name: "gradio-server-app", type: "module" }, null, 2)
);
