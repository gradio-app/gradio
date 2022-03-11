<script lang="ts">
	import { HTML } from "@gradio/html";
	export let label: string;
	export let theme: string;
</script>

<HTML value={label} {theme} />
