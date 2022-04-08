<script lang="ts">
	import { Button } from "@gradio/button";
	import { _ } from "svelte-i18n";

	export let value: string;
	export let default_value: string;
	export let style: string = "";
	export let variant: "primary" | "secondary" = "primary";

	if (default_value) value = default_value;
</script>

<Button {variant} {style} on:click>
	{$_(value)}
</Button>
