<script lang="ts">
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { version } from "$lib/json/version.json";

	let {
		choices = [version, "5.49.1", "4.44.1", "main"],
		value = $page.params?.version || version,
		docs_type = "python"
	}: {
		choices?: any;
		value?: string;
		docs_type?: any;
	} = $props();

	let is_guide = $derived($page.route.id?.includes("/guides"));
	let is_docs = $derived($page.route.id?.includes("/docs"));

	let match_name = $derived($page.url?.pathname?.match(/\/docs\/([^/]+)/));
	let docs_section = $derived(match_name ? match_name[1] : "");

	let path_parts = $derived($page.route.id?.split("/") || []);
	let is_dynamic = $derived(path_parts[path_parts.length - 1]?.match(/\[.+\]/));

	let docs_url = $derived(
		`${value === version ? "" : `/${value}`}/docs${
			docs_section ? `/${docs_section}` : ""
		}/${
			$page.params?.doc ||
			(is_dynamic || path_parts.length !== 5
				? ""
				: path_parts[path_parts.length - 1])
		}`
	);

	let guide_url = $derived(
		`${value === version ? "" : `/${value}`}/guides/${
			$page.params?.guide ||
			(is_dynamic || path_parts.length !== 4
				? ""
				: path_parts[path_parts.length - 1])
		}`
	);

	function reload() {
		goto(is_docs ? docs_url : guide_url);
	}
</script>

<svelte:head>
	<script
		type="module"
		src="https://gradio.s3-us-west-2.amazonaws.com/{value === 'main'
			? version.replace('b', '-beta.')
			: value.replace('b', '-beta.')}/gradio.js"
	></script>
</svelte:head>

<select
	bind:value
	onchange={reload}
	class="rounded-md border border-orange-200 dark:border-orange-800/50 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0 text-xs mt-2 py-1 pl-2 pr-7 font-mono hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
>
	{#each choices as choice}
		<option value={choice}>{choice}</option>
	{/each}
</select>
