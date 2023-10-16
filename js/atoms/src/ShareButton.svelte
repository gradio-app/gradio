<script lang="ts">
	import IconButton from "./IconButton.svelte";
	import { Community } from "@gradio/icons";
	import { createEventDispatcher } from "svelte";
	import type { ShareData } from "@gradio/utils";
	import { ShareError } from "@gradio/utils";
	import type { I18nFormatter } from "@gradio/utils";

	const dispatch = createEventDispatcher<{
		share: ShareData;
		error: string;
	}>();

	export let formatter: (arg0: any) => Promise<string>;
	export let value: any;
	export let i18n: I18nFormatter;
	let pending = false;
</script>

<IconButton
	Icon={Community}
	label={i18n("common.share")}
	{pending}
	on:click={async () => {
		try {
			pending = true;
			const formatted = await formatter(value);
			dispatch("share", {
				description: formatted
			});
		} catch (e) {
			console.error(e);
			let message = e instanceof ShareError ? e.message : "Share failed.";
			dispatch("error", message);
		} finally {
			pending = false;
		}
	}}
/>
