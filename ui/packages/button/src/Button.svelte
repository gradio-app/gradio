<script lang="ts">
	export let variant: "primary" | "secondary" = "primary";
</script>

<button
	class="{variant} px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
>
	<slot />
</button>
