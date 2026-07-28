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
import { builtinModules } from "module";
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

/** Every node in the tree, so the passes below can look at them in any order. */
function flatten(node, nodes = []) {
	if (node === null || typeof node !== "object") return nodes;

	if (Array.isArray(node)) {
		for (const child of node) flatten(child, nodes);
		return nodes;
	}

	if (typeof node.type === "string") nodes.push(node);
	for (const key of Object.keys(node)) {
		if (key === "type" || key === "start" || key === "end") continue;
		flatten(node[key], nodes);
	}
	return nodes;
}

/**
 * Collects the module specifiers a file loads at runtime: static imports and
 * re-exports, dynamic `import()`, and `require()`.
 *
 * `require` has to be resolved through its binding rather than matched by name.
 * The commonjs interop in bundled dependencies calls a minified alias of
 * `createRequire(import.meta.url)` (postcss was loaded as ``d(`postcss`)``), so
 * matching only the name `require` would miss it. Matching any one-argument call
 * with a string literal instead is far too loose: `headers.get("cookie")` then
 * reads as a dependency on the `cookie` package.
 */
function collect_specifiers(ast) {
	const nodes = flatten(ast);
	const found = new Set();

	// Local names bound to `createRequire` itself.
	const create_require_names = new Set();
	for (const node of nodes) {
		if (
			node.type !== "ImportDeclaration" ||
			!["module", "node:module"].includes(static_string(node.source))
		) {
			continue;
		}
		for (const specifier of node.specifiers ?? []) {
			if (
				specifier.type === "ImportSpecifier" &&
				specifier.imported?.name === "createRequire"
			) {
				create_require_names.add(specifier.local.name);
			}
		}
	}

	// Local names bound to the require function `createRequire` returns.
	const require_names = new Set(["require"]);
	for (const node of nodes) {
		if (
			node.type === "VariableDeclarator" &&
			node.id?.type === "Identifier" &&
			node.init?.type === "CallExpression" &&
			node.init.callee?.type === "Identifier" &&
			create_require_names.has(node.init.callee.name)
		) {
			require_names.add(node.id.name);
		}
	}

	for (const node of nodes) {
		if (
			node.type === "ImportDeclaration" ||
			node.type === "ExportNamedDeclaration" ||
			node.type === "ExportAllDeclaration" ||
			node.type === "ImportExpression"
		) {
			const source = static_string(node.source);
			if (source !== null) found.add(source);
		}

		if (
			node.type === "CallExpression" &&
			node.callee?.type === "Identifier" &&
			require_names.has(node.callee.name) &&
			node.arguments?.length === 1
		) {
			const argument = static_string(node.arguments[0]);
			if (argument !== null) found.add(argument);
		}
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
				hook_resolved(specifier)
			) {
				continue;
			}

			const name = package_name(specifier);
			if (is_shipped(name)) continue;

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
