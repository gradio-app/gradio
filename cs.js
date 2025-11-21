import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import { execSync } from "child_process";
import { getPackages } from "@manypkg/get-packages";

const changsetsFolder = path.join(process.cwd(), ".changeset");
const files = readdirSync(changsetsFolder);
const mdFiles = files.filter(
	(file) => file.endsWith(".md") && !file.startsWith("README.md")
);

const getGitInfo = (filePath) => {
	const gitInfo = execSync(
		`git log -n 1 --pretty=format:"%H -bingboong- %s" --  ${filePath}`,
		{
			encoding: "utf8"
		}
	);
	return gitInfo;
};

const changsets = mdFiles
	.map((file) => {
		const filePath = path.join(changsetsFolder, file);
		const fileContent = readFileSync(filePath, "utf8");
		const [sha, message] = getGitInfo(
			path.join(process.cwd(), ".changeset", file)
		).split(" -bingboong- ");
		return {
			file,
			sha,
			short_sha: sha.slice(0, 7),
			pr: message.match(/(#\d+)/)?.[1],
			content: fileContent
		};
	})
	.filter((c) => c.pr);

const changedPackages = changsets.reduce(
	(acc, { content, sha, short_sha, pr }) => {
		const [, frontmatter, body] = content.split("---");
		const type_index = body.indexOf(":");
		const type = body.slice(0, type_index).trim();
		const _content = body.slice(type_index + 1).trim();
		if (frontmatter) {
			const packages = frontmatter.split("\n").filter((line) => !!line.trim());

			if (packages) {
				packages.forEach((_package) => {
					const [name, version] = _package.split(":");

					if (!acc[name]) {
						acc[name] = {
							version: version.trim(),
							reamde_content: {
								feat: "",
								fix: "",
								highlight: "",
								[type]: format_readme_content(pr, short_sha, sha, _content)
							}
						};
					} else {
						acc[name].version = getMaximumBump(
							version.trim(),
							acc[name].version
						);
						acc[name].reamde_content[type] += `\n${format_readme_content(
							pr,
							short_sha,
							sha,
							_content
						)}`;
					}
				});
			}
		}
		return acc;
	},
	{}
);

function getMaximumBump(newVersion, oldVersion) {
	const versionOrder = ["patch", "minor", "major"];
	const newVersionIndex = versionOrder.indexOf(newVersion);
	const oldVersionIndex = versionOrder.indexOf(oldVersion);

	return versionOrder[Math.max(newVersionIndex, oldVersionIndex)];
}

function format_readme_content(pr, short_sha, sha, _content) {
	return `- [${pr}](https://github.com/gradio-app/gradio/pull/${pr.replace(
		"#",
		""
	)}) [\`${short_sha}\`](https://github.com/gradio-app/gradio/commit/${sha}) - ${_content.trim()}`;
}

const { packages } = await getPackages(process.cwd());

const packages_to_write = [];

for (const pkg of packages) {
	if (`"${pkg.packageJson.name}"` in changedPackages) {
		const current_version = pkg.packageJson.version;
		const bump = changedPackages[`"${pkg.packageJson.name}"`].version;

		const new_version = get_new_version(current_version, bump);
		const new_package_json = {
			...pkg.packageJson,
			version: new_version
		};

		let deps_updated = [];
		for (const dep in new_package_json.dependencies) {
			if (`"${dep}"` in changedPackages) {
				console.log(
					dep,
					changedPackages[`"${dep}"`].version,
					new_package_json.dependencies[dep]
				);

				const dep_version = packages.find((p) => p.packageJson.name === dep)
					?.packageJson.version;

				deps_updated.push([
					dep,
					get_new_version(dep_version, changedPackages[`"${dep}"`].version)
				]);
			}
		}

		if (
			deps_updated.length > 0 &&
			!(`"${pkg.packageJson.name}"` in changedPackages)
		) {
			new_package_json.version = get_new_version(current_version, "patch");
			packages_to_write.push({
				name: pkg.packageJson.name,
				dir: pkg.dir,
				version: new_version,
				packge_json: new_package_json,
				changelog: readFileSync(`${pkg.dir}/CHANGELOG.md`, "utf8").replace(
					`# ${pkg.packageJson.name}`,

					make_changelog(
						pkg.packageJson.name,
						new_version,
						changedPackages[`"${pkg.packageJson.name}"`].reamde_content,
						deps_updated
					)
				)
			});
		} else if (`"${pkg.packageJson.name}"` in changedPackages) {
			new_package_json.version = new_version;
			packages_to_write.push({
				name: pkg.packageJson.name,
				dir: pkg.dir,
				version: new_version,
				packge_json: new_package_json,
				changelog: readFileSync(`${pkg.dir}/CHANGELOG.md`, "utf8").replace(
					`# ${pkg.packageJson.name}`,

					make_changelog(
						pkg.packageJson.name,
						new_version,
						changedPackages[`"${pkg.packageJson.name}"`].reamde_content,
						deps_updated
					)
				)
			});
		}
	}
}

function make_changelog(name, version, changes, deps_updated) {
	const { feat, fix, highlight } = changes;
	let changelog = `# ${name}
## ${version}`;

	if (highlight) {
		changelog += `\n\n### Highlights\n\n${highlight}`;
	}
	if (feat) {
		changelog += `\n\n### Features\n\n${feat}`;
	}
	if (fix) {
		changelog += `\n\n### Fixes\n\n${fix}`;
	}
	if (deps_updated.length > 0) {
		changelog += `\n\n### Dependencies\n\n${deps_updated
			.map(([dep, version]) => `- ${dep}@${version}`)
			.join("\n")}`;
	}

	return changelog;
}

function get_new_version(version, bump) {
	const [_major, _minor, _patch, prerelease] = version.split(".");

	const major = parseInt(_major);
	const minor = parseInt(_minor);
	const patch = parseInt(_patch);

	if (prerelease) {
		return `${major}.${minor}.${patch}`;
	}

	switch (bump) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
		default:
			return version;
	}
}

console.log(packages_to_write);

for (const pkg of packages_to_write) {
	writeFileSync(
		`${pkg.dir}/package.json`,
		JSON.stringify(pkg.packge_json, null, "\t")
	);
	writeFileSync(`${pkg.dir}/CHANGELOG.md`, pkg.changelog);
}
