const { join } = require("path");
const { readFileSync, existsSync, writeFileSync, unlinkSync } = require("fs");
const { getPackagesSync } = require("@manypkg/get-packages");

const RE_PKG_NAME = /^[\w-]+\b/;
const pkg_meta = getPackagesSync(process.cwd());

/**
 * @typedef {{dirs: string[], highlight: {summary: string}[], feat: {summary: string}[], fix: {summary: string}[], current_changelog: string}} ChangesetMeta
 */

/**
 * @typedef {{[key: string]: ChangesetMeta}} ChangesetMetaCollection
 */

function run() {
	if (!existsSync(join(pkg_meta.rootDir, ".changeset", "_changelog.json"))) {
		console.warn("No changesets to process");
		return;
	}

	/**
	 * @type { ChangesetMetaCollection & { _handled: string[] } }}
	 */
	const { _handled, ...packages } = JSON.parse(
		readFileSync(
			join(pkg_meta.rootDir, ".changeset", "_changelog.json"),
			"utf-8"
		)
	);

	/**
	 * @typedef { {packageJson: {name: string, version: string, python: boolean}, dir: string} } PackageMeta
	 */

	/**
	 * @type { {[key:string]: PackageMeta} }
	 */
	const all_packages = pkg_meta.packages.reduce((acc, pkg) => {
		acc[pkg.packageJson.name] = /**@type {PackageMeta} */ (
			/** @type {unknown} */ (pkg)
		);
		return acc;
	}, /** @type {{[key:string] : PackageMeta}} */ ({}));

	for (const pkg_name in packages) {
		const { dirs, highlight, feat, fix, current_changelog, dependencies } =
			/**@type {ChangesetMeta} */ (packages[pkg_name]);

		if (pkg_name === "@gradio/lite") {
			const target = all_packages.gradio.packageJson.version.split(".");

			const current_version = packages[pkg_name].previous_version.split(".");

			if (!packages.gradio) {
				const patch = parseInt(current_version[2]) + 1;
				const new_version = [target[0], target[1], patch];
				all_packages[pkg_name].packageJson.version = new_version.join(".");
			} else {
				if (parseInt(target[1]) > parseInt(current_version[1])) {
					all_packages[pkg_name].packageJson.version = target.join(".");
				} else if (parseInt(target[1]) === parseInt(current_version[1])) {
					const patch = parseInt(current_version[2]) + 1;
					const new_version = [target[0], target[1], patch];
					all_packages[pkg_name].packageJson.version = new_version.join(".");
				}
			}

			writeFileSync(
				join(all_packages[pkg_name].dir, "package.json"),
				JSON.stringify(all_packages[pkg_name].packageJson, null, "\t") + "\n"
			);
		}

		const { version, python } = all_packages[pkg_name].packageJson;

		const highlights = highlight?.map((h) => `${h.summary}`) || [];
		const features = feat?.map((f) => `- ${f.summary}`) || [];
		const fixes = fix?.map((f) => `- ${f.summary}`) || [];
		const deps = Array.from(new Set(dependencies?.map((d) => d.trim()))) || [];

		const release_notes = /** @type {[string[], string][]} */ ([
			[highlights, "### Highlights"],
			[features, "### Features"],
			[fixes, "### Fixes"],
			[deps, "### Dependency updates"]
		])
			.filter(([s], i) => s.length > 0)
			.map(([lines, title]) => {
				if (title === "### Highlights") {
					return `${title}\n\n${lines.join("\n\n")}`;
				}

				return `${title}\n\n${lines.join("\n")}`;
			})
			.join("\n\n");

		const new_changelog = `# ${pkg_name}

## ${version}

${release_notes}

${current_changelog.replace(`# ${pkg_name}`, "").trim()}
`.trim();

		dirs.forEach((dir) => {
			writeFileSync(join(dir, "CHANGELOG.md"), new_changelog);
		});

		if (python) {
			bump_local_dependents(pkg_name, version);
		}
	}

	unlinkSync(join(pkg_meta.rootDir, ".changeset", "_changelog.json"));

	/**
	 * @param {string} pkg_to_bump The name of the package to bump
	 * @param {string} version The version to bump to
	 * @returns {void}
	 * */
	function bump_local_dependents(pkg_to_bump, version) {
		for (const pkg_name in all_packages) {
			const {
				dir,
				packageJson: { python }
			} = all_packages[pkg_name];

			if (!python) continue;

			const requirements_path = join(dir, "..", "requirements.txt");
			const requirements = readFileSync(requirements_path, "utf-8").split("\n");

			const pkg_index = requirements.findIndex((line) => {
				const m = line.trim().match(RE_PKG_NAME);
				if (!m) return false;
				return m[0] === pkg_to_bump;
			});

			if (pkg_index !== -1) {
				requirements[pkg_index] = `${pkg_to_bump}==${version}`;
				writeFileSync(requirements_path, requirements.join("\n"));
			}
		}
	}
}

run();
