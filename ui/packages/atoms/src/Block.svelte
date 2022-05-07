<script lang="ts">
	import { getContext } from "svelte";
	import { BLOCK_KEY } from "./";

	export let variant: "solid" | "dashed" = "solid";
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
		green: "border-green-400"
	};

	let tag = type === "fieldset" ? "fieldset" : "div";

	const parent = getContext<string | null>(BLOCK_KEY);

	console.log(parent);
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	class="gr-box overflow-hidden {styles[variant]} {styles[color]}"
	class:gr-panel={padding}
	class:form={form_position}
	class:!rounded-none={form_position === "mid"}
	class:!rounded-b-none={form_position === "first"}
	class:!rounded-t-none={form_position === "last"}
	class:flex-1={parent === "row" || null}
>
	<slot />
</svelte:element>
