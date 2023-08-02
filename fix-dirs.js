import { promises as fs } from "fs";
import path from "path";

const comp_path = path.join(
	"js",
	"app",
	"src",
	"components",
	"Dataset",
	"ExampleComponents"
);
const pkg_path = path.join("js");

async function fix() {
	const examples = await Promise.all(
		(await fs.readdir(comp_path)).map(async (d) => {
			const contents = await fs.readFile(path.join(comp_path, d));

			return [
				d.toLocaleLowerCase().replace(".svelte", ""),
				contents.toString()
			];
		})
	);

	// const pkgs = Promise.all(
	// 	(await fs.readdir(pkg_path)).map(async (d) => {
	// 		// check if dir
	// 		if (!(await fs.stat(path.join(pkg_path, d))).isDirectory()) {
	// 			return d;
	// 		}
	// 		const pkg_dir = await fs.readdir(path.join(pkg_path, d));
	// 		if (pkg_dir.includes("examples")) {
	// 			//remove examples dir
	// 			const examples_dir = path.join(pkg_path, d, "examples");
	// 			await fs.unlink(path.join(examples_dir, "index.ts"));
	// 			await fs.rmdir(examples_dir);
	// 		}
	// 	})
	// );

	examples.forEach(async ([name, contents]) => {
		const dir = path.join(pkg_path, name);

		const comp_name = `${name[0].toUpperCase()}${name.substring(1)}.svelte`;
		const comp_file_path = path.join(dir, "example", comp_name);

		await fs.mkdir(path.join(dir, "example"));
		await fs.writeFile(
			path.join(dir, "example", "index.ts"),
			`export {default} from "./${name[0].toUpperCase()}${name.substring(
				1
			)}.svelte";`
		);
		await fs.writeFile(comp_file_path, contents);
	});
	// console.log(JSON.stringify(examples, null, 2));
}
fix();
// async function fix() {
// 	let components = await Promise.all(
// 		(await fs.readdir(comp_path)).map(async (p) => {
// 			const x = await check_is_dir(p);
// 			return [x, p];
// 		})
// 	);

// 	// @ts-ignore
// 	components = components.filter(
// 		([b, c]) =>
// 			b && c.match(/^[A-Z]/) && c !== "Dataset" && c !== "Interpretation"
// 	);

// 	console.log(JSON.stringify(components, null, 2));
// 	components = await Promise.all(
// 		components.map(async ([b, c]) => {
// 			const c_dir = await fs.readdir(path.join(comp_path, c));
// 			console.log({ dir_contents: c_dir });
// 			let x = [
// 				c.toLowerCase(),
// 				{
// 					index: "",
// 					other: []
// 				}
// 			];
// 			const c_dir_files = await Promise.all(
// 				c_dir.map(async (p) => {
// 					// console.log({ p });
// 					// console.log({ full_path: path.join(comp_path, c, p) });
// 					const contents = await fs.readFile(path.join(comp_path, c, p));
// 					// console.log({ contents });
// 					if (p === `${c}.svelte`) {
// 						x[1].index = contents.toString();
// 					} else {
// 						x[1].other.push([p, contents.toString()]);
// 					}

// 					return p;
// 				})
// 			);

// 			return x;
// 		})
// 	);

// 	console.log(components);

// 	for await (const [name, { index, other }] of components) {
// 		const dir = path.join(pkg_path, name);

// 		try {
// 			await fs.stat(dir);
// 		} catch (e) {
// 			console.log(`${name} does not exist`, "creating...");
// 			await fs.mkdir(dir);
// 		}

// 		// check the package.json exists
// 		const pkg_json_path = path.join(dir, "./package.json");
// 		try {
// 			await fs.stat(pkg_json_path);
// 		} catch (e) {
// 			console.log(`${name} package.json does not exist`, "creating...");
// 			await fs.writeFile(pkg_json_path, pkg_json(name));
// 		}

// 		// check the index.svelte exists
// 		const index_path = path.join(dir, "index.svelte");
// 		try {
// 			await fs.stat(index_path);
// 		} catch (e) {
// 			console.log(`${name} index.svelte does not exist`, "creating...");
// 			await fs.writeFile(index_path, index);
// 		}

// 		const index_ts = other.find(([n]) => n.startsWith("index."));

// 		if (index_ts) {
// 			const [, first, last] = index_ts[1].match(
// 				/const modes = \[(?:.*?"([a-z]+?)".*?)(?:.*?"([a-z]+?)".*?){0,1}]/
// 			);

// 			const has_static = [first, last].includes("static");

// 			if (has_static) {
// 				// check static folder exists
// 				const static_dir = path.join(dir, "static");
// 				try {
// 					await fs.stat(static_dir);
// 				} catch (e) {
// 					console.log(`${name} static folder does not exist`, "creating...");
// 					await fs.mkdir(static_dir);
// 				}
// 			}

// 			const has_dynamic = [first, last].includes("dynamic");

// 			if (has_dynamic) {
// 				// check interactive folder exists
// 				const interactive_dir = path.join(dir, "interactive");
// 				try {
// 					await fs.stat(interactive_dir);
// 				} catch (e) {
// 					console.log(
// 						`${name} interactive folder does not exist`,
// 						"creating..."
// 					);
// 					await fs.mkdir(interactive_dir);
// 				}
// 			}

// 			// check interactive folder exists
// 			const examples_dir = path.join(dir, "examples");
// 			try {
// 				await fs.stat(examples_dir);
// 			} catch (e) {
// 				console.log(`${name} examples folder does not exist`, "creating...");
// 				await fs.mkdir(examples_dir);
// 				await fs.writeFile(
// 					path.join(examples_dir, "index.ts"),
// 					`export { default as ${name} } from "./${name}.svelte";`
// 				);
// 			}
// 		}

// 		console.log("======================================");
// 	}

// 	// components.forEach(async ([name, { index, other }]) => {
// 	// 	// check the dir exists

// 	// });
// }

// fix();

// /**
//  *
//  * @param {string} _path
//  * @returns
//  */
// async function check_is_dir(_path) {
// 	return (await fs.stat(path.join(comp_path, _path))).isDirectory();
// }

// /**
//  *
//  * @param {string} name
//  * @returns
//  */
// const pkg_json = (name) => `{
// 	"name": "@gradio/${name.toLowerCase()}",
// 	"version": "0.0.1",
// 	"description": "Gradio UI packages",
// 	"type": "module",
// 	"main": "index.svelte",
// 	"author": "",
// 	"license": "ISC",
// 	"private": true,
// 	"main_changeset": true,
// 	"exports": {
// 		"./package.json": "./package.json",
// 		"interactive": "./interactive/index.ts",
// 		"static": "./static/index.ts",
// 		"examples": "./examples/index.ts"
// 	}
// }
// `;
