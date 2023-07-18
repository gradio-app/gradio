const { join } = require("path");
const { readFileSync, existsSync, writeFileSync, unlinkSync } = require("fs");
const { getPackagesSync } = require("@manypkg/get-packages");

const { _handled, ...packages } = JSON.parse(
	readFileSync(join(__dirname, "./_changelog.json"), "utf-8"),
);
const all_packages = getPackagesSync(process.cwd()).packages.reduce(
	(acc, pkg) => {
		acc[pkg.packageJson.name] = pkg;
		return acc;
	},
	{},
);

console.log({ all_packages });
for (const pkg_name in packages) {
	const { dirs, highlight, feat, fix, current_changelog } = packages[pkg_name];

	const { version, python } = all_packages[pkg_name].packageJson;

	const highlights = highlight.map((h) => `${h.summary}`);
	const features = feat.map((f) => `- ${f.summary}`);
	const fixes = fix.map((f) => `- ${f.summary}`);

	const release_notes = [
		[highlights, "### Highlights"],
		[features, "### Features"],
		[fixes, "### Fixes"],
	]
		.filter(([s], i) => s.length > 0)
		.map(([lines, title]) => {
			if (title === "### Highlights") {
				return `${title}\n\n${lines.join("\n\n")}`;
			} else {
				return `${title}\n\n${lines.join("\n")}`;
			}
		})
		.join("\n\n");

	const new_changelog = `# ${pkg_name}

## ${version}

${release_notes}

${current_changelog}
`.trim();

	dirs.forEach((dir) => {
		writeFileSync(join(dir, "CHANGELOG.md"), new_changelog);
	});

	console.log(pkg_name, dirs, version, python);

	if (python) {
		writeFileSync(join(dirs[0], "version.txt"), version);
		bump_local_dependents(pkg_name, version);
	}
}

unlinkSync(join(__dirname, "_changelog.json"));

function bump_local_dependents(pkg_to_bump, version) {
	for (const pkg_name in all_packages) {
		const {
			dir,
			packageJson: { python },
		} = all_packages[pkg_name];

		if (!python) continue;

		const requirements_path = join(dir, "..", "requirements.txt");
		const requirements = readFileSync(requirements_path, "utf-8").split("\n");

		const pkg_index = requirements.findIndex((line) =>
			line.startsWith(pkg_to_bump),
		);

		if (pkg_index !== -1) {
			requirements[pkg_index] = `${pkg_to_bump}>=${version}`;
			writeFileSync(requirements_path, requirements.join("\n"));
		}
	}
}
