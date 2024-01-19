<script lang="ts">
	import type { ComponentData } from "./utils";
	import CopyButton from "$lib/icons/CopyButton.svelte";
	import { BaseCode } from "@gradio/code";
	import { onMount } from "svelte";

	export let data: ComponentData;

	let source_code_link = `https://huggingface.co/spaces/${data.id}`;
	let author_link = `https://huggingface.co/${data.author}`;
	let discussion_link = `https://huggingface.co/spaces/${data.id}/discussions/new`;
	let code_url = `https://huggingface.co/spaces/${data.id}/raw/main/app.py`;
	const tabs = ["Demo", "Code"];
	let active_tab = 0;
	let code: string;

	onMount(async () => {
		code = await fetch(code_url).then((res) => res.text());
	});
</script>

<div class="card space-y-2 bg-gradient-to-tr {data.background_color} shadow-xl">
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
				href={author_link}
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
				href={source_code_link}
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
				href={discussion_link}
				target="_blank"
				class="link text-orange-400 font-bold"
			>
				Ask for help</a
			>
		</div>
	</div>
	<div class="flex flex-col relative h-full">
		<div class="tabs flex flex-row relative">
			{#each tabs as tab, index}
				<div
					class="tab bg-white {active_tab === index
						? 'active'
						: ''} {active_tab === index
						? ''
						: 'border-b-2'} px-8 py-1 rounded-t-md border-x-2 border-t-2 border-orange-300 content-center"
					on:click={() => {
						active_tab = index;
					}}
				>
					{tab}
				</div>
			{/each}
		</div>
		{#if active_tab === 0}
			<iframe
				src={`https://${data.subdomain}.hf.space?__theme=light`}
				height="100%"
				width="100%"
			></iframe>
		{:else}
			<div class="bg-white">
				<BaseCode value={code} language="python" dark_mode={false} />
			</div>
		{/if}
	</div>
</div>

<style>
	.card {
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

	.tabs {
		display: flex;
		margin-bottom: -1px;
	}

	.tab {
		cursor: pointer;
	}

	.active {
		font-weight: bold;
	}
</style>
