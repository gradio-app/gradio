<script lang="ts">
	import { BaseButton } from "@gradio/button";
	export let code: string;
	let copy_text = "copy";

	function copy(): void {
		navigator.clipboard.writeText(code);
		copy_text = "copied!";
		setTimeout(() => {
			copy_text = "copy";
		}, 1500);
	}
</script>

<BaseButton size="sm" on:click={copy}>
	{copy_text}
</BaseButton>
