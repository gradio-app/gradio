<script lang="ts">
	import Copy from "./Copy.svelte";
	import Download from "./Download.svelte";
	import { IconButtonWrapper } from "@gradio/atoms";

	export let value: string;
	export let language: string;
</script>

<IconButtonWrapper>
	<Download {value} {language} />
	<Copy {value} />
</IconButtonWrapper>
