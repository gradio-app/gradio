<script lang="ts">
	import { BaseExample as AudioExample } from "@gradio/audio";
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<AudioExample {value} {type} {selected} />
