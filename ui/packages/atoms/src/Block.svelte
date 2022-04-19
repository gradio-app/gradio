<script lang="ts">
	export let variant: "solid" | "dashed" = "solid";
	export let color: "grey" | "green" = "grey";
	export let padding: boolean = true;

	const styles = {
		dashed: "border-dashed border-2",
		solid: "border-solid border",
		grey: "border-gray-200",
		green: "border-green-400"
	};
</script>

<div
	class="gr-box overflow-hidden {styles[variant]} {styles[color]}"
	class:gr-panel={padding}
>
	<slot />
</div>
