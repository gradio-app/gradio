<script lang="ts">
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import { Clear } from "@gradio/icons";

	let { onremove_image }: { onremove_image?: () => void } = $props();
</script>

<IconButtonWrapper>
	<IconButton
		Icon={Clear}
		label="Remove Image"
		onclick={(event) => {
			onremove_image?.();
			event.stopPropagation();
		}}
	/>
</IconButtonWrapper>
