<script lang="ts">
	import { Button } from "@gradio/button";
	import { _ } from "svelte-i18n";
	export let style: Record<string, any> = {};

	export let elem_id: string = "";
	export let value: string;
	export let variant: "primary" | "secondary" = "primary";
</script>

<Button {variant} {elem_id} {style} on:click>
	{$_(value)}
</Button>
