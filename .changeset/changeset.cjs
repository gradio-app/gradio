const { getPackagesSync } = require("@manypkg/get-packages");
const dependents_graph = require("@changesets/get-dependents-graph");

const gh = require("@changesets/get-github-info");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const { getInfo, getInfoFromPullRequest } = gh;
const pkg_data = getPackagesSync(process.cwd());
const { packages, rootDir } = pkg_data;
const dependents = dependents_graph.getDependentsGraph({
	packages,
	root: pkg_data.rootPackage
});

/**
 * @typedef {{packageJson: {name: string, python?: boolean}, dir: string}} Package
 */

/**
 * @typedef {{summary: string, id: string, commit: string, releases: {name: string}}} Changeset
 */

/**
 *
 * @param {string} package_name The name of the package to find the directories for
 * @returns {string[]} The directories for the package
 */
function find_packages_dirs(package_name) {
	/** @type {string[]} */
	let package_dirs = [];

	/** @type {Package | undefined} */
	const _package = packages.find((p) => p.packageJson.name === package_name);
	if (!_package) throw new Error(`Package ${package_name} not found`);

	package_dirs.push(_package.dir);
	if (_package.packageJson.python) {
		package_dirs.push(join(_package.dir, ".."));
	}
	return package_dirs;
}

let lines = {
	_handled: []
};

const changelogFunctions = {
	/**
	 *
	 * @param {Changeset[]} changesets The changesets that have been created
	 * @param {any} dependenciesUpdated The dependencies that have been updated
	 * @param {any} options The options passed to the changelog generator
	 * @returns {Promise<string>} The release line for the dependencies
	 */
	getDependencyReleaseLine: async (
		changesets,
		dependenciesUpdated,
		options
	) => {
		if (!options.repo) {
			throw new Error(
				'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
			);
		}
		if (dependenciesUpdated.length === 0) return "";

		const changesetLink = `- Updated dependencies [${(
			await Promise.all(
				changesets.map(async (cs) => {
					if (cs.commit) {
						let { links } = await getInfo({
							repo: options.repo,
							commit: cs.commit
						});
						return links.commit;
					}
				})
			)
		)
			.filter((_) => _)
			.join(", ")}]:`;

		const updatedDepenenciesList = dependenciesUpdated.map(
			/**
			 *
			 * @param {any} dependency The dependency that has been updated
			 * @returns {string} The formatted dependency
			 */
			(dependency) => {
				const updates = dependents.get(dependency.name);

				if (updates && updates.length > 0) {
					updates.forEach((update) => {
						if (!lines[update]) {
							lines[update] = {
								dirs: find_packages_dirs(update),
								current_changelog: "",
								feat: [],
								fix: [],
								highlight: [],
								previous_version: packages.find(
									(p) => p.packageJson.name === update
								).packageJson.version,
								dependencies: []
							};

							const changelog_path = join(
								//@ts-ignore
								lines[update].dirs[1] || lines[update].dirs[0],
								"CHANGELOG.md"
							);

							if (existsSync(changelog_path)) {
								//@ts-ignore
								lines[update].current_changelog = readFileSync(
									changelog_path,
									"utf-8"
								)
									.replace(`# ${update}`, "")
									.trim();
							}
						}
						lines[update].dependencies.push(
							`  - ${dependency.name}@${dependency.newVersion}`
						);
					});
				}

				return `  - ${dependency.name}@${dependency.newVersion}`;
			}
		);

		writeFileSync(
			join(rootDir, ".changeset", "_changelog.json"),
			JSON.stringify(lines, null, 2)
		);

		return [changesetLink, ...updatedDepenenciesList].join("\n");
	},
	/**
	 *
	 * @param {{summary: string, id: string, commit: string, releases: {name: string}[]}} changeset The changeset that has been created
	 * @param {any} type The type of changeset
	 * @param {any} options The options passed to the changelog generator
	 * @returns {Promise<string>} The release line for the changeset
	 */
	getReleaseLine: async (changeset, type, options) => {
		if (!options || !options.repo) {
			throw new Error(
				'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
			);
		}

		let prFromSummary;
		let commitFromSummary;
		/**
		 * @type {string[]}
		 */
		let usersFromSummary = [];

		const replacedChangelog = changeset.summary
			.replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
				let num = Number(pr);
				if (!isNaN(num)) prFromSummary = num;
				return "";
			})
			.replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
				commitFromSummary = commit;
				return "";
			})
			.replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, (_, user) => {
				usersFromSummary.push(user);
				return "";
			})
			.trim();

		const [firstLine, ...futureLines] = replacedChangelog
			.split("\n")
			.map((l) => l.trimRight());

		const links = await (async () => {
			if (prFromSummary !== undefined) {
				let { links } = await getInfoFromPullRequest({
					repo: options.repo,
					pull: prFromSummary
				});
				if (commitFromSummary) {
					links = {
						...links,
						commit: `[\`${commitFromSummary}\`](https://github.com/${options.repo}/commit/${commitFromSummary})`
					};
				}
				return links;
			}
			const commitToFetchFrom = commitFromSummary || changeset.commit;
			if (commitToFetchFrom) {
				let { links } = await getInfo({
					repo: options.repo,
					commit: commitToFetchFrom
				});
				return links;
			}
			return {
				commit: null,
				pull: null,
				user: null
			};
		})();

		const user_link = /\[(@[^]+)\]/.exec(links.user);
		const users =
			usersFromSummary && usersFromSummary.length
				? usersFromSummary
						.map((userFromSummary) => `@${userFromSummary}`)
						.join(", ")
				: user_link
					? user_link[1]
					: links.user;

		const prefix = [
			links.pull === null ? "" : `${links.pull}`,
			links.commit === null ? "" : `${links.commit}`
		]
			.join(" ")
			.trim();

		const suffix = users === null ? "" : ` Thanks ${users}!`;

		/**
		 * @typedef {{[key: string]: string[] | {dirs: string[], current_changelog: string, feat: {summary: string}[], fix: {summary: string}[], highlight: {summary: string}[]}}} ChangesetMeta
		 */

		/**
		 * @type { ChangesetMeta & { _handled: string[] } }}
		 */

		if (lines._handled.includes(changeset.id)) {
			return "done";
		}
		lines._handled.push(changeset.id);

		changeset.releases.forEach((release) => {
			if (!lines[release.name]) {
				lines[release.name] = {
					dirs: find_packages_dirs(release.name),
					current_changelog: "",
					feat: [],
					fix: [],
					highlight: [],
					previous_version: packages.find(
						(p) => p.packageJson.name === release.name
					).packageJson.version,
					dependencies: []
				};
			}

			const changelog_path = join(
				//@ts-ignore
				lines[release.name].dirs[1] || lines[release.name].dirs[0],
				"CHANGELOG.md"
			);

			if (existsSync(changelog_path)) {
				//@ts-ignore
				lines[release.name].current_changelog = readFileSync(
					changelog_path,
					"utf-8"
				)
					.replace(`# ${release.name}`, "")
					.trim();
			}

			const [, _type, summary] = changeset.summary
				.trim()
				.match(/^(feat|fix|highlight)\s*:\s*([^]*)/im) || [
				,
				"feat",
				changeset.summary
			];

			let formatted_summary = "";

			if (_type === "highlight") {
				const [heading, ...rest] = summary.trim().split("\n");
				const _heading = `${heading} ${prefix ? `(${prefix})` : ""}`;
				const _rest = rest.concat(["", suffix]);

				formatted_summary = `${_heading}\n${_rest.join("\n")}`;
			} else {
				formatted_summary = handle_line(summary, prefix, suffix);
			}

			//@ts-ignore
			lines[release.name][_type].push({
				summary: formatted_summary
			});
		});

		writeFileSync(
			join(rootDir, ".changeset", "_changelog.json"),
			JSON.stringify(lines, null, 2)
		);

		return `\n\n-${prefix ? `${prefix} -` : ""} ${firstLine}\n${futureLines
			.map((l) => `  ${l}`)
			.join("\n")}`;
	}
};

/**
 * @param {string} str The changelog entry
 * @param {string} prefix The prefix to add to the first line
 * @param {string} suffix The suffix to add to the last line
 * @returns {string} The formatted changelog entry
 */
function handle_line(str, prefix, suffix) {
	const [_s, ...lines] = str.split("\n").filter(Boolean);

	const desc = `${prefix ? `${prefix} -` : ""} ${_s.replace(
		/[\s\.]$/,
		""
	)}. ${suffix}`;

	if (_s.length === 1) {
		return desc;
	}

	return [desc, ...lines.map((l) => `  ${l}`)].join("/n");
}

module.exports = changelogFunctions;
