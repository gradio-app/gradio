<script lang="ts">
	import type { Styles } from "@gradio/utils";
	import { Button } from "@gradio/button";
	import { _ } from "svelte-i18n";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string;
	export let variant: "primary" | "secondary" = "primary";
</script>

<Button {variant} {elem_id} {style} {visible} on:click>
	{$_(value)}
</Button>
