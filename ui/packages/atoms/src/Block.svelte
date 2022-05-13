<script lang="ts">
	import { create_classes } from "../../utils";

	import { getContext } from "svelte";
	import { BLOCK_KEY } from "./";

	export let style: Record<string, any> = {};
	export let elem_id: string = "";
	export let variant: "solid" | "dashed" | "none" = "solid";
	export let color: "grey" | "green" = "grey";
	export let padding: boolean = true;
	export let form_position: "first" | "last" | "mid" | "single" | undefined =
		undefined;
	export let type: "normal" | "fieldset" = "normal";
	export let test_id: string | undefined = undefined;

	const styles = {
		dashed: "border-dashed border border-gray-300",
		solid: "border-solid border",
		grey: "border-gray-200",
		green: "border-green-400",
		none: "!border-0"
	};

	const form_styles = {
		column: {
			first: "rounded-t-lg",
			last: "rounded-b-lg",
			mid: "",
			single: "rounded-lg"
		},
		row: {
			first: "rounded-t-lg md:rounded-t-none md:rounded-l-lg ",
			last: "rounded-b-lg md:rounded-b-none md:rounded-r-lg",
			mid: "",
			single: "rounded-lg"
		}
	};

	let tag = type === "fieldset" ? "fieldset" : "div";

	const parent = getContext<string | null>("BLOCK_KEY");

	$: form_class = form_position
		? form_styles?.[(parent as "column" | "row") || "column"][form_position]
		: "";

	$: console.log(parent);
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	id={elem_id}
	class={"w-full overflow-hidden " +
		styles[variant] +
		" " +
		styles[color] +
		" " +
		form_class +
		create_classes(style, "container")}
	class:gr-panel={padding}
	class:form={form_position}
	class:gr-box-unrounded={form_position}
	class:gr-box={!form_position}
>
	<slot />
</svelte:element>
