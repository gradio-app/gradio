<script lang="ts">
	import ParamViewer from "./ParamViewer.svelte";

	export let value: Record<
		string,
		{
			type: string;
			description: string;
			default: string;
		}
	>;

	export let linkify: string[] = [];
	export let header: string | null = null;
</script>

<ParamViewer docs={value} {linkify} {header} />
