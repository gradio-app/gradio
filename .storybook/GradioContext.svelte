<script lang="ts">
	import { setContext } from "svelte";
	import type { Snippet } from "svelte";
	import { init, addMessages } from "svelte-i18n";
	import en from "../js/core/src/lang/en.json";

	const GRADIO_ROOT = "GRADIO_ROOT";

	let { children }: { children: Snippet } = $props();
	let i18nReady = $state(false);

	addMessages("en", en);
	init({
		fallbackLocale: "en",
		initialLocale: "en"
	});
	i18nReady = true;

	const mockRegister = (): void => {};

	const mockDispatcher = (_id: number, event: string, data: any): void => {
		const e = new CustomEvent("gradio", {
			bubbles: true,
			detail: { data, id: _id, event }
		});
		document.dispatchEvent(e);
	};

	setContext(GRADIO_ROOT, {
		register: mockRegister,
		dispatcher: mockDispatcher
	});
</script>

{#if i18nReady}
	{@render children()}
{/if}
