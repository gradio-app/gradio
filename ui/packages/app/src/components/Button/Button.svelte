<script lang="ts">
	import { Button } from "@gradio/button";
	import { _ } from "svelte-i18n";

	export let value: string;
	export let style: string = "";
	export let variant: "primary" | "secondary" = "secondary";
</script>

<Button {variant} {style} on:click>
	{$_(value)}
</Button>
