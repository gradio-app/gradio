<script lang="ts">
	export let name: string;
	export let code: string;
</script>

<svelte:head>
	<link rel="stylesheet" href="http://localhost:8000/dist/lite.css" />

	<link rel="stylesheet" href="https://gradio-hello-world.hf.space/theme.css" />
</svelte:head>

<div class="py-2 max-h-[750px] overflow-y-scroll">
	{#key name}
		<div class="flex flex-row">
			<div class="flex-grow"></div>
			<button
				class="bg-gray-200 text-gray-500 font-bold px-2 rounded mx-4 my-2"
				style="
	background: #eaecef;
	color: #374151;
	font-weight: 500;

	"
				on:click={() => {
					let code_b64 = btoa(code);
					window.open("/playground?demo=Blank&code=" + code_b64, "_blank");
				}}
			>
				Open in 🎢 Playground ↗
			</button>
		</div>

		<gradio-lite playground>
			{code}
		</gradio-lite>
	{/key}
</div>