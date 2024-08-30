// src/index.ts
import { parse } from "node-html-parser";
import { join } from "path";
import { writeFileSync } from "fs";
import * as url from "url";
import { readdirSync, existsSync, readFileSync, statSync } from "fs";
function inject_ejs() {
  return {
    name: "inject-ejs",
    enforce: "post",
    transformIndexHtml: (html) => {
      const replace_gradio_info_info_html = html.replace(
        /%gradio_api_info%/,
        `<script>window.gradio_api_info = {{ gradio_api_info | toorjson }};</script>`
      );
      return replace_gradio_info_info_html.replace(
        /%gradio_config%/,
        `<script>window.gradio_config = {{ config | toorjson }};</script>`
      );
    }
  };
}
function generate_cdn_entry({
  version,
  cdn_base
}) {
  return {
    name: "generate-cdn-entry",
    enforce: "post",
    writeBundle(config, bundle) {
      if (!config.dir || !bundle["index.html"] || bundle["index.html"].type !== "asset")
        return;
      const source = bundle["index.html"].source;
      const tree = parse(source);
      const script = Array.from(
        tree.querySelectorAll("script[type=module]")
      ).find((node) => node.attributes.src?.includes("assets"));
      const output_location = join(config.dir, "gradio.js");
      writeFileSync(output_location, make_entry(script?.attributes.src || ""));
      if (!script) return;
      const transformed_html = bundle["index.html"].source.substring(0, script?.range[0]) + `<script type="module" crossorigin src="${cdn_base}/${version}/gradio.js"></script>` + bundle["index.html"].source.substring(
        script?.range[1],
        source.length
      );
      const share_html_location = join(config.dir, "share.html");
      writeFileSync(share_html_location, transformed_html);
    }
  };
}
var RE_SVELTE_IMPORT = /import\s+([\w*{},\s]+)\s+from\s+['"](svelte|svelte\/internal)['"]/g;
function generate_dev_entry({ enable }) {
  return {
    name: "generate-dev-entry",
    transform(code, id) {
      if (!enable) return;
      const new_code = code.replace(RE_SVELTE_IMPORT, (str, $1, $2) => {
        return `const ${$1.replace(/\* as /, "").replace(/ as /g, ": ")} = window.__gradio__svelte__internal;`;
      });
      return {
        code: new_code,
        map: null
      };
    }
  };
}
function make_entry(script) {
  return `import("${script}");
`;
}
function handle_ce_css() {
  return {
    enforce: "post",
    name: "custom-element-css",
    writeBundle(config, bundle) {
      let file_to_insert = {
        filename: "",
        source: ""
      };
      if (!config.dir || !bundle["index.html"] || bundle["index.html"].type !== "asset")
        return;
      for (const key in bundle) {
        const chunk = bundle[key];
        if (chunk.type === "chunk") {
          const _chunk = chunk;
          const found = _chunk.code?.indexOf("ENTRY_CSS");
          if (found > -1)
            file_to_insert = {
              filename: join(config.dir, key),
              source: _chunk.code
            };
        }
      }
      const tree = parse(bundle["index.html"].source);
      const { style, fonts } = Array.from(
        tree.querySelectorAll("link[rel=stylesheet]")
      ).reduce(
        (acc, next) => {
          if (/.*\/index(.*?)\.css/.test(next.attributes.href)) {
            return { ...acc, style: next };
          }
          return { ...acc, fonts: [...acc.fonts, next.attributes.href] };
        },
        { fonts: [], style: void 0 }
      );
      writeFileSync(
        file_to_insert.filename,
        file_to_insert.source.replace("__ENTRY_CSS__", style.attributes.href).replace(
          '"__FONTS_CSS__"',
          `[${fonts.map((f) => `"${f}"`).join(",")}]`
        )
      );
      const share_html_location = join(config.dir, "share.html");
      const share_html = readFileSync(share_html_location, "utf8");
      const share_tree = parse(share_html);
      const node = Array.from(
        share_tree.querySelectorAll("link[rel=stylesheet]")
      ).find((node2) => /.*\/index(.*?)\.css/.test(node2.attributes.href));
      if (!node) return;
      const transformed_html = share_html.substring(0, node.range[0]) + share_html.substring(node.range[1], share_html.length);
      writeFileSync(share_html_location, transformed_html);
    }
  };
}
var __filename = url.fileURLToPath(import.meta.url);
var __dirname = url.fileURLToPath(new URL(".", import.meta.url));
function get_export_path(path, root, pkg_json) {
  if (!pkg_json.exports) return false;
  if (typeof pkg_json.exports[`${path}`] === "object") return true;
  const _path = join(root, "..", `${pkg_json.exports[`${path}`]}`);
  return existsSync(_path);
}
var ignore_list = [
  "tootils",
  "_cdn-test",
  "_spaces-test",
  "_website",
  "app",
  "atoms",
  "fallback",
  "icons",
  "lite",
  "preview",
  "simpledropdown",
  "simpleimage",
  "simpletextbox",
  "storybook",
  "theme",
  "timeseries",
  "tooltip",
  "upload",
  "utils",
  "wasm"
];
function generate_component_imports() {
  const exports = readdirSync(join(__dirname, "..", "..")).map((dir) => {
    if (ignore_list.includes(dir)) return void 0;
    if (!statSync(join(__dirname, "..", "..", dir)).isDirectory()) return void 0;
    const package_json_path = join(__dirname, "..", "..", dir, "package.json");
    if (existsSync(package_json_path)) {
      const package_json = JSON.parse(
        readFileSync(package_json_path, "utf8")
      );
      const component = get_export_path(".", package_json_path, package_json);
      const example = get_export_path(
        "./example",
        package_json_path,
        package_json
      );
      const base = get_export_path("./base", package_json_path, package_json);
      if (!component && !example) return void 0;
      return {
        name: package_json.name,
        component,
        example,
        base
      };
    }
    return void 0;
  }).filter((x) => x !== void 0);
  const imports = exports.reduce((acc, _export) => {
    if (!_export) return acc;
    const example = _export.example ? `example: () => import("${_export.name}/example"),
` : "";
    const base = _export.base ? `base: () => import("${_export.name}/base"),
` : "";
    return `${acc}"${_export.name.replace("@gradio/", "")}": {
			${base}
			${example}
			component: () => import("${_export.name}")
			},
`;
  }, "");
  return imports;
}
function load_virtual_component_loader(mode) {
  const loader_path = join(__dirname, "component_loader.js");
  let component_map = "";
  if (mode === "test") {
    component_map = `
		const component_map = {
			"test-component-one": {
				component: () => import("@gradio-test/test-one"),
				example: () => import("@gradio-test/test-one/example")
			},
			"dataset": {
				component: () => import("@gradio-test/test-two"),
				example: () => import("@gradio-test/test-two/example")
			},
			"image": {
				component: () => import("@gradio/image"),
				example: () => import("@gradio/image/example"),
				base: () => import("@gradio/image/base")
			},
			"audio": {
				component: () => import("@gradio/audio"),
				example: () => import("@gradio/audio/example"),
				base: () => import("@gradio/audio/base")
			},
			"video": {
				component: () => import("@gradio/video"),
				example: () => import("@gradio/video/example"),
				base: () => import("@gradio/video/base")
			},
			// "test-component-one": {
			// 	component: () => import("@gradio-test/test-one"),
			// 	example: () => import("@gradio-test/test-one/example")
			// },
		};
		`;
  } else {
    component_map = `
		const component_map = {
			${generate_component_imports()}
		};
		`;
  }
  return `${component_map}

${readFileSync(loader_path, "utf8")}`;
}
function inject_component_loader({ mode }) {
  const v_id = "virtual:component-loader";
  const resolved_v_id = "\0" + v_id;
  return {
    name: "inject-component-loader",
    enforce: "pre",
    resolveId(id) {
      if (id === v_id) return resolved_v_id;
    },
    load(id) {
      this.addWatchFile(join(__dirname, "component_loader.js"));
      if (id === resolved_v_id) {
        return load_virtual_component_loader(mode);
      }
    }
  };
}
function resolve_svelte(enable) {
  return {
    enforce: "pre",
    name: "resolve-svelte",
    async resolveId(id) {
      if (!enable) return;
      if (id === "./svelte/svelte.js" || id === "svelte" || id === "svelte/internal") {
        const mod = join(
          __dirname,
          "..",
          "..",
          "..",
          "gradio",
          "templates",
          "frontend",
          "assets",
          "svelte",
          "svelte.js"
        );
        return { id: mod, external: "absolute" };
      }
    }
  };
}
function mock_modules() {
  const v_id_1 = "@gradio-test/test-one";
  const v_id_2 = "@gradio-test/test-two";
  const v_id_1_example = "@gradio-test/test-one/example";
  const v_id_2_example = "@gradio-test/test-two/example";
  const resolved_v_id = "\0" + v_id_1;
  const resolved_v_id_2 = "\0" + v_id_2;
  const resolved_v_id_1_example = "\0" + v_id_1_example;
  const resolved_v_id_2_example = "\0" + v_id_2_example;
  const fallback_example = "@gradio/fallback/example";
  const resolved_fallback_example = "\0" + fallback_example;
  return {
    name: "mock-modules",
    enforce: "pre",
    resolveId(id) {
      if (id === v_id_1) return resolved_v_id;
      if (id === v_id_2) return resolved_v_id_2;
      if (id === v_id_1_example) return resolved_v_id_1_example;
      if (id === v_id_2_example) return resolved_v_id_2_example;
      if (id === fallback_example) return resolved_fallback_example;
    },
    load(id) {
      if (id === resolved_v_id || id === resolved_v_id_2 || id === resolved_v_id_1_example || id === resolved_v_id_2_example || id === resolved_fallback_example) {
        return `export default {}`;
      }
    }
  };
}
export {
  generate_cdn_entry,
  generate_dev_entry,
  handle_ce_css,
  inject_component_loader,
  inject_ejs,
  mock_modules,
  resolve_svelte
};
