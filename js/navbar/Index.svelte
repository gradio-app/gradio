<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { navbar_config } from "@gradio/core/navbar_store";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: {visible: boolean, home_page_title: string} = {
		visible: true,
		home_page_title: "Home"
	};
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: never;
		clear_status: LoadingStatus;
	}>;

	// Initialize store only once, then let network updates in Blocks.svelte handle it
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	
	onMount(() => {
		// Only initialize if store is empty/null
		const current_store = get(navbar_config);
		if (!current_store) {
			const navbar_data = {
				visible: visible,
				home_page_title: value?.home_page_title || "Home"
			};
			console.log("Navbar component initializing store:", navbar_data);
			navbar_config.set(navbar_data);
		} else {
			console.log("Navbar component found existing store, not overriding:", current_store);
		}
	});
</script>

<!-- 
	Navbar component is a configuration component that doesn't render any UI directly.
	It exists only to provide navbar configuration to the Blocks frontend.
	The actual navbar rendering is handled by the core Blocks component.
-->
<div style="display: none;" {elem_id} class={elem_classes.join(" ")}>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		variant="center"
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
</div>