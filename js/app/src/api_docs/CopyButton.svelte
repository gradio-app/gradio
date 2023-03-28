<script lang="ts">
	import { Button } from "@gradio/button";
	export let code: string;
	let copy_text = "copy";

	function copy() {
		navigator.clipboard.writeText(code);
		copy_text = "copied!";
		setTimeout(() => {
			copy_text = "copy";
		}, 1500);
	}
</script>

<Button size="sm" on:click={copy}>
	{copy_text}
</Button>
