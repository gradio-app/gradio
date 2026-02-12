<script lang="ts">
	import { theme } from "$lib/stores/theme";
	import "$lib/assets/theme.css";

	export let name: string;
	export let code: string;
	export let highlighted_code: string;
	export let url_version: string;

	$: url_version;
</script>

<div class="">
	{#key name}
		<div class:dark={$theme === "dark"}>
			{#if url_version === "main"}
				<gradio-app space={"gradio/" + name + "_main"} theme_mode={$theme} />
			{:else}
				<gradio-app space={"gradio/" + name} theme_mode={$theme} />
			{/if}
		</div>
	{/key}
</div>

<style>
	.open-btn {
		position: absolute;
		top: 3%;
		right: 0;
		font-weight: 500;
	}
	:global(.child-container) {
		flex-direction: column !important;
	}
	:global(.code-editor) {
		border-bottom: 1px solid rgb(229 231 235);
		height: 300px;
		overflow-y: scroll;
		flex: none !important;
	}
	:global(.dark .code-editor) {
		border-bottom: 1px solid rgb(64 64 64);
	}
</style>
