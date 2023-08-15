<script lang="ts">
	import { page } from "$app/stores";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { version } from "$lib/json/version.json";
	import path from "path";

	export let choices = [version, "main"];
	export let value: string = $page.params?.version || version;

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

	$: browser && is_docs && goto(docs_url);
	$: browser && is_guide && goto(guide_url);
</script>

<select
	bind:value
	class="rounded-md border-gray-200 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0 text-xs mt-2 py-1 pl-2 pr-7 font-mono"
>
	{#each choices as choice}
		<option value={choice}>{choice}</option>
	{/each}
</select>
