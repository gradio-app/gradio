<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import { allModes } from "../storybook/modes";
	import Label from "./Index.svelte";

	export const meta = {
		title: "Components/Label",
		component: Label,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
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
					label: "Long space separated label text, ".repeat(10),
					confidence: 0.8
				}
			]
		}
	}}
/>

<Story
	name="Long and space-separated label text with hide_heading"
	args={{
		hide_heading: true,
		value: {
			label: "Label",
			confidences: [
				{ label: "First Label", confidence: 0.7 },
				{ label: "Second Label", confidence: 0.2 }
			]
		}
	}}
/>
