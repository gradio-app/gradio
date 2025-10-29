<script lang="ts">
	import type { SidebarProps, SidebarEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import Sidebar from "./shared/Sidebar.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { BaseColumn } from "@gradio/column";

	const props = $props();
	const gradio = new Gradio<SidebarEvents, SidebarProps>(props);
</script>

<StatusTracker
	autoscroll={gradio.shared.autoscroll}
	i18n={gradio.i18n}
	{...gradio.shared.loading_status}
/>

{#if gradio.shared.visible}
	<Sidebar
		bind:open={gradio.props.open}
		bind:position={gradio.props.position}
		width={gradio.props.width}
		on:expand={() => gradio.dispatch("expand")}
		on:collapse={() => gradio.dispatch("collapse")}
		elem_classes={gradio.shared.elem_classes}
		elem_id={gradio.shared.elem_id}
	>
		<BaseColumn>
			<slot />
		</BaseColumn>
	</Sidebar>
{/if}
