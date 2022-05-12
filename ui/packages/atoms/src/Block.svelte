<script lang="ts">
	import { styleClasses } from "../../utils";

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
		dashed: "border-dashed border-[3px]",
		solid: "border-solid border",
		grey: "border-gray-200",
		green: "border-green-400",
		none: "!border-0"
	};

	const form_styles = {
		column: {
			first: "!rounded-b-none",
			last: "!rounded-t-none",
			mid: "!rounded-none",
			single: ""
		},
		row: {
			first: "!rounded-r-none",
			last: "!rounded-l-none",
			mid: "!rounded-none",
			single: ""
		}
	};

	let tag = type === "fieldset" ? "fieldset" : "div";

	const parent = getContext<string | null>(BLOCK_KEY);

	$: form_class = form_position
		? form_styles?.[(parent as "column" | "row") || "column"][form_position]
		: "";
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	id={elem_id}
	class={"gr-box overflow-hidden" +
		styles[variant] +
		" " +
		styles[color] +
		" " +
		form_class +
		styleClasses(style, "container")}
	class:gr-panel={padding}
	class:form={form_position}
	class:flex-1={parent === "row" || null}
>
	<slot />
</svelte:element>
