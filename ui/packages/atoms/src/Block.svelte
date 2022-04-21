<script lang="ts">
	export let variant: "solid" | "dashed" = "solid";
	export let color: "grey" | "green" = "grey";
	export let padding: boolean = true;
	export let form_position: "first" | "last" | "mid" | "single";

	const styles = {
		dashed: "border-dashed border-[3px]",
		solid: "border-solid border",
		grey: "border-gray-200",
		green: "border-green-400"
	};
</script>

<div
	class="gr-box overflow-hidden {styles[variant]} {styles[color]}"
	class:gr-panel={padding}
	class:form={form_position}
	class:!rounded-none={form_position === "mid"}
	class:!rounded-b-none={form_position === "first"}
	class:!rounded-t-none={form_position === "last"}
	{form_position}
>
	<slot />
</div>
