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
	<Sidebar open={true} width={300} />
</Story>

<Story name="Closed Sidebar">
	<Sidebar open={false} width={300} />
</Story>
