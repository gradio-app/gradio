<script lang="ts">
	import { Button } from "@gradio/button";

	export let label: string;
	export let style: string | null;
	export let variant: "primary" | "secondary" = "primary";
</script>

<Button {variant} {style} on:click>
	{label}
</Button>
