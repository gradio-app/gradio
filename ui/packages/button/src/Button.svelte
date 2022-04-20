<script lang="ts">
	export let variant: "primary" | "secondary" = "secondary";
	export let style: string = "";
	export let size: "sm" | "lg" = "lg";
</script>

<button on:click {style} class="gr-button gr-button-{size} gr-button-{variant}">
	<slot />
</button>
