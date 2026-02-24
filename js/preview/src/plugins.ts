import type { Plugin, PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import { join } from "path";
import { type ComponentConfig } from "./dev";
import type { Preprocessor, PreprocessorGroup } from "svelte/compiler";
import { deepmerge } from "./_deepmerge_internal";

const svelte_codes_to_ignore: Record<string, string> = {
  "reactive-component": "Icon",
};

export function plugins(config: ComponentConfig): PluginOption[] {
  const _additional_plugins = config.plugins || [];
  const _additional_svelte_preprocess = config.svelte?.preprocess || [];
  const _svelte_extensions = (config.svelte?.extensions || [".svelte"]).map(
    (ext) => {
      if (ext.trim().startsWith(".")) {
        return ext;
      }
      return `.${ext.trim()}`;
    },
  );

  if (!_svelte_extensions.includes(".svelte")) {
    _svelte_extensions.push(".svelte");
  }

  return [
    svelte({
      inspector: false,
      onwarn(warning, handler) {
        if (
          svelte_codes_to_ignore.hasOwnProperty(warning.code) &&
          svelte_codes_to_ignore[warning.code] &&
          warning.message.includes(svelte_codes_to_ignore[warning.code])
        ) {
          return;
        }
        handler!(warning);
      },
      prebundleSvelteLibraries: false,
      compilerOptions: {
        discloseVersion: false,
        hmr: true,
      },
      extensions: _svelte_extensions,
      preprocess: [
        preprocess({
          typescript: {
            compilerOptions: {
              declaration: false,
              declarationMap: false,
            },
          },
        }),
        ...(_additional_svelte_preprocess as PreprocessorGroup[]),
      ],
    }),
    ..._additional_plugins,
  ];
}

interface GradioPluginOptions {
  mode: "dev" | "build";
  svelte_dir: string;
  backend_port?: number;
  imports?: string;
  runtimes?: string;
}

export function make_gradio_plugin({
  mode,
  backend_port,
  imports,
  runtimes,
}: GradioPluginOptions): Plugin {
  const v_id = "virtual:component-loader";
  const v_id_2 = "virtual:cc-init";
  const resolved_v_id = "\0" + v_id;
  const resolved_v_id_2 = "\0" + v_id_2;
  return {
    name: "gradio",
    enforce: "pre",
    resolveId(id) {
      if (id === v_id) {
        return resolved_v_id;
      }
      if (id === v_id_2) {
        return resolved_v_id_2;
      }
    },
    load(id) {
      if (id === resolved_v_id) {
        return `export default {};`;
      }

      if (id === resolved_v_id_2) {
        console.log("init gradio")
        return `window.__GRADIO_DEV__ = "dev";
      window.__GRADIO__SERVER_PORT__ = ${backend_port};
      window.__GRADIO__CC__ = ${imports};
      window.__GRADIO__CC__RUNTIMES__ = ${runtimes};`;
      }
    },
    transform(code, id) {
      return code.replace('"_NORMAL_"', '"_CC_"');
    },
  };
}

export const deepmerge_plugin: Plugin = {
  name: "deepmerge",
  enforce: "pre",
  resolveId(id) {
    if (id === "deepmerge") {
      return "deepmerge_internal";
    }
  },
  load(id) {
    if (id === "deepmerge_internal") {
      return deepmerge;
    }
  },
};
