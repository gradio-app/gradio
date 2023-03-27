<script lang="ts">
	import { Label } from "@gradio/label";

	const data = {
		label: "hello",
		confidences: [
			{ label: "Tiger", confidence: 0.9 },
			{ label: "Puma", confidence: 0.6 },
			{ label: "Leopard", confidence: 0.5 },
			{ label: "Lion", confidence: 0.2 },
			{ label: "Lynx", confidence: 0.1 }
		]
	};
</script>

<div class="space-y-6">
	<h2>Without confidence</h2>

	<Label value={{ label: "hello" }} />

	<h2>With confidence</h2>

	<Label value={data} />
</div>
