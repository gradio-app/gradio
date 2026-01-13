<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Accordion from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Layout Elements/Accordion",
		component: Accordion,
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
				description: "The accordion label"
			},
			open: {
				control: "boolean",
				description: "Whether the accordion is open"
			}
		}
	});
</script>

<Story name="Accordion Layout" args={{ label: "Open Me!", open: false }}>
	{#snippet template(args)}
		<Accordion {...wrapProps(args)}>
			<Button elem_id="btn" size="lg">test</Button>
		</Accordion>
	{/snippet}
</Story>

<Story name="Accordion Open" args={{ label: "Already Open", open: true }}>
	{#snippet template(args)}
		<Accordion {...wrapProps(args)}>
			<Button elem_id="btn" size="lg">test</Button>
			<Button elem_id="btn2" size="lg">another button</Button>
		</Accordion>
	{/snippet}
</Story>
