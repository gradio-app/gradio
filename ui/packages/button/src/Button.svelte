<script lang="ts">
	export let variant: "primary" | "secondary" = "secondary";
	export let style: string | undefined = "";
	export let size: "sm" | "lg" = "lg";
</script>

<button
	on:click
	{style}
	class="gr-button gr-button-{size} gr-button-{variant} self-start flex-1"
>
	<slot />
</button>
