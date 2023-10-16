import * as fs from "fs";
import * as path from "path";

const __dirname = path.resolve(".");

function run() {
	const js_dir = path.join(__dirname, "js");
	const folders = fs.readdirSync(js_dir);

	const filtered = folders
		.filter((folder) => {
			const folder_path = path.join(js_dir, folder);
			if (fs.lstatSync(folder_path).isDirectory()) {
				//  read pkgjson
				const pkgjson_path = path.join(folder_path, "package.json");
				if (!fs.existsSync(pkgjson_path)) {
					return false;
				}
				const pkgjson = fs.readFileSync(pkgjson_path, "utf-8");
				const pkgjson_obj = JSON.parse(pkgjson);
				if (pkgjson_obj?.exports?.["."]) {
					return true;
				}
				return false;
			}
		})
		.map((folder) => {
			return {
				name: folder,
				path: path.join(js_dir, folder)
			};
		})
		.forEach((folder) => {
			fs.writeFileSync(path.join(folder.path, "Index.svelte"), ``);
			fs.writeFileSync(path.join(folder.path, "Example.svelte"), ``);
		});

	// console.log(filtered);
}

run();
