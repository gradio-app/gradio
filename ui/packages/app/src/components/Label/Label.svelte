<script lang="ts">
	import { Label } from "@gradio/label";

	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};
	export let theme: string;
</script>

<Label {theme} {value} />
