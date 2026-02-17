import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";

// @ts-ignore
import custom_media from "postcss-custom-media";
// @ts-ignore
import prefixer from "postcss-prefix-selector";
import { cpSync, readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";

import { inject_component_loader } from "@self/build";

const version_path = resolve(__dirname, "../../gradio/package.json");
const version_raw = JSON.parse(
  readFileSync(version_path, { encoding: "utf-8" }),
).version.trim();
const version = version_raw.replace(/\./g, "-");

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const svelte = require("svelte/package.json");
const svelte_exports = Object.keys(svelte.exports)
  .filter((p) => p.endsWith(".json"))
  .map((entry) => entry.replace(/^\./, "svelte").split("/").join("_") + ".js");

export default defineConfig(({ mode }) => {
  const production = mode === "production";
  return {
    server: {
      port: 9876,
      open: "/",
      proxy: {
        "/manifest.json": "http://localhost:7860",
        "^.*/theme\\.css": "http://localhost:7860",
        "^/static/.*": "http://localhost:7860",
        "^.*/svelte/.*": "http://localhost:7860",
        "^/gradio_api/.*": "http://localhost:7860",
      },
    },
    resolve: {
      conditions: ["gradio", "browser"],
    },
    ssr: {
      resolve: {
        conditions: ["gradio"],
      },
      noExternal: ["@gradio/*", "@huggingface/space-header"],
      external: mode === "development" ? [] : ["svelte", "svelte/*"],
    },

    build: {
      rollupOptions: {
        external: svelte_exports,
      },
      minify: false,
      sourcemap: true,
    },

    define: {
      BUILD_MODE: production ? JSON.stringify("prod") : JSON.stringify("dev"),
      BACKEND_URL: production
        ? JSON.stringify("")
        : JSON.stringify("http://127.0.0.1:7860/"),
      GRADIO_VERSION: JSON.stringify(version),
    },
    css: {
      postcss: {
        plugins: [
          prefixer({
            prefix: `.gradio-container-${version}`,
            // @ts-ignore
            transform(prefix, selector, prefixedSelector, fileName) {
              if (selector.indexOf("gradio-container") > -1) {
                return prefix;
              } else if (
                selector.indexOf(":root") > -1 ||
                selector.indexOf("dark") > -1 ||
                selector.indexOf("body") > -1 ||
                fileName.indexOf(".svelte") > -1
              ) {
                return selector;
              }
              return prefixedSelector;
            },
          }),
          custom_media(),
        ],
      },
    },
    optimizeDeps: {
      exclude: ["@gradio/*", "/svelte", "/svelte/*"],
    },
    plugins: [sveltekit(), inject_component_loader({ mode })],
  };
});
