<!-- Configuration-only component that stores navbar props in a global store. The actual navbar UI is in Embed.svelte -->
<script lang="ts">
	import { navbar_config } from "@gradio/core/navbar_store";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let main_page_name: string | false = "Home";
	export let value: [string, string][] | null = null;

	$: navbar_props = { visible, main_page_name, value };

	onMount(() => {
		const current_store = get(navbar_config);
		if (!current_store) {
			navbar_config.set(navbar_props);
		}
	});

	$: {
		navbar_config.set(navbar_props);
	}
</script>

<div style="display: none;" id={elem_id} class={elem_classes.join(" ")}></div>
