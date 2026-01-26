<script lang="ts">
	import { onDestroy } from "svelte";
	import { Download, Check } from "@gradio/icons";
	import { DownloadLink } from "@gradio/atoms";
	import { IconButton } from "@gradio/atoms";

	interface Props {
		value: string;
		language: string;
	}

	let { value, language }: Props = $props();

	let ext = $derived(get_ext_for_type(language));

	function get_ext_for_type(type: string): string {
		const exts: Record<string, string> = {
			py: "py",
			python: "py",
			md: "md",
			markdown: "md",
			json: "json",
			html: "html",
			css: "css",
			js: "js",
			javascript: "js",
			ts: "ts",
			typescript: "ts",
			yaml: "yaml",
			yml: "yml",
			dockerfile: "dockerfile",
			sh: "sh",
			shell: "sh",
			r: "r",
			c: "c",
			cpp: "cpp",
			latex: "tex"
		};

		return exts[type] || "txt";
	}

	let copied = $state(false);
	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	let download_value = $derived(URL.createObjectURL(new Blob([value])));

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<DownloadLink
	download="file.{ext}"
	href={download_value}
	onclick={copy_feedback}
>
	<IconButton Icon={copied ? Check : Download} />
</DownloadLink>
