<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import ColorPicker from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Color Picker",
		component: ColorPicker,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		},
		argTypes: {
			label: {
				control: "text",
				description: "The color picker label"
			},
			value: {
				control: "color",
				description: "The selected color value"
			},
			interactive: {
				control: "boolean",
				description: "Whether the picker is interactive"
			},
			show_label: {
				control: "boolean",
				description: "Whether to show the label"
			}
		}
	});
</script>

{#snippet template(args)}
	<ColorPicker {...wrapProps(args)} />
{/snippet}

<Story name="Default" args={{ interactive: true, label: "Color Picker" }} {template} />
<Story name="Color Picker with a color value and hidden label" args={{ value: "#FFC0CB", show_label: false, interactive: true, label: "Color Picker" }} {template} />
<Story name="Color Picker with a color value and label" args={{ value: "#FFC0CB", label: "This is a neat color", interactive: true }} {template} />
<Story name="Disabled color picker" args={{ value: "#FFC0CB", interactive: false, label: "Color Picker" }} {template} />
<Story name="Color Picker with a color value and info" args={{ value: "#FFC0CB", info: "This is a neat color", interactive: true, label: "Color Picker" }} {template} />
