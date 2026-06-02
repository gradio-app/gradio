<script lang="ts">
	//@ts-nocheck
	import { onDestroy } from "svelte";

	export let value;
	export let bokeh_version: string | null;
	const div_id = `bokehDiv-${Math.random().toString(5).substring(2)}`;
	$: plot = value?.plot;

	function static_base(version: string): string {
		const root =
			(typeof window !== "undefined" && window.gradio_config?.root) || "";
		return `${root}/static/bokeh/${version}`;
	}

	function bokeh_script_url(version: string, filename: string): string {
		return `${static_base(version)}/${filename}`;
	}

	async function embed_bokeh(_plot: Record<string, any>): void {
		if (document) {
			if (document.getElementById(div_id)) {
				document.getElementById(div_id).innerHTML = "";
			}
		}
		if (window.Bokeh) {
			load_bokeh();
			let plotObj = JSON.parse(_plot);
			await window.Bokeh.embed.embed_item(plotObj, div_id);
		}
	}

	$: loaded && embed_bokeh(plot);

	$: main_src = bokeh_version
		? bokeh_script_url(bokeh_version, `bokeh-${bokeh_version}.min.js`)
		: null;

	$: plugins_src = bokeh_version
		? [
				bokeh_script_url(bokeh_version, `bokeh-widgets-${bokeh_version}.min.js`),
				bokeh_script_url(bokeh_version, `bokeh-tables-${bokeh_version}.min.js`),
				bokeh_script_url(bokeh_version, `bokeh-gl-${bokeh_version}.min.js`),
				bokeh_script_url(bokeh_version, `bokeh-api-${bokeh_version}.min.js`)
			]
		: [];

	let loaded = false;
	async function load_plugins(): HTMLScriptElement[] {
		await Promise.all(
			plugins_src.map((src, i) => {
				return new Promise((resolve) => {
					const script = document.createElement("script");
					script.onload = resolve;
					script.onerror = resolve;
					script.src = src;
					document.head.appendChild(script);
					return script;
				});
			})
		);

		loaded = true;
	}

	let plugin_scripts = [];

	function handle_bokeh_loaded(): void {
		plugin_scripts = load_plugins();
	}

	function load_bokeh(): HTMLScriptElement {
		const script = document.createElement("script");
		script.onload = handle_bokeh_loaded;
		script.onerror = handle_bokeh_loaded;
		script.src = main_src;
		const is_bokeh_script_present = document.head.querySelector(
			`script[src="${main_src}"]`
		);
		if (!is_bokeh_script_present) {
			document.head.appendChild(script);
		} else {
			handle_bokeh_loaded();
		}
		return script;
	}

	const main_script = bokeh_version ? load_bokeh() : null;

	onDestroy(() => {
		if (main_script in document.children) {
			document.removeChild(main_script);
			plugin_scripts.forEach((child) => document.removeChild(child));
		}
	});
</script>

<div data-testid={"bokeh"} id={div_id} class="gradio-bokeh" />

<style>
	.gradio-bokeh {
		display: flex;
		justify-content: center;
	}
</style>
