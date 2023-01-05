// @ts-nocheck
const fs = require("fs");
const path = require("path");

const RE_PATH = /^(([a-z]+|[0-9])+\.)+([a-z]+|[0-9]+)$/;

function get_path(object, paths = [], current_node = object) {
	let _paths = {};

	for (const key in object) {
		if (typeof object[key] === "object") {
			_paths = { ..._paths, ...get_path(object[key], [...paths, key]) };
		} else {
			const is_var =
				typeof object[key] === "string" && RE_PATH.test(object[key]);

			_paths[`--${[...paths, key].join("-")}`] = is_var
				? `var(--${object[key].replace(/\./g, "-")})`
				: object[key];
		}
	}

	return _paths;
}

function generate_theme() {
	fs.writeFileSync(path.join(__dirname, "theme.css"), "");
}

exports.get_path = get_path;
generate_theme();
