// vite.config.ts
import { defineConfig } from "file:///Users/peterallen/Projects/gradio/node_modules/.pnpm/vite@5.2.11_@types+node@20.12.8_lightningcss@1.24.1_sass@1.66.1_stylus@0.63.0_sugarss@4.0.1_postcss@8.4.38_/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/peterallen/Projects/gradio/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@3.1.0_svelte@4.2.15_vite@5.2.11_@types+node@20.12.8_lightningcss_rxr5oqrkxc7hflkhk7xicxzg6y/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import sveltePreprocess from "file:///Users/peterallen/Projects/gradio/node_modules/.pnpm/svelte-preprocess@5.1.4_@babel+core@7.24.5_coffeescript@2.7.0_postcss-load-config@4.0.2_postc_prou7suhu5qu3xzhwgjzjl44r4/node_modules/svelte-preprocess/dist/index.js";
import custom_media from "file:///Users/peterallen/Projects/gradio/node_modules/.pnpm/postcss-custom-media@10.0.4_postcss@8.4.38/node_modules/postcss-custom-media/dist/index.mjs";
import global_data from "file:///Users/peterallen/Projects/gradio/node_modules/.pnpm/@csstools+postcss-global-data@2.1.1_postcss@8.4.38/node_modules/@csstools/postcss-global-data/dist/index.mjs";
import prefixer from "file:///Users/peterallen/Projects/gradio/node_modules/.pnpm/postcss-prefix-selector@1.16.1_postcss@8.4.38/node_modules/postcss-prefix-selector/index.js";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  inject_ejs,
  generate_cdn_entry,
  generate_dev_entry,
  handle_ce_css,
  inject_component_loader,
  resolve_svelte,
  mock_modules
} from "file:///Users/peterallen/Projects/gradio/js/build/out/index.js";
var __vite_injected_original_dirname = "/Users/peterallen/Projects/gradio/js/spa";
var version_path = resolve(__vite_injected_original_dirname, "../../gradio/package.json");
var theme_token_path = resolve(__vite_injected_original_dirname, "../theme/src/tokens.css");
var version_raw = JSON.parse(
  readFileSync(version_path, { encoding: "utf-8" })
).version.trim();
var version = version_raw.replace(/\./g, "-");
function convert_to_pypi_prerelease(version2) {
  return version2.replace(
    /(\d+\.\d+\.\d+)-([-a-z]+)\.(\d+)/,
    (match, v, tag, tag_version) => {
      if (tag === "beta") {
        return `${v}b${tag_version}`;
      } else if (tag === "alpha") {
        return `${v}a${tag_version}`;
      } else {
        return version2;
      }
    }
  );
}
var python_version = convert_to_pypi_prerelease(version_raw);
var client_version_path = resolve(
  __vite_injected_original_dirname,
  "../../client/python/gradio_client/package.json"
);
var client_version_raw = JSON.parse(
  readFileSync(client_version_path, {
    encoding: "utf-8"
  })
).version.trim();
var client_python_version = convert_to_pypi_prerelease(client_version_raw);
var GRADIO_VERSION = version_raw || "asd_stub_asd";
var CDN_BASE = "https://gradio.s3-us-west-2.amazonaws.com";
var TEST_MODE = process.env.TEST_MODE || "happy-dom";
var vite_config_default = defineConfig(({ mode }) => {
  const production = mode === "production";
  const development = mode === "development";
  return {
    base: "./",
    server: {
      port: 9876,
      open: "/"
    },
    build: {
      sourcemap: true,
      target: "esnext",
      minify: production,
      outDir: "../../gradio/templates/frontend",
      rollupOptions: {
        external: ["./svelte/svelte.js"],
        makeAbsoluteExternalsRelative: false
      }
    },
    define: {
      BUILD_MODE: production ? JSON.stringify("prod") : JSON.stringify("dev"),
      BACKEND_URL: production ? JSON.stringify("") : JSON.stringify("http://localhost:7860/"),
      GRADIO_VERSION: JSON.stringify(version)
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
              } else if (selector.indexOf(":root") > -1 || selector.indexOf("dark") > -1 || selector.indexOf("body") > -1 || fileName.indexOf(".svelte") > -1) {
                return selector;
              }
              return prefixedSelector;
            }
          }),
          custom_media()
        ]
      }
    },
    plugins: [
      resolve_svelte(development),
      svelte({
        inspector: false,
        compilerOptions: {
          dev: true,
          discloseVersion: false,
          accessors: true
        },
        hot: !process.env.VITEST && !production,
        preprocess: sveltePreprocess({
          postcss: {
            plugins: [
              global_data({ files: [theme_token_path] }),
              custom_media()
            ]
          }
        })
      }),
      generate_dev_entry({
        enable: !development && mode !== "test"
      }),
      inject_ejs(),
      generate_cdn_entry({ version: GRADIO_VERSION, cdn_base: CDN_BASE }),
      handle_ce_css(),
      inject_component_loader({ mode }),
      mode === "test" && mock_modules()
    ],
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
    },
    resolve: {
      conditions: ["gradio"]
    },
    test: {
      setupFiles: [resolve(__vite_injected_original_dirname, "../../.config/setup_vite_tests.ts")],
      environment: TEST_MODE,
      include: TEST_MODE === "node" ? ["**/*.node-test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"] : ["**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["**/node_modules/**", "**/gradio/gradio/**"],
      globals: true,
      onConsoleLog(log, type) {
        if (log.includes("was created with unknown prop"))
          return false;
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcGV0ZXJhbGxlbi9Qcm9qZWN0cy9ncmFkaW8vanMvc3BhXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcGV0ZXJhbGxlbi9Qcm9qZWN0cy9ncmFkaW8vanMvc3BhL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wZXRlcmFsbGVuL1Byb2plY3RzL2dyYWRpby9qcy9zcGEvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSBcIkBzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGVcIjtcbmltcG9ydCBzdmVsdGVQcmVwcm9jZXNzIGZyb20gXCJzdmVsdGUtcHJlcHJvY2Vzc1wiO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IGN1c3RvbV9tZWRpYSBmcm9tIFwicG9zdGNzcy1jdXN0b20tbWVkaWFcIjtcbmltcG9ydCBnbG9iYWxfZGF0YSBmcm9tIFwiQGNzc3Rvb2xzL3Bvc3Rjc3MtZ2xvYmFsLWRhdGFcIjtcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwcmVmaXhlciBmcm9tIFwicG9zdGNzcy1wcmVmaXgtc2VsZWN0b3JcIjtcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5cbmNvbnN0IHZlcnNpb25fcGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL2dyYWRpby9wYWNrYWdlLmpzb25cIik7XG5jb25zdCB0aGVtZV90b2tlbl9wYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vdGhlbWUvc3JjL3Rva2Vucy5jc3NcIik7XG5jb25zdCB2ZXJzaW9uX3JhdyA9IEpTT04ucGFyc2UoXG5cdHJlYWRGaWxlU3luYyh2ZXJzaW9uX3BhdGgsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KVxuKS52ZXJzaW9uLnRyaW0oKTtcbmNvbnN0IHZlcnNpb24gPSB2ZXJzaW9uX3Jhdy5yZXBsYWNlKC9cXC4vZywgXCItXCIpO1xuXG5mdW5jdGlvbiBjb252ZXJ0X3RvX3B5cGlfcHJlcmVsZWFzZSh2ZXJzaW9uOiBzdHJpbmcpIHtcblx0cmV0dXJuIHZlcnNpb24ucmVwbGFjZShcblx0XHQvKFxcZCtcXC5cXGQrXFwuXFxkKyktKFstYS16XSspXFwuKFxcZCspLyxcblx0XHQobWF0Y2gsIHYsIHRhZywgdGFnX3ZlcnNpb24pID0+IHtcblx0XHRcdGlmICh0YWcgPT09IFwiYmV0YVwiKSB7XG5cdFx0XHRcdHJldHVybiBgJHt2fWIke3RhZ192ZXJzaW9ufWA7XG5cdFx0XHR9IGVsc2UgaWYgKHRhZyA9PT0gXCJhbHBoYVwiKSB7XG5cdFx0XHRcdHJldHVybiBgJHt2fWEke3RhZ192ZXJzaW9ufWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdmVyc2lvbjtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG59XG5cbmNvbnN0IHB5dGhvbl92ZXJzaW9uID0gY29udmVydF90b19weXBpX3ByZXJlbGVhc2UodmVyc2lvbl9yYXcpO1xuXG5jb25zdCBjbGllbnRfdmVyc2lvbl9wYXRoID0gcmVzb2x2ZShcblx0X19kaXJuYW1lLFxuXHRcIi4uLy4uL2NsaWVudC9weXRob24vZ3JhZGlvX2NsaWVudC9wYWNrYWdlLmpzb25cIlxuKTtcbmNvbnN0IGNsaWVudF92ZXJzaW9uX3JhdyA9IEpTT04ucGFyc2UoXG5cdHJlYWRGaWxlU3luYyhjbGllbnRfdmVyc2lvbl9wYXRoLCB7XG5cdFx0ZW5jb2Rpbmc6IFwidXRmLThcIlxuXHR9KVxuKS52ZXJzaW9uLnRyaW0oKTtcblxuY29uc3QgY2xpZW50X3B5dGhvbl92ZXJzaW9uID0gY29udmVydF90b19weXBpX3ByZXJlbGVhc2UoY2xpZW50X3ZlcnNpb25fcmF3KTtcblxuaW1wb3J0IHtcblx0aW5qZWN0X2Vqcyxcblx0Z2VuZXJhdGVfY2RuX2VudHJ5LFxuXHRnZW5lcmF0ZV9kZXZfZW50cnksXG5cdGhhbmRsZV9jZV9jc3MsXG5cdGluamVjdF9jb21wb25lbnRfbG9hZGVyLFxuXHRyZXNvbHZlX3N2ZWx0ZSxcblx0bW9ja19tb2R1bGVzXG59IGZyb20gXCJAc2VsZi9idWlsZFwiO1xuXG5jb25zdCBHUkFESU9fVkVSU0lPTiA9IHZlcnNpb25fcmF3IHx8IFwiYXNkX3N0dWJfYXNkXCI7XG5jb25zdCBDRE5fQkFTRSA9IFwiaHR0cHM6Ly9ncmFkaW8uczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cIjtcbmNvbnN0IFRFU1RfTU9ERSA9IHByb2Nlc3MuZW52LlRFU1RfTU9ERSB8fCBcImhhcHB5LWRvbVwiO1xuXG4vL0B0cy1pZ25vcmVcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcblx0Y29uc3QgcHJvZHVjdGlvbiA9IG1vZGUgPT09IFwicHJvZHVjdGlvblwiO1xuXHRjb25zdCBkZXZlbG9wbWVudCA9IG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIjtcblxuXHRyZXR1cm4ge1xuXHRcdGJhc2U6IFwiLi9cIixcblx0XHRzZXJ2ZXI6IHtcblx0XHRcdHBvcnQ6IDk4NzYsXG5cdFx0XHRvcGVuOiBcIi9cIlxuXHRcdH0sXG5cdFx0YnVpbGQ6IHtcblx0XHRcdHNvdXJjZW1hcDogdHJ1ZSxcblx0XHRcdHRhcmdldDogXCJlc25leHRcIixcblx0XHRcdG1pbmlmeTogcHJvZHVjdGlvbixcblx0XHRcdG91dERpcjogXCIuLi8uLi9ncmFkaW8vdGVtcGxhdGVzL2Zyb250ZW5kXCIsXG5cdFx0XHRyb2xsdXBPcHRpb25zOiB7XG5cdFx0XHRcdGV4dGVybmFsOiBbXCIuL3N2ZWx0ZS9zdmVsdGUuanNcIl0sXG5cdFx0XHRcdG1ha2VBYnNvbHV0ZUV4dGVybmFsc1JlbGF0aXZlOiBmYWxzZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZGVmaW5lOiB7XG5cdFx0XHRCVUlMRF9NT0RFOiBwcm9kdWN0aW9uID8gSlNPTi5zdHJpbmdpZnkoXCJwcm9kXCIpIDogSlNPTi5zdHJpbmdpZnkoXCJkZXZcIiksXG5cdFx0XHRCQUNLRU5EX1VSTDogcHJvZHVjdGlvblxuXHRcdFx0XHQ/IEpTT04uc3RyaW5naWZ5KFwiXCIpXG5cdFx0XHRcdDogSlNPTi5zdHJpbmdpZnkoXCJodHRwOi8vbG9jYWxob3N0Ojc4NjAvXCIpLFxuXHRcdFx0R1JBRElPX1ZFUlNJT046IEpTT04uc3RyaW5naWZ5KHZlcnNpb24pXG5cdFx0fSxcblx0XHRjc3M6IHtcblx0XHRcdHBvc3Rjc3M6IHtcblx0XHRcdFx0cGx1Z2luczogW1xuXHRcdFx0XHRcdHByZWZpeGVyKHtcblx0XHRcdFx0XHRcdHByZWZpeDogYC5ncmFkaW8tY29udGFpbmVyLSR7dmVyc2lvbn1gLFxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0dHJhbnNmb3JtKHByZWZpeCwgc2VsZWN0b3IsIHByZWZpeGVkU2VsZWN0b3IsIGZpbGVOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzZWxlY3Rvci5pbmRleE9mKFwiZ3JhZGlvLWNvbnRhaW5lclwiKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHByZWZpeDtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rvci5pbmRleE9mKFwiOnJvb3RcIikgPiAtMSB8fFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdG9yLmluZGV4T2YoXCJkYXJrXCIpID4gLTEgfHxcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rvci5pbmRleE9mKFwiYm9keVwiKSA+IC0xIHx8XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZU5hbWUuaW5kZXhPZihcIi5zdmVsdGVcIikgPiAtMVxuXHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZWN0b3I7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHByZWZpeGVkU2VsZWN0b3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0Y3VzdG9tX21lZGlhKClcblx0XHRcdFx0XVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGx1Z2luczogW1xuXHRcdFx0cmVzb2x2ZV9zdmVsdGUoZGV2ZWxvcG1lbnQpLFxuXHRcdFx0c3ZlbHRlKHtcblx0XHRcdFx0aW5zcGVjdG9yOiBmYWxzZSxcblx0XHRcdFx0Y29tcGlsZXJPcHRpb25zOiB7XG5cdFx0XHRcdFx0ZGV2OiB0cnVlLFxuXHRcdFx0XHRcdGRpc2Nsb3NlVmVyc2lvbjogZmFsc2UsXG5cdFx0XHRcdFx0YWNjZXNzb3JzOiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhvdDogIXByb2Nlc3MuZW52LlZJVEVTVCAmJiAhcHJvZHVjdGlvbixcblx0XHRcdFx0cHJlcHJvY2Vzczogc3ZlbHRlUHJlcHJvY2Vzcyh7XG5cdFx0XHRcdFx0cG9zdGNzczoge1xuXHRcdFx0XHRcdFx0cGx1Z2luczogW1xuXHRcdFx0XHRcdFx0XHRnbG9iYWxfZGF0YSh7IGZpbGVzOiBbdGhlbWVfdG9rZW5fcGF0aF0gfSksXG5cdFx0XHRcdFx0XHRcdGN1c3RvbV9tZWRpYSgpXG5cdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0fSksXG5cdFx0XHRnZW5lcmF0ZV9kZXZfZW50cnkoe1xuXHRcdFx0XHRlbmFibGU6ICFkZXZlbG9wbWVudCAmJiBtb2RlICE9PSBcInRlc3RcIlxuXHRcdFx0fSksXG5cdFx0XHRpbmplY3RfZWpzKCksXG5cdFx0XHRnZW5lcmF0ZV9jZG5fZW50cnkoeyB2ZXJzaW9uOiBHUkFESU9fVkVSU0lPTiwgY2RuX2Jhc2U6IENETl9CQVNFIH0pLFxuXHRcdFx0aGFuZGxlX2NlX2NzcygpLFxuXHRcdFx0aW5qZWN0X2NvbXBvbmVudF9sb2FkZXIoeyBtb2RlIH0pLFxuXHRcdFx0bW9kZSA9PT0gXCJ0ZXN0XCIgJiYgbW9ja19tb2R1bGVzKClcblx0XHRdLFxuXHRcdG9wdGltaXplRGVwczoge1xuXHRcdFx0ZXhjbHVkZTogW1wiQGZmbXBlZy9mZm1wZWdcIiwgXCJAZmZtcGVnL3V0aWxcIl1cblx0XHR9LFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGNvbmRpdGlvbnM6IFtcImdyYWRpb1wiXVxuXHRcdH0sXG5cdFx0dGVzdDoge1xuXHRcdFx0c2V0dXBGaWxlczogW3Jlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uLy5jb25maWcvc2V0dXBfdml0ZV90ZXN0cy50c1wiKV0sXG5cdFx0XHRlbnZpcm9ubWVudDogVEVTVF9NT0RFLFxuXHRcdFx0aW5jbHVkZTpcblx0XHRcdFx0VEVTVF9NT0RFID09PSBcIm5vZGVcIlxuXHRcdFx0XHRcdD8gW1wiKiovKi5ub2RlLXRlc3Que2pzLG1qcyxjanMsdHMsbXRzLGN0cyxqc3gsdHN4fVwiXVxuXHRcdFx0XHRcdDogW1wiKiovKi50ZXN0LntqcyxtanMsY2pzLHRzLG10cyxjdHMsanN4LHRzeH1cIl0sXG5cdFx0XHRleGNsdWRlOiBbXCIqKi9ub2RlX21vZHVsZXMvKipcIiwgXCIqKi9ncmFkaW8vZ3JhZGlvLyoqXCJdLFxuXHRcdFx0Z2xvYmFsczogdHJ1ZSxcblx0XHRcdG9uQ29uc29sZUxvZyhsb2csIHR5cGUpIHtcblx0XHRcdFx0aWYgKGxvZy5pbmNsdWRlcyhcIndhcyBjcmVhdGVkIHdpdGggdW5rbm93biBwcm9wXCIpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBTLFNBQVMsb0JBQW9CO0FBQ3ZVLFNBQVMsY0FBYztBQUN2QixPQUFPLHNCQUFzQjtBQUU3QixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGlCQUFpQjtBQUV4QixPQUFPLGNBQWM7QUFDckIsU0FBUyxvQkFBb0I7QUFD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
