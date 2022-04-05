<script lang="ts">
	import { Upload } from "@gradio/upload";
	import { Panel } from "@gradio/atoms";
</script>

<Panel>
	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="image/x-png,image/gif,image/jpeg">drag or click</Upload
	>

	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="file">drag or click</Upload
	>

	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="audio/*">drag or click</Upload
	>

	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="text/csv">drag or click</Upload
	>

	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="video/mp4,video/x-m4v,video/*">drag or click</Upload
	>
</Panel>
