//@ts-nocheck
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const langs = fs.readdirSync(path.join(__dirname, "..", "lang"));

let lang_names = {};
let lang_loading = {};

for (const lang of langs) {
	if (lang.endsWith(".json")) {
		const lang_text = fs.readFileSync(
			path.join(__dirname, "..", "lang", lang),
			"utf8",
		);
		const lang_data = JSON.parse(lang_text.trim());
		lang_names[lang.split(".")[0]] = lang_data._name;
		lang_loading[lang.split(".")[0]] =
			lang_data?.common?.loading || "Loading...";
	}
}

console.log(lang_names);
console.log(lang_loading);
