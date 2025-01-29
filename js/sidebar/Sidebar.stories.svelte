<script>
	import { Meta, Story } from "@storybook/addon-svelte-csf";
	import Sidebar from "./shared/Sidebar.svelte";
</script>

<Meta
	title="Components/Sidebar"
	component={Sidebar}
	argTypes={{
		isOpen: { control: "boolean" }
	}}
/>

<Story name="Open Sidebar">
	<Sidebar open={true} />
</Story>

<Story name="Closed Sidebar">
	<Sidebar open={false} />
</Story>
