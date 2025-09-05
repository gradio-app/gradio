<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

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