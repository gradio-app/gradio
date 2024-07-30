<script lang="ts">
	export let name: string;
	export let code: string;
	export let highlighted_code: string;
	export let url_version: string;
	$: url_version;
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css"
	/>
</svelte:head>

<div class="py-2 max-h-[750px] overflow-y-scroll">
	{#key name}
		<button
			class="open-btn bg-gray-200 text-gray-500 font-bold px-2 rounded mx-4 my-2"
			on:click={() => {
				let code_b64 = btoa(code);
				window.open("/playground?demo=Blank&code=" + code_b64, "_blank");
			}}
		>
			Open in 🎢 ↗
		</button>

		<gradio-lite playground shared-worker layout="vertical" class="p-2">
			{code}
		</gradio-lite>
	{/key}
</div>

<style>
	.open-btn {
		position: absolute;
		top: 3%;
		right: 0;
		background: #eaecef;
		color: #374151;
		font-weight: 500;
	}
</style>
