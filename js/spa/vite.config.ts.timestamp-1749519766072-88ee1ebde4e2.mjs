// vite.config.ts
import { defineConfig } from "file:///Users/freddyboulton/sources/gradio/node_modules/.pnpm/vite@5.2.11_@types+node@20.12.8_lightningcss@1.24.1_sass@1.66.1_stylus@0.63.0_sugarss@4.0.1_postcss@8.4.38_/node_modules/vite/dist/node/index.js";
import {
	svelte,
	vitePreprocess
} from "file:///Users/freddyboulton/sources/gradio/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@3.1.0_svelte@4.2.15_vite@5.2.11_@types+node@20.12.8_lightningcss_wkmk4klpee4c53fwtse4ckqvsu/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { sveltePreprocess } from "file:///Users/freddyboulton/sources/gradio/node_modules/.pnpm/svelte-preprocess@6.0.3_@babel+core@7.24.5_coffeescript@2.7.0_postcss-load-config@4.0.2_postc_bw3tnxgvtlwtsn3qtmauvqhvkq/node_modules/svelte-preprocess/dist/index.js";
import custom_media from "file:///Users/freddyboulton/sources/gradio/node_modules/.pnpm/postcss-custom-media@10.0.4_postcss@8.4.38/node_modules/postcss-custom-media/dist/index.mjs";
import global_data from "file:///Users/freddyboulton/sources/gradio/node_modules/.pnpm/@csstools+postcss-global-data@2.1.1_postcss@8.4.38/node_modules/@csstools/postcss-global-data/dist/index.mjs";
import prefixer from "file:///Users/freddyboulton/sources/gradio/node_modules/.pnpm/postcss-prefix-selector@1.16.1_postcss@8.4.38/node_modules/postcss-prefix-selector/index.js";
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
} from "file:///Users/freddyboulton/sources/gradio/js/build/out/index.js";
var __vite_injected_original_dirname =
	"/Users/freddyboulton/sources/gradio/js/spa";
var version_path = resolve(
	__vite_injected_original_dirname,
	"../../gradio/package.json"
);
var theme_token_path = resolve(
	__vite_injected_original_dirname,
	"../theme/src/tokens.css"
);
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
			BACKEND_URL: production
				? JSON.stringify("")
				: JSON.stringify("http://localhost:7860/"),
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
							} else if (
								selector.indexOf(":root") > -1 ||
								selector.indexOf("dark") > -1 ||
								selector.indexOf("body") > -1 ||
								fileName.indexOf(".svelte") > -1
							) {
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
				preprocess: [
					vitePreprocess(),
					sveltePreprocess({
						postcss: {
							plugins: [
								global_data({ files: [theme_token_path] }),
								custom_media()
							]
						}
					})
				]
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
			setupFiles: [
				resolve(
					__vite_injected_original_dirname,
					"../../.config/setup_vite_tests.ts"
				)
			],
			environment: TEST_MODE,
			include:
				TEST_MODE === "node"
					? ["**/*.node-test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
					: ["**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			exclude: ["**/node_modules/**", "**/gradio/gradio/**"],
			globals: true,
			onConsoleLog(log, type) {
				if (log.includes("was created with unknown prop")) return false;
			}
		}
	};
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZnJlZGR5Ym91bHRvbi9zb3VyY2VzL2dyYWRpby9qcy9zcGFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9mcmVkZHlib3VsdG9uL3NvdXJjZXMvZ3JhZGlvL2pzL3NwYS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZnJlZGR5Ym91bHRvbi9zb3VyY2VzL2dyYWRpby9qcy9zcGEvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgc3ZlbHRlLCB2aXRlUHJlcHJvY2VzcyB9IGZyb20gXCJAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlXCI7XG5pbXBvcnQgeyBzdmVsdGVQcmVwcm9jZXNzIH0gZnJvbSBcInN2ZWx0ZS1wcmVwcm9jZXNzXCI7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgY3VzdG9tX21lZGlhIGZyb20gXCJwb3N0Y3NzLWN1c3RvbS1tZWRpYVwiO1xuaW1wb3J0IGdsb2JhbF9kYXRhIGZyb20gXCJAY3NzdG9vbHMvcG9zdGNzcy1nbG9iYWwtZGF0YVwiO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHByZWZpeGVyIGZyb20gXCJwb3N0Y3NzLXByZWZpeC1zZWxlY3RvclwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcblxuY29uc3QgdmVyc2lvbl9wYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vZ3JhZGlvL3BhY2thZ2UuanNvblwiKTtcbmNvbnN0IHRoZW1lX3Rva2VuX3BhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgXCIuLi90aGVtZS9zcmMvdG9rZW5zLmNzc1wiKTtcbmNvbnN0IHZlcnNpb25fcmF3ID0gSlNPTi5wYXJzZShcblx0cmVhZEZpbGVTeW5jKHZlcnNpb25fcGF0aCwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pXG4pLnZlcnNpb24udHJpbSgpO1xuY29uc3QgdmVyc2lvbiA9IHZlcnNpb25fcmF3LnJlcGxhY2UoL1xcLi9nLCBcIi1cIik7XG5cbmZ1bmN0aW9uIGNvbnZlcnRfdG9fcHlwaV9wcmVyZWxlYXNlKHZlcnNpb246IHN0cmluZykge1xuXHRyZXR1cm4gdmVyc2lvbi5yZXBsYWNlKFxuXHRcdC8oXFxkK1xcLlxcZCtcXC5cXGQrKS0oWy1hLXpdKylcXC4oXFxkKykvLFxuXHRcdChtYXRjaCwgdiwgdGFnLCB0YWdfdmVyc2lvbikgPT4ge1xuXHRcdFx0aWYgKHRhZyA9PT0gXCJiZXRhXCIpIHtcblx0XHRcdFx0cmV0dXJuIGAke3Z9YiR7dGFnX3ZlcnNpb259YDtcblx0XHRcdH0gZWxzZSBpZiAodGFnID09PSBcImFscGhhXCIpIHtcblx0XHRcdFx0cmV0dXJuIGAke3Z9YSR7dGFnX3ZlcnNpb259YDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB2ZXJzaW9uO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcbn1cblxuY29uc3QgcHl0aG9uX3ZlcnNpb24gPSBjb252ZXJ0X3RvX3B5cGlfcHJlcmVsZWFzZSh2ZXJzaW9uX3Jhdyk7XG5cbmNvbnN0IGNsaWVudF92ZXJzaW9uX3BhdGggPSByZXNvbHZlKFxuXHRfX2Rpcm5hbWUsXG5cdFwiLi4vLi4vY2xpZW50L3B5dGhvbi9ncmFkaW9fY2xpZW50L3BhY2thZ2UuanNvblwiXG4pO1xuY29uc3QgY2xpZW50X3ZlcnNpb25fcmF3ID0gSlNPTi5wYXJzZShcblx0cmVhZEZpbGVTeW5jKGNsaWVudF92ZXJzaW9uX3BhdGgsIHtcblx0XHRlbmNvZGluZzogXCJ1dGYtOFwiXG5cdH0pXG4pLnZlcnNpb24udHJpbSgpO1xuXG5jb25zdCBjbGllbnRfcHl0aG9uX3ZlcnNpb24gPSBjb252ZXJ0X3RvX3B5cGlfcHJlcmVsZWFzZShjbGllbnRfdmVyc2lvbl9yYXcpO1xuXG5pbXBvcnQge1xuXHRpbmplY3RfZWpzLFxuXHRnZW5lcmF0ZV9jZG5fZW50cnksXG5cdGdlbmVyYXRlX2Rldl9lbnRyeSxcblx0aGFuZGxlX2NlX2Nzcyxcblx0aW5qZWN0X2NvbXBvbmVudF9sb2FkZXIsXG5cdHJlc29sdmVfc3ZlbHRlLFxuXHRtb2NrX21vZHVsZXNcbn0gZnJvbSBcIkBzZWxmL2J1aWxkXCI7XG5cbmNvbnN0IEdSQURJT19WRVJTSU9OID0gdmVyc2lvbl9yYXcgfHwgXCJhc2Rfc3R1Yl9hc2RcIjtcbmNvbnN0IENETl9CQVNFID0gXCJodHRwczovL2dyYWRpby5zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwiO1xuY29uc3QgVEVTVF9NT0RFID0gcHJvY2Vzcy5lbnYuVEVTVF9NT0RFIHx8IFwiaGFwcHktZG9tXCI7XG5cbi8vQHRzLWlnbm9yZVxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuXHRjb25zdCBwcm9kdWN0aW9uID0gbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCI7XG5cdGNvbnN0IGRldmVsb3BtZW50ID0gbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiO1xuXG5cdHJldHVybiB7XG5cdFx0YmFzZTogXCIuL1wiLFxuXHRcdHNlcnZlcjoge1xuXHRcdFx0cG9ydDogOTg3Nixcblx0XHRcdG9wZW46IFwiL1wiXG5cdFx0fSxcblx0XHRidWlsZDoge1xuXHRcdFx0c291cmNlbWFwOiB0cnVlLFxuXHRcdFx0dGFyZ2V0OiBcImVzbmV4dFwiLFxuXHRcdFx0bWluaWZ5OiBwcm9kdWN0aW9uLFxuXHRcdFx0b3V0RGlyOiBcIi4uLy4uL2dyYWRpby90ZW1wbGF0ZXMvZnJvbnRlbmRcIixcblx0XHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdFx0ZXh0ZXJuYWw6IFtcIi4vc3ZlbHRlL3N2ZWx0ZS5qc1wiXSxcblx0XHRcdFx0bWFrZUFic29sdXRlRXh0ZXJuYWxzUmVsYXRpdmU6IGZhbHNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRkZWZpbmU6IHtcblx0XHRcdEJVSUxEX01PREU6IHByb2R1Y3Rpb24gPyBKU09OLnN0cmluZ2lmeShcInByb2RcIikgOiBKU09OLnN0cmluZ2lmeShcImRldlwiKSxcblx0XHRcdEJBQ0tFTkRfVVJMOiBwcm9kdWN0aW9uXG5cdFx0XHRcdD8gSlNPTi5zdHJpbmdpZnkoXCJcIilcblx0XHRcdFx0OiBKU09OLnN0cmluZ2lmeShcImh0dHA6Ly9sb2NhbGhvc3Q6Nzg2MC9cIiksXG5cdFx0XHRHUkFESU9fVkVSU0lPTjogSlNPTi5zdHJpbmdpZnkodmVyc2lvbilcblx0XHR9LFxuXHRcdGNzczoge1xuXHRcdFx0cG9zdGNzczoge1xuXHRcdFx0XHRwbHVnaW5zOiBbXG5cdFx0XHRcdFx0cHJlZml4ZXIoe1xuXHRcdFx0XHRcdFx0cHJlZml4OiBgLmdyYWRpby1jb250YWluZXItJHt2ZXJzaW9ufWAsXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHR0cmFuc2Zvcm0ocHJlZml4LCBzZWxlY3RvciwgcHJlZml4ZWRTZWxlY3RvciwgZmlsZU5hbWUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGVjdG9yLmluZGV4T2YoXCJncmFkaW8tY29udGFpbmVyXCIpID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcHJlZml4O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdG9yLmluZGV4T2YoXCI6cm9vdFwiKSA+IC0xIHx8XG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0b3IuaW5kZXhPZihcImRhcmtcIikgPiAtMSB8fFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdG9yLmluZGV4T2YoXCJib2R5XCIpID4gLTEgfHxcblx0XHRcdFx0XHRcdFx0XHRmaWxlTmFtZS5pbmRleE9mKFwiLnN2ZWx0ZVwiKSA+IC0xXG5cdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxlY3Rvcjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcHJlZml4ZWRTZWxlY3Rvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRjdXN0b21fbWVkaWEoKVxuXHRcdFx0XHRdXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRwbHVnaW5zOiBbXG5cdFx0XHRyZXNvbHZlX3N2ZWx0ZShkZXZlbG9wbWVudCksXG5cdFx0XHRzdmVsdGUoe1xuXHRcdFx0XHRpbnNwZWN0b3I6IGZhbHNlLFxuXHRcdFx0XHRjb21waWxlck9wdGlvbnM6IHtcblx0XHRcdFx0XHRkZXY6IHRydWUsXG5cdFx0XHRcdFx0ZGlzY2xvc2VWZXJzaW9uOiBmYWxzZSxcblx0XHRcdFx0XHRhY2Nlc3NvcnM6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0aG90OiAhcHJvY2Vzcy5lbnYuVklURVNUICYmICFwcm9kdWN0aW9uLFxuXHRcdFx0XHRwcmVwcm9jZXNzOiBbXG5cdFx0XHRcdFx0dml0ZVByZXByb2Nlc3MoKSxcblx0XHRcdFx0XHRzdmVsdGVQcmVwcm9jZXNzKHtcblx0XHRcdFx0XHRcdHBvc3Rjc3M6IHtcblx0XHRcdFx0XHRcdFx0cGx1Z2luczogW1xuXHRcdFx0XHRcdFx0XHRcdGdsb2JhbF9kYXRhKHsgZmlsZXM6IFt0aGVtZV90b2tlbl9wYXRoXSB9KSxcblx0XHRcdFx0XHRcdFx0XHRjdXN0b21fbWVkaWEoKVxuXHRcdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XVxuXHRcdFx0fSksXG5cdFx0XHRnZW5lcmF0ZV9kZXZfZW50cnkoe1xuXHRcdFx0XHRlbmFibGU6ICFkZXZlbG9wbWVudCAmJiBtb2RlICE9PSBcInRlc3RcIlxuXHRcdFx0fSksXG5cdFx0XHRpbmplY3RfZWpzKCksXG5cdFx0XHRnZW5lcmF0ZV9jZG5fZW50cnkoeyB2ZXJzaW9uOiBHUkFESU9fVkVSU0lPTiwgY2RuX2Jhc2U6IENETl9CQVNFIH0pLFxuXHRcdFx0aGFuZGxlX2NlX2NzcygpLFxuXHRcdFx0aW5qZWN0X2NvbXBvbmVudF9sb2FkZXIoeyBtb2RlIH0pLFxuXHRcdFx0bW9kZSA9PT0gXCJ0ZXN0XCIgJiYgbW9ja19tb2R1bGVzKClcblx0XHRdLFxuXHRcdG9wdGltaXplRGVwczoge1xuXHRcdFx0ZXhjbHVkZTogW1wiQGZmbXBlZy9mZm1wZWdcIiwgXCJAZmZtcGVnL3V0aWxcIl1cblx0XHR9LFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGNvbmRpdGlvbnM6IFtcImdyYWRpb1wiXVxuXHRcdH0sXG5cdFx0dGVzdDoge1xuXHRcdFx0c2V0dXBGaWxlczogW3Jlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uLy5jb25maWcvc2V0dXBfdml0ZV90ZXN0cy50c1wiKV0sXG5cdFx0XHRlbnZpcm9ubWVudDogVEVTVF9NT0RFLFxuXHRcdFx0aW5jbHVkZTpcblx0XHRcdFx0VEVTVF9NT0RFID09PSBcIm5vZGVcIlxuXHRcdFx0XHRcdD8gW1wiKiovKi5ub2RlLXRlc3Que2pzLG1qcyxjanMsdHMsbXRzLGN0cyxqc3gsdHN4fVwiXVxuXHRcdFx0XHRcdDogW1wiKiovKi50ZXN0LntqcyxtanMsY2pzLHRzLG10cyxjdHMsanN4LHRzeH1cIl0sXG5cdFx0XHRleGNsdWRlOiBbXCIqKi9ub2RlX21vZHVsZXMvKipcIiwgXCIqKi9ncmFkaW8vZ3JhZGlvLyoqXCJdLFxuXHRcdFx0Z2xvYmFsczogdHJ1ZSxcblx0XHRcdG9uQ29uc29sZUxvZyhsb2csIHR5cGUpIHtcblx0XHRcdFx0aWYgKGxvZy5pbmNsdWRlcyhcIndhcyBjcmVhdGVkIHdpdGggdW5rbm93biBwcm9wXCIpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdULFNBQVMsb0JBQW9CO0FBQzdVLFNBQVMsUUFBUSxzQkFBc0I7QUFDdkMsU0FBUyx3QkFBd0I7QUFFakMsT0FBTyxrQkFBa0I7QUFDekIsT0FBTyxpQkFBaUI7QUFFeEIsT0FBTyxjQUFjO0FBQ3JCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQXNDeEI7QUFBQSxFQUNDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsT0FDTTtBQXZEUCxJQUFNLG1DQUFtQztBQVd6QyxJQUFNLGVBQWUsUUFBUSxrQ0FBVywyQkFBMkI7QUFDbkUsSUFBTSxtQkFBbUIsUUFBUSxrQ0FBVyx5QkFBeUI7QUFDckUsSUFBTSxjQUFjLEtBQUs7QUFBQSxFQUN4QixhQUFhLGNBQWMsRUFBRSxVQUFVLFFBQVEsQ0FBQztBQUNqRCxFQUFFLFFBQVEsS0FBSztBQUNmLElBQU0sVUFBVSxZQUFZLFFBQVEsT0FBTyxHQUFHO0FBRTlDLFNBQVMsMkJBQTJCQSxVQUFpQjtBQUNwRCxTQUFPQSxTQUFRO0FBQUEsSUFDZDtBQUFBLElBQ0EsQ0FBQyxPQUFPLEdBQUcsS0FBSyxnQkFBZ0I7QUFDL0IsVUFBSSxRQUFRLFFBQVE7QUFDbkIsZUFBTyxHQUFHLENBQUMsSUFBSSxXQUFXO0FBQUEsTUFDM0IsV0FBVyxRQUFRLFNBQVM7QUFDM0IsZUFBTyxHQUFHLENBQUMsSUFBSSxXQUFXO0FBQUEsTUFDM0IsT0FBTztBQUNOLGVBQU9BO0FBQUEsTUFDUjtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0Q7QUFFQSxJQUFNLGlCQUFpQiwyQkFBMkIsV0FBVztBQUU3RCxJQUFNLHNCQUFzQjtBQUFBLEVBQzNCO0FBQUEsRUFDQTtBQUNEO0FBQ0EsSUFBTSxxQkFBcUIsS0FBSztBQUFBLEVBQy9CLGFBQWEscUJBQXFCO0FBQUEsSUFDakMsVUFBVTtBQUFBLEVBQ1gsQ0FBQztBQUNGLEVBQUUsUUFBUSxLQUFLO0FBRWYsSUFBTSx3QkFBd0IsMkJBQTJCLGtCQUFrQjtBQVkzRSxJQUFNLGlCQUFpQixlQUFlO0FBQ3RDLElBQU0sV0FBVztBQUNqQixJQUFNLFlBQVksUUFBUSxJQUFJLGFBQWE7QUFHM0MsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDekMsUUFBTSxhQUFhLFNBQVM7QUFDNUIsUUFBTSxjQUFjLFNBQVM7QUFFN0IsU0FBTztBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1A7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNkLFVBQVUsQ0FBQyxvQkFBb0I7QUFBQSxRQUMvQiwrQkFBK0I7QUFBQSxNQUNoQztBQUFBLElBQ0Q7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNQLFlBQVksYUFBYSxLQUFLLFVBQVUsTUFBTSxJQUFJLEtBQUssVUFBVSxLQUFLO0FBQUEsTUFDdEUsYUFBYSxhQUNWLEtBQUssVUFBVSxFQUFFLElBQ2pCLEtBQUssVUFBVSx3QkFBd0I7QUFBQSxNQUMxQyxnQkFBZ0IsS0FBSyxVQUFVLE9BQU87QUFBQSxJQUN2QztBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0osU0FBUztBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1IsU0FBUztBQUFBLFlBQ1IsUUFBUSxxQkFBcUIsT0FBTztBQUFBO0FBQUEsWUFFcEMsVUFBVSxRQUFRLFVBQVUsa0JBQWtCLFVBQVU7QUFDdkQsa0JBQUksU0FBUyxRQUFRLGtCQUFrQixJQUFJLElBQUk7QUFDOUMsdUJBQU87QUFBQSxjQUNSLFdBQ0MsU0FBUyxRQUFRLE9BQU8sSUFBSSxNQUM1QixTQUFTLFFBQVEsTUFBTSxJQUFJLE1BQzNCLFNBQVMsUUFBUSxNQUFNLElBQUksTUFDM0IsU0FBUyxRQUFRLFNBQVMsSUFBSSxJQUM3QjtBQUNELHVCQUFPO0FBQUEsY0FDUjtBQUNBLHFCQUFPO0FBQUEsWUFDUjtBQUFBLFVBQ0QsQ0FBQztBQUFBLFVBQ0QsYUFBYTtBQUFBLFFBQ2Q7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1IsZUFBZSxXQUFXO0FBQUEsTUFDMUIsT0FBTztBQUFBLFFBQ04sV0FBVztBQUFBLFFBQ1gsaUJBQWlCO0FBQUEsVUFDaEIsS0FBSztBQUFBLFVBQ0wsaUJBQWlCO0FBQUEsVUFDakIsV0FBVztBQUFBLFFBQ1o7QUFBQSxRQUNBLEtBQUssQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDO0FBQUEsUUFDN0IsWUFBWTtBQUFBLFVBQ1gsZUFBZTtBQUFBLFVBQ2YsaUJBQWlCO0FBQUEsWUFDaEIsU0FBUztBQUFBLGNBQ1IsU0FBUztBQUFBLGdCQUNSLFlBQVksRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUFBLGdCQUN6QyxhQUFhO0FBQUEsY0FDZDtBQUFBLFlBQ0Q7QUFBQSxVQUNELENBQUM7QUFBQSxRQUNGO0FBQUEsTUFDRCxDQUFDO0FBQUEsTUFDRCxtQkFBbUI7QUFBQSxRQUNsQixRQUFRLENBQUMsZUFBZSxTQUFTO0FBQUEsTUFDbEMsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLE1BQ1gsbUJBQW1CLEVBQUUsU0FBUyxnQkFBZ0IsVUFBVSxTQUFTLENBQUM7QUFBQSxNQUNsRSxjQUFjO0FBQUEsTUFDZCx3QkFBd0IsRUFBRSxLQUFLLENBQUM7QUFBQSxNQUNoQyxTQUFTLFVBQVUsYUFBYTtBQUFBLElBQ2pDO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDYixTQUFTLENBQUMsa0JBQWtCLGNBQWM7QUFBQSxJQUMzQztBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1IsWUFBWSxDQUFDLFFBQVE7QUFBQSxJQUN0QjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0wsWUFBWSxDQUFDLFFBQVEsa0NBQVcsbUNBQW1DLENBQUM7QUFBQSxNQUNwRSxhQUFhO0FBQUEsTUFDYixTQUNDLGNBQWMsU0FDWCxDQUFDLGdEQUFnRCxJQUNqRCxDQUFDLDJDQUEyQztBQUFBLE1BQ2hELFNBQVMsQ0FBQyxzQkFBc0IscUJBQXFCO0FBQUEsTUFDckQsU0FBUztBQUFBLE1BQ1QsYUFBYSxLQUFLLE1BQU07QUFDdkIsWUFBSSxJQUFJLFNBQVMsK0JBQStCO0FBQUcsaUJBQU87QUFBQSxNQUMzRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFsidmVyc2lvbiJdCn0K
