<script lang="ts">
	import { navbar_config } from "@gradio/core/navbar_store";
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let home_page_title = "Home";
	
	onMount(() => {
		const current_store = get(navbar_config);
		if (!current_store) {
			navbar_config.set({
				visible: visible,
				home_page_title: home_page_title
			});
		}
	});
</script>

<div style="display: none;" {elem_id} class={elem_classes.join(" ")}>
</div>