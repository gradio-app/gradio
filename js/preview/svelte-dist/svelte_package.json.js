var name = "svelte";
var description = "Cybernetically enhanced web apps";
var license = "MIT";
var version = "5.43.6";
var type = "module";
var types = "./types/index.d.ts";
var engines = {
	node: ">=18"
};
var files = [
	"*.d.ts",
	"src",
	"!src/**/*.test.*",
	"!src/**/*.d.ts",
	"types",
	"compiler",
	"README.md"
];
var module$1 = "src/index-client.js";
var main = "src/index-client.js";
var exports$1 = {
	".": {
		types: "./types/index.d.ts",
		worker: "./src/index-server.js",
		browser: "./src/index-client.js",
		"default": "./src/index-server.js"
	},
	"./package.json": "./package.json",
	"./action": {
		types: "./types/index.d.ts"
	},
	"./animate": {
		types: "./types/index.d.ts",
		"default": "./src/animate/index.js"
	},
	"./attachments": {
		types: "./types/index.d.ts",
		"default": "./src/attachments/index.js"
	},
	"./compiler": {
		types: "./types/index.d.ts",
		require: "./compiler/index.js",
		"default": "./src/compiler/index.js"
	},
	"./easing": {
		types: "./types/index.d.ts",
		"default": "./src/easing/index.js"
	},
	"./elements": {
		types: "./elements.d.ts"
	},
	"./internal": {
		"default": "./src/internal/index.js"
	},
	"./internal/client": {
		"default": "./src/internal/client/index.js"
	},
	"./internal/disclose-version": {
		"default": "./src/internal/disclose-version.js"
	},
	"./internal/flags/async": {
		"default": "./src/internal/flags/async.js"
	},
	"./internal/flags/legacy": {
		"default": "./src/internal/flags/legacy.js"
	},
	"./internal/flags/tracing": {
		"default": "./src/internal/flags/tracing.js"
	},
	"./internal/server": {
		"default": "./src/internal/server/index.js"
	},
	"./legacy": {
		types: "./types/index.d.ts",
		worker: "./src/legacy/legacy-server.js",
		browser: "./src/legacy/legacy-client.js",
		"default": "./src/legacy/legacy-server.js"
	},
	"./motion": {
		types: "./types/index.d.ts",
		"default": "./src/motion/index.js"
	},
	"./reactivity": {
		types: "./types/index.d.ts",
		worker: "./src/reactivity/index-server.js",
		browser: "./src/reactivity/index-client.js",
		"default": "./src/reactivity/index-server.js"
	},
	"./reactivity/window": {
		types: "./types/index.d.ts",
		"default": "./src/reactivity/window/index.js"
	},
	"./server": {
		types: "./types/index.d.ts",
		"default": "./src/server/index.js"
	},
	"./store": {
		types: "./types/index.d.ts",
		worker: "./src/store/index-server.js",
		browser: "./src/store/index-client.js",
		"default": "./src/store/index-server.js"
	},
	"./transition": {
		types: "./types/index.d.ts",
		"default": "./src/transition/index.js"
	},
	"./events": {
		types: "./types/index.d.ts",
		"default": "./src/events/index.js"
	}
};
var imports = {
	"#client": "./src/internal/client/types.d.ts",
	"#client/constants": "./src/internal/client/constants.js",
	"#compiler": {
		types: "./src/compiler/private.d.ts",
		"default": "./src/compiler/index.js"
	},
	"#compiler/builders": "./src/compiler/utils/builders.js",
	"#server": "./src/internal/server/types.d.ts",
	"#shared": "./src/internal/shared/types.d.ts"
};
var repository = {
	type: "git",
	url: "git+https://github.com/sveltejs/svelte.git",
	directory: "packages/svelte"
};
var bugs = {
	url: "https://github.com/sveltejs/svelte/issues"
};
var homepage = "https://svelte.dev";
var keywords = [
	"svelte",
	"UI",
	"framework",
	"templates",
	"templating"
];
var devDependencies = {
	"@jridgewell/trace-mapping": "^0.3.25",
	"@playwright/test": "^1.46.1",
	"@rollup/plugin-commonjs": "^28.0.1",
	"@rollup/plugin-node-resolve": "^15.3.0",
	"@rollup/plugin-terser": "^0.4.4",
	"@rollup/plugin-virtual": "^3.0.2",
	"@types/aria-query": "^5.0.4",
	"@types/node": "^20.11.5",
	"dts-buddy": "^0.5.5",
	esbuild: "^0.25.10",
	rollup: "^4.22.4",
	"source-map": "^0.7.4",
	tinyglobby: "^0.2.12",
	typescript: "^5.5.4",
	vitest: "^2.1.9"
};
var dependencies = {
	"@jridgewell/remapping": "^2.3.4",
	"@jridgewell/sourcemap-codec": "^1.5.0",
	"@sveltejs/acorn-typescript": "^1.0.5",
	"@types/estree": "^1.0.5",
	acorn: "^8.12.1",
	"aria-query": "^5.3.1",
	"axobject-query": "^4.1.0",
	clsx: "^2.1.1",
	"esm-env": "^1.2.1",
	esrap: "^2.1.0",
	"is-reference": "^3.0.3",
	"locate-character": "^3.0.0",
	"magic-string": "^0.30.11",
	zimmerframe: "^1.1.2"
};
var scripts = {
	build: "node scripts/process-messages && rollup -c && pnpm generate:types && node scripts/check-treeshakeability.js",
	dev: "node scripts/process-messages -w & rollup -cw",
	check: "tsc --project tsconfig.runtime.json && tsc && cd ./tests/types && tsc",
	"check:tsgo": "tsgo --project tsconfig.runtime.json --skipLibCheck && tsgo --skipLibCheck",
	"check:watch": "tsc --watch",
	"generate:version": "node ./scripts/generate-version.js",
	"generate:types": "node ./scripts/generate-types.js && tsc -p tsconfig.generated.json",
	knip: "pnpm dlx knip"
};
var _package = {
	name: name,
	description: description,
	license: license,
	version: version,
	type: type,
	types: types,
	engines: engines,
	files: files,
	module: module$1,
	main: main,
	exports: exports$1,
	imports: imports,
	repository: repository,
	bugs: bugs,
	homepage: homepage,
	keywords: keywords,
	devDependencies: devDependencies,
	dependencies: dependencies,
	scripts: scripts
};

export { bugs, _package as default, dependencies, description, devDependencies, engines, exports$1 as exports, files, homepage, imports, keywords, license, main, module$1 as module, name, repository, scripts, type, types, version };
