<script lang="ts">
	import { JSON } from "@gradio/json";

	export let value: any;
	export let theme: string;
</script>

<JSON {theme} {value} />
