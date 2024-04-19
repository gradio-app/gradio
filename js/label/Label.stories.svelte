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
