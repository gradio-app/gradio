import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from "svelte-preprocess";
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import replace from '@rollup/plugin-replace';
import json from "@rollup/plugin-json";
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

const REPO_ROOT = '../../..';

export default {
	input: 'src/main.js',
	output: [{
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	}, {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: `${REPO_ROOT}/gradio/templates/frontend/build/bundle.js`
	}],
	plugins: [
		copy({
			targets: [
				{ src: 'public/*', dest: `${REPO_ROOT}/gradio/templates/frontend` },
				{ src: 'public/static', dest: `${REPO_ROOT}/gradio/templates/frontend` }
			]
		}),
		json(),
		replace({
			BUILD_MODE: production ? "prod" : "dev",
			BACKEND_URL: production ? "" : "http://localhost:7860/"
		}),
		postcss({
			extract: 'themes.css',
			plugins: [
				require("tailwindcss"),
				require("postcss-nested"),
				require("autoprefixer"),
			]
		}),
		svelte({
			preprocess: sveltePreprocess({
				// sourceMap: true,
				postcss: {
					plugins: [
						require("tailwindcss"),
						require("postcss-nested"),
						require("autoprefixer"),
					],
				},
			}),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({
			output: 'bundle.css' 
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
