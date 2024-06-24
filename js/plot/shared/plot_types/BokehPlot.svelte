<script lang="ts">
	//@ts-nocheck
	import { onDestroy, createEventDispatcher } from "svelte";

	export let value;
	export let bokeh_version: string | null;
	const div_id = `bokehDiv-${Math.random().toString(5).substring(2)}`;
	const dispatch = createEventDispatcher<{ load: undefined }>();
	$: plot = value?.plot;

	async function embed_bokeh(_plot: Record<string, any>): void {
		if (document) {
			if (document.getElementById(div_id)) {
				document.getElementById(div_id).innerHTML = "";
			}
		}
		if (window.Bokeh) {
			load_bokeh();
			let plotObj = JSON.parse(_plot);
			const y = await window.Bokeh.embed.embed_item(plotObj, div_id);
			y._roots.forEach(async (p) => {
				await p.ready;
				dispatch("load");
			});
		}
	}

	$: loaded && embed_bokeh(plot);

	const main_src = `https://cdn.bokeh.org/bokeh/release/bokeh-${bokeh_version}.min.js`;

	const plugins_src = [
		`https://cdn.pydata.org/bokeh/release/bokeh-widgets-${bokeh_version}.min.js`,
		`https://cdn.pydata.org/bokeh/release/bokeh-tables-${bokeh_version}.min.js`,
		`https://cdn.pydata.org/bokeh/release/bokeh-gl-${bokeh_version}.min.js`,
		`https://cdn.pydata.org/bokeh/release/bokeh-api-${bokeh_version}.min.js`
	];

	let loaded = false;
	async function load_plugins(): HTMLScriptElement[] {
		await Promise.all(
			plugins_src.map((src, i) => {
				return new Promise((resolve) => {
					const script = document.createElement("script");
					script.onload = resolve;
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
