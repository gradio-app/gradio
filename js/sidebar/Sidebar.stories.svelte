<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Sidebar from "./shared/Sidebar.svelte";

	const { Story } = defineMeta({
		title: "Components/Sidebar",
		component: Sidebar,
		argTypes: {
			isOpen: { control: "boolean" }
		}
	});
</script>

{#snippet template(args)}
	<Sidebar {...args} />
{/snippet}

<Story name="Open Sidebar" args={{ open: true, width: 300 }} {template} />
<Story name="Closed Sidebar" args={{ open: false, width: 300 }} {template} />
