<script lang="ts">
    import { BaseExample as VideoExample } from "@gradio/video";
    export let type: "gallery" | "table";
	export let selected = false;
	export let value: string;
	export let samples_dir: string;
</script>
<VideoExample {value} {type} {selected} {samples_dir} />
