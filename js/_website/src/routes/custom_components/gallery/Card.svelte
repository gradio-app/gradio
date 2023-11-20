<script lang="ts">
	import type { ComponentData } from "./utils";
	import CopyButton from "./CopyButton.svelte";

	export let data: ComponentData;

	let sourceCodeLink = `https://huggingface.co/spaces/${data.id}`;
	let authorLink = `https://huggingface.co/${data.author}`;
	let discussionLink = `https://huggingface.co/spaces/${data.id}/discussions/new`;
</script>

<div class="card space-y-2 bg-gradient-to-r {data.background_color}">
	<h1 class="text-xl font-black">{data.description}</h1>
	<div class="flex flex-row">
		<div class="ml-2">
			<code class="code text-md">
				pip install {data.name.replace("_", "-")}
				<CopyButton content={`pip install ${data.name.replace("_", "-")}`} />
			</code>
		</div>
		<div class="ml-2">
			<strong>🖋️ Author</strong>
			<a
				href={authorLink}
				target="_blank"
				class="link text-orange-400 font-bold">{data.author}</a
			>
		</div>
		<div class="ml-2">
			<strong>📑 Template</strong>
			{data.template}
		</div>
		<div class="ml-2">
			<strong>🔢 Version:</strong>
			{data.version}
		</div>
		<div class="ml-2">
			<strong>🧬</strong>
			<a
				href={sourceCodeLink}
				target="_blank"
				class="link text-orange-400 font-bold">code</a
			>
		</div>
	</div>
	<div class="flex flex-row">
		<div class="ml-2">
			<strong>🔖 Tags:</strong>
			{data.tags.split(",").join(", ")}
		</div>
	</div>
	<div class="flex flex-row">
		<div class="ml-2">
			<strong>🤝 Feedback? Stuck?</strong>
			<a
				href={discussionLink}
				target="_blank"
				class="link text-orange-400 font-bold"
			>
				Ask for help</a
			>
		</div>
	</div>
	<iframe
		src={`https://${data.subdomain}.hf.space?__theme=light`}
		height="100%"
		width="100%"
	></iframe>
</div>

<style>
	.card {
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 16px;
		margin: 16px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		height: 100%;
	}

	.card p {
		margin: 8px 0;
		color: rgb(206 100 0 / var(--tw-text-opacity));
	}

	.link {
		text-decoration: underline;
	}
	.code {
		font-family: monospace;
		background-color: #f8f9fa;
		padding: 0.2em 0.4em;
		border-radius: 4px;
	}
</style>
