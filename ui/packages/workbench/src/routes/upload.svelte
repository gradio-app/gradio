<script lang="ts">
	import { Upload } from "@gradio/upload";
	import { Block } from "@gradio/atoms";
</script>

<Block>
	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="image/*"
	>
		<div>
			<pre>filetype="image/*</pre>
			<br />
			drag or click
		</div>
	</Upload>
</Block>
<span />
<Block>
	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="file"
	>
		<div>
			<pre>filetype="file"</pre>
			<br />
			drag or click
		</div>
	</Upload>
</Block>
<span />
<Block>
	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="audio/*"
	>
		<div>
			<pre>filetype="audio/*"</pre>
			<br />
			drag or click
		</div>
	</Upload>
</Block>
<span />
<Block>
	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="text/csv"
	>
		<div>
			<pre>filetype="text/csv"</pre>
			<br />
			drag or click
		</div>
	</Upload>
</Block>
<span />
<Block>
	<Upload
		on:load={({ detail }) => console.log("change", detail)}
		filetype="video/x-m4v,video/*"
	>
		<div>
			<pre>video/x-m4v,video/*</pre>
			<br />
			drag or click
		</div>
	</Upload>
</Block>
<span />

<style>
	span {
		display: block;
		height: 1rem;
	}

	pre {
		font-size: 16px;
	}
</style>
