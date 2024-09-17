<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import { Clear } from "@gradio/icons";

	const dispatch = createEventDispatcher();
</script>

<IconButtonWrapper>
	<IconButton
		Icon={Clear}
		label="Remove Image"
		on:click={(event) => {
			dispatch("remove_image");
			event.stopPropagation();
		}}
	/>
</IconButtonWrapper>
