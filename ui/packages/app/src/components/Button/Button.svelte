<script lang="ts">
	import { Button } from "@gradio/button";

	export let label: string;
	export let variant: "primary" | "secondary" = "primary";
</script>

<Button {variant} on:click>
	{label}
</Button>
