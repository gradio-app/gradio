<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import HTML from "../shared/HTML.svelte";

	export let value: string = "";
	export let elem_classes: string[] = [];
	export let html_template: string = "${value}";
	export let css_template: string = "";
	export let js_on_load: string | null = null;
	export let visible: boolean = true;
	export let autoscroll: boolean = false;
	export let apply_default_css: boolean = true;
	export let component_class_name: string = "HTML";

	export let show_label: boolean = false;
	export let show_share_button: boolean = false;
	export let i18n: any = undefined;
	export let gradio: any = undefined;

	const dispatch = createEventDispatcher<{ load: undefined }>();

	onMount(() => {
		dispatch("load");
	});

	$: htmlProps = { value };
</script>

<HTML
	props={htmlProps}
	{elem_classes}
	{html_template}
	{css_template}
	{js_on_load}
	{visible}
	{autoscroll}
	{apply_default_css}
	{component_class_name}
	on:event
	on:update_value
/>
