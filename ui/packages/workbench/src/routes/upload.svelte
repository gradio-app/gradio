<script lang="ts">
	import { Upload } from "@gradio/upload";
</script>

<Upload on:load={({ detail }) => console.log("change", detail)}
	>drag or click</Upload
>
