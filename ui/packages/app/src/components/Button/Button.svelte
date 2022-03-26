<script lang="ts">
	import { Button } from "@gradio/button";

	export let default_value: string;
	export let style: string = "";
	export let variant: "primary" | "secondary" = "primary";
</script>

<Button {variant} {style} on:click>
	{default_value}
</Button>
