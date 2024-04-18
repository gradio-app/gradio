<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Label from "./Index.svelte";

	export const meta = {
		title: "Components/Label",
		component: Label
	};
</script>

<Template let:args>
	<Label {...args} />
</Template>

<Story
	name="Long and space-separated label text"
	args={{
		value: {
			label: "Label",
			confidences: [
				{
					label:
						"Long space separated label text, long space separated label text, long space separated label text",
					confidence: 0.8
				}
			]
		}
	}}
/>
