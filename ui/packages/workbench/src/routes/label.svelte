<script lang="ts">
	import { Label } from "@gradio/label";

	const data = {
		label: "hello",
		confidences: [
			{ label: "hello", confidence: 0.8 },
			{ label: "helooo", confidence: 0.4 },
			{ label: "helloooo", confidence: 0.6 }
		]
	};
</script>

<h2>Without confidence</h2>

<Label value={{ label: "hello" }} />

<h2>With confidence</h2>

<Label value={data} />
