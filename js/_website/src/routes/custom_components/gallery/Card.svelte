<script lang="ts">
	import type { ComponentData } from "./utils";

	export let data: ComponentData;
	export let color: string;

	let sourceCodeLink = `https://huggingface.co/spaces/${data.id}`;
</script>

<div class="card bg-gradient-to-r {color}">
	<p class="text-xl font-black">{data.description}</p>
	<p><strong>Author:</strong> {data.author}</p>
	<p><strong>Template:</strong> {data.template}</p>
	<p><strong>Tags:</strong> {data.tags.split(",").join(", ")}</p>
	<p><strong>Version:</strong> {data.version}</p>
	<p>
		<strong>Install with:</strong>
		<code class="code">pip install {data.name}</code>
	</p>
	<p>
		<strong>Source </strong>
		<a href={sourceCodeLink} target="_blank" class="link">code</a>
	</p>
</div>

<style>
	.card {
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 16px;
		margin: 16px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.card p {
		margin: 8px 0;
		color: rgb(206 100 0 / var(--tw-text-opacity));
	}

	.link:hover {
		text-decoration: underline;
	}

	.code {
		font-family: monospace;
		background-color: #f8f9fa;
		padding: 0.2em 0.4em;
		border-radius: 4px;
		font-size: 0.9em;
	}
</style>
