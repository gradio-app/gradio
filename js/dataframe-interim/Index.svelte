<svelte:options accessors={true} />

<script context="module" lang="ts">
</script>

<script lang="ts">
	import DF from "@gradio/dataframe-npm";
</script>

<DF {...$$props} />
