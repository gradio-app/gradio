<script lang="ts">
	//@ts-nocheck
	let { value, bokeh_version }: { value: any; bokeh_version: string | null } =
		$props();

	const div_id = `bokehDiv-${Math.random().toString(5).substring(2)}`;
	let plot = $derived(value?.plot);

	function static_base(version: string): string {
		const root =
			(typeof window !== "undefined" && window.gradio_config?.root) || "";
		return `${root}/static/bokeh/${version}`;
	}

	function bokeh_local_url(version: string, filename: string): string {
		return `${static_base(version)}/${filename}`;
	}

	function bokeh_cdn_url(version: string, filename: string): string {
		if (filename === `bokeh-${version}.min.js`) {
			return `https://cdn.bokeh.org/bokeh/release/${filename}`;
		}
		return `https://cdn.pydata.org/bokeh/release/${filename}`;
	}

	function load_script(src: string, fallback?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.onload = () => resolve();
			script.onerror = () => {
				if (fallback) {
					const fallback_script = document.createElement("script");
					fallback_script.onload = () => resolve();
					fallback_script.onerror = () => {
						console.error(`Failed to load Bokeh script: ${src}`);
						reject(new Error(`Failed to load ${src}`));
					};
					fallback_script.src = fallback;
					document.head.appendChild(fallback_script);
				} else {
					console.error(`Failed to load Bokeh script: ${src}`);
					reject(new Error(`Failed to load ${src}`));
				}
			};
			script.src = src;
			document.head.appendChild(script);
		});
	}

	async function embed_bokeh(_plot: Record<string, any>): Promise<void> {
		if (document) {
			const el = document.getElementById(div_id);
			if (el) {
				el.innerHTML = "";
			}
		}
		if (window.Bokeh) {
			load_bokeh();
			let plotObj = JSON.parse(_plot);
			await window.Bokeh.embed.embed_item(plotObj, div_id);
		}
	}

	const main_src = bokeh_version
		? bokeh_local_url(bokeh_version, `bokeh-${bokeh_version}.min.js`)
		: null;

	const main_fallback = bokeh_version
		? bokeh_cdn_url(bokeh_version, `bokeh-${bokeh_version}.min.js`)
		: null;

	const plugins_src = bokeh_version
		? [
				bokeh_local_url(bokeh_version, `bokeh-widgets-${bokeh_version}.min.js`),
				bokeh_local_url(bokeh_version, `bokeh-tables-${bokeh_version}.min.js`),
				bokeh_local_url(bokeh_version, `bokeh-gl-${bokeh_version}.min.js`),
				bokeh_local_url(bokeh_version, `bokeh-api-${bokeh_version}.min.js`)
			]
		: [];

	const plugins_fallback = bokeh_version
		? [
				bokeh_cdn_url(bokeh_version, `bokeh-widgets-${bokeh_version}.min.js`),
				bokeh_cdn_url(bokeh_version, `bokeh-tables-${bokeh_version}.min.js`),
				bokeh_cdn_url(bokeh_version, `bokeh-gl-${bokeh_version}.min.js`),
				bokeh_cdn_url(bokeh_version, `bokeh-api-${bokeh_version}.min.js`)
			]
		: [];

	let loaded = $state(false);
	let plugin_scripts: HTMLScriptElement[] = $state([]);

	async function load_plugins(): Promise<void> {
		await Promise.all(
			plugins_src.map((src, i) => load_script(src, plugins_fallback[i]))
		);

		loaded = true;
	}

	function handle_bokeh_loaded(): void {
		load_plugins();
	}

	function load_bokeh(): HTMLScriptElement {
		const script = document.createElement("script");
		script.onload = handle_bokeh_loaded;
		script.onerror = () => {
			if (main_fallback) {
				load_script(main_fallback)
					.then(handle_bokeh_loaded)
					.catch(() => {});
			}
		};
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

	$effect(() => {
		if (loaded && plot) {
			embed_bokeh(plot);
		}
	});

	$effect(() => {
		return () => {
			if (main_script && document.head.contains(main_script)) {
				document.head.removeChild(main_script);
				plugin_scripts.forEach((child) => {
					if (document.head.contains(child)) {
						document.head.removeChild(child);
					}
				});
			}
		};
	});
</script>

<div data-testid={"bokeh"} id={div_id} class="gradio-bokeh" />

<style>
	.gradio-bokeh {
		display: flex;
		justify-content: center;
	}
</style>
