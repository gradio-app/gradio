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

	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	
	onMount(() => {
		const current_store = get(navbar_config);
		if (!current_store) {
			navbar_config.set({
				visible: visible,
				home_page_title: value?.home_page_title || "Home"
			});
		}
	});
</script>

<div style="display: none;" {elem_id} class={elem_classes.join(" ")}>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		variant="center"
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
</div>