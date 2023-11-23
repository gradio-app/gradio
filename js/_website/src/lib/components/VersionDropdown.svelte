<script lang="ts">
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { version } from "$lib/json/version.json";

	export let choices = [version, "3.50.2", "main"];
	export let value: string = $page.params?.version || version;
	export let docs_type = "python";

	$: is_guide = $page.route.id?.includes("/guides");
	$: is_docs = $page.route.id?.includes("/docs/");

	$: docs_url = `${value === version ? "" : `/${value}`}/docs/${
		$page.params?.doc ||
		(is_dynamic || path_parts.length !== 4
			? ""
			: path_parts[path_parts.length - 1])
	}`;

	$: path_parts = $page.route.id?.split("/") || [];
	$: is_dynamic = path_parts[path_parts.length - 1].match(/\[.+\]/);

	$: guide_url = `${value === version ? "" : `/${value}`}/guides/${
		$page.params?.guide ||
		(is_dynamic || path_parts.length !== 4
			? ""
			: path_parts[path_parts.length - 1])
	}`;

	function reload() {
		if (browser) {
			if (is_docs) {
				window.location.href = docs_url;
			}
			if (is_guide) {
				window.location.href = guide_url;
			}
		}
	}

	$: browser && is_docs && goto(docs_url);
	$: browser && is_docs && goto(docs_url);
</script>

<svelte:head>
	<script
		type="module"
		src="https://gradio.s3-us-west-2.amazonaws.com/{value === 'main'
			? version
			: value}/gradio.js"
	></script>
</svelte:head>

<select
	bind:value
	on:change={reload}
	class="rounded-md border-gray-200 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0 text-xs mt-2 py-1 pl-2 pr-7 font-mono"
>
	{#each choices as choice}
		<option value={choice}>{choice}</option>
	{/each}
</select>
