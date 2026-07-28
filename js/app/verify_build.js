/**
 * Guards against the SSR bundle depending on a package that isn't shipped with it.
 *
 * The build output in gradio/templates/node/build is what ends up in the wheel, and
 * the only node_modules it has at runtime is the one after_build.js installs. During
 * development every bare specifier also resolves against the repo's own node_modules,
 * so a dependency that vite decides to externalise instead of bundling looks fine
 * locally and in CI, then throws "Cannot find module" on every render once installed
 * from a wheel (see the postcss/sanitize-html regression in #13329).
 *
 * This walks the built server code, collects every module specifier that is reachable
 * at runtime, and fails the build if one of them can't be satisfied by what we ship.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { builtinModules, createRequire } from "module";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { parseAstAsync } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const build_path = resolve(__dirname, "../../gradio/templates/node/build");

// Entry points and chunks that Node actually loads. `client/` is browser output and
// `node_modules/` is already-shipped third party code, so neither is scanned.
const scan_roots = [
	"index.js",
	"handler.js",
	"shims.js",
	"env.js",
	"proxy_routes.js",
	"server"
];

// gradio/templates/hooks.mjs redirects these to the prebuilt svelte bundles that
// ship under gradio/templates/frontend, so they are never resolved from disk.
const hook_resolved = (specifier) =>
	specifier === "svelte" || specifier.startsWith("svelte/");

const builtins = new Set([
	...builtinModules,
	...builtinModules.map((m) => `node:${m}`)
]);

// Conservative match for "this string could be a real bare import specifier",
// used because aliased `require` calls can't be identified by callee name.
const specifier_re = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(?:\/[\w.-]+)*$/i;

function walk_js_files(entry) {
	const full = join(build_path, entry);
	if (!existsSync(full)) return [];
	if (statSync(full).isFile()) return full.endsWith(".js") ? [full] : [];

	const files = [];
	for (const child of readdirSync(full)) {
		files.push(...walk_js_files(join(entry, child)));
	}
	return files;
}

/**
 * The string value of a node, if it is statically known. Minified output writes
 * string literals as template literals (`` require(`postcss`) ``), so both forms
 * have to be recognised.
 */
function static_string(node) {
	if (!node) return null;
	if (node.type === "Literal") {
		return typeof node.value === "string" ? node.value : null;
	}
	if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
		return node.quasis[0].value.cooked;
	}
	return null;
}

/**
 * Collects candidate runtime specifiers from a module's AST. Static imports and
 * dynamic `import()` are read directly; `require()` calls are matched by shape
 * (a single string literal argument) rather than by callee name, because the
 * commonjs interop in bundled dependencies calls a minified alias of
 * `createRequire(import.meta.url)` — which is exactly how postcss slipped
 * through. Parsing rather than grepping keeps JSDoc `@import` comments out.
 */
function collect_specifiers(node, found = new Set()) {
	if (node === null || typeof node !== "object") return found;

	if (Array.isArray(node)) {
		for (const child of node) collect_specifiers(child, found);
		return found;
	}

	if (
		node.type === "ImportDeclaration" ||
		node.type === "ExportNamedDeclaration" ||
		node.type === "ExportAllDeclaration" ||
		node.type === "ImportExpression"
	) {
		const source = static_string(node.source);
		if (source !== null) found.add(source);
	}

	if (node.type === "CallExpression" && node.arguments?.length === 1) {
		const argument = static_string(node.arguments[0]);
		if (argument !== null) found.add(argument);
	}

	for (const key of Object.keys(node)) {
		if (key === "type" || key === "start" || key === "end") continue;
		collect_specifiers(node[key], found);
	}

	return found;
}

function package_name(specifier) {
	const parts = specifier.split("/");
	return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** Whether the package is present in the node_modules we ship in the build output. */
function is_shipped(name) {
	return existsSync(join(build_path, "node_modules", name, "package.json"));
}

/**
 * Whether the specifier resolves the way it does during development, i.e. by walking
 * up from the build output into the repo's own node_modules. That fallback is what
 * hides an unshipped dependency locally, so it is also what identifies one. A
 * candidate that resolves nowhere is almost always an unrelated string literal
 * (`t("foo")`) rather than a dependency.
 */
function resolves_in_repo(specifier, referrer, name) {
	try {
		createRequire(referrer).resolve(specifier);
		return true;
	} catch {
		// A package can exist but refuse a bare resolve (no `main`, subpath not
		// exported), so fall back to checking that the directory is there.
		const repo_modules = resolve(__dirname, "../../node_modules");
		return (
			existsSync(join(repo_modules, name, "package.json")) ||
			existsSync(join(__dirname, "node_modules", name, "package.json"))
		);
	}
}

async function verify() {
	const files = scan_roots.flatMap(walk_js_files);
	if (files.length === 0) {
		console.error(
			`No built server files found in ${build_path} — did the build run?`
		);
		process.exit(1);
	}

	/** @type {Map<string, string[]>} */
	const missing = new Map();

	for (const file of files) {
		let ast;
		try {
			ast = await parseAstAsync(readFileSync(file, "utf-8"));
		} catch {
			// Not parseable as an ES module; nothing we can assert about it.
			continue;
		}

		for (const specifier of collect_specifiers(ast)) {
			if (
				specifier.startsWith(".") ||
				specifier.startsWith("/") ||
				specifier.startsWith("#") ||
				builtins.has(specifier) ||
				hook_resolved(specifier) ||
				!specifier_re.test(specifier)
			) {
				continue;
			}

			const name = package_name(specifier);
			if (is_shipped(name) || !resolves_in_repo(specifier, file, name)) {
				continue;
			}

			const referrers = missing.get(name) ?? [];
			referrers.push(file.slice(build_path.length + 1));
			missing.set(name, referrers);
		}
	}

	if (missing.size === 0) {
		console.log(
			`SSR build verified: ${files.length} server files, no unshipped runtime dependencies.`
		);
		return;
	}

	console.error(
		"\nSSR build is not self-contained. These packages are loaded at runtime but are not shipped in the build output:\n"
	);
	for (const [name, referrers] of missing) {
		console.error(`  ${name}`);
		for (const referrer of [...new Set(referrers)].slice(0, 3)) {
			console.error(`    referenced by ${referrer}`);
		}
	}
	console.error(
		"\nThey resolve during development via the repo's node_modules, but a wheel install has no such fallback,\n" +
			"so every SSR render would fail with 'Cannot find module'.\n" +
			"Fix by adding the package to `ssr.noExternal` in js/app/vite.config.ts so it gets bundled,\n" +
			"or to the dependencies installed by js/app/after_build.js so it gets shipped.\n"
	);
	process.exit(1);
}

verify();
