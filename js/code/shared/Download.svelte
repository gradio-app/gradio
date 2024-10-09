<script lang="ts">
	import { onDestroy } from "svelte";
	import { Download, Check } from "@gradio/icons";
	import { DownloadLink } from "@gradio/wasm/svelte";
	import { IconButton } from "@gradio/atoms";

	export let value: string;
	export let language: string;

	$: ext = get_ext_for_type(language);

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
			cpp: "cpp"
		};

		return exts[type] || "txt";
	}

	let copied = false;
	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	$: download_value = URL.createObjectURL(new Blob([value]));

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<DownloadLink
	download="file.{ext}"
	href={download_value}
	on:click={copy_feedback}
>
	<IconButton Icon={copied ? Check : Download} />
</DownloadLink>
