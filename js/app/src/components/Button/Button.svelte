<script lang="ts">
	import { Button } from "@gradio/button";
	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: string;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let mode: "static" | "dynamic" = "dynamic";
	export let size: "sm" | "lg" = "lg";
	export let scale: number = 1;
	export let min_width: number | undefined = undefined;
</script>

<Button
	{variant}
	{elem_id}
	{elem_classes}
	{size}
	{scale}
	{min_width}
	{visible}
	disabled={mode === "static"}
	on:click
>
	{$_(value)}
</Button>
