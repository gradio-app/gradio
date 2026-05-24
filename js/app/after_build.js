import { writeFileSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const out_path = resolve(__dirname, "../../gradio/templates/node/build");

writeFileSync(
	resolve(out_path, "package.json"),
	JSON.stringify(
		{
			name: "gradio-server-app",
			type: "module",
			dependencies: { "http-proxy": "^1.18.1" }
		},
		null,
		2
	)
);

// Install http-proxy in the build output so it's available at runtime
execSync("npm install --production", { cwd: out_path, stdio: "inherit" });

// Replace the adapter-generated index.js with our custom proxy entry point
copyFileSync(
	resolve(__dirname, "proxy_index.js"),
	resolve(out_path, "index.js")
);
copyFileSync(
	resolve(__dirname, "proxy_routes.js"),
	resolve(out_path, "proxy_routes.js")
);
