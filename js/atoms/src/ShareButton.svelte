<script lang="ts">
	import IconButton from "./IconButton.svelte";
	import { Community } from "@gradio/icons";
	import type { ShareData } from "@gradio/utils";
	import { ShareError } from "@gradio/utils";
	import type { I18nFormatter } from "@gradio/utils";

	let {
		formatter,
		value,
		i18n,
		onshare,
		onerror
	}: {
		formatter: (arg0: any) => Promise<string>;
		value: any;
		i18n: I18nFormatter;
		onshare?: (data: ShareData) => void;
		onerror?: (message: string) => void;
	} = $props();

	let pending = $state(false);
</script>

<IconButton
	Icon={Community}
	label={i18n("common.share")}
	{pending}
	onclick={async () => {
		try {
			pending = true;
			const formatted = await formatter(value);
			const data = {
				description: formatted
			};
			onshare?.(data);
		} catch (e) {
			console.error(e);
			let message = e instanceof ShareError ? e.message : "Share failed.";
			onerror?.(message);
		} finally {
			pending = false;
		}
	}}
/>
