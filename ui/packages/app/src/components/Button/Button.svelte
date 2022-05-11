<script lang="ts">
	import { Button } from "@gradio/button";
	import { _ } from "svelte-i18n";

	export let value: string;
	export let style: Record<string, string> = {};
	export let variant: "primary" | "secondary" = "primary";
</script>

<Button {variant} style={style["main"]} on:click>
	{$_(value)}
</Button>
