<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Tabs from "./shared/Tabs.svelte";
	import TabItem from "../tabitem/shared/TabItem.svelte";
</script>

<Meta title="Components/Tabs" component={Tabs} />

<Template let:args>
	<Tabs
		initial_tabs={[
			{
				label: "Image Tab",
				id: "tab-1",
				elem_id: undefined,
				visible: true,
				interactive: true,
				scale: null
			},
			{
				label: "Hidden Tab",
				id: "tab-2",
				elem_id: undefined,
				visible: false,
				interactive: true,
				scale: null
			},
			{
				label: "Visible Tab",
				id: "tab-3",
				elem_id: undefined,
				visible: true,
				interactive: true,
				scale: null
			}
		]}
		selected="tab-1"
		{...args}
	>
		<TabItem
			order={0}
			id="tab-1"
			label="Image Tab"
			visible={true}
			interactive={true}
			elem_classes={["editor-tabitem"]}
		>
			<img
				style="width: 200px;"
				alt="Cheetah"
				src="https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg"
			/>
		</TabItem>
		<TabItem
			order={1}
			id="tab-2"
			label="Hidden Tab"
			visible={false}
			interactive={true}
			elem_classes={["editor-tabitem"]}
		>
			Secret Tab
		</TabItem>
		<TabItem
			order={2}
			id="tab-3"
			label="Visible Tab"
			visible={true}
			interactive={true}
			elem_classes={["editor-tabitem"]}
		>
			Visible Tab
		</TabItem>
	</Tabs>
</Template>

<Story name="Tabs" args={{}} />

<Story name="TabsLastInvisible" args={{}}>
	<Tabs
		initial_tabs={[
			{
				label: "This is visible tab 1",
				id: "tab-1",
				elem_id: undefined,
				visible: true,
				interactive: true,
				scale: null
			},
			{
				label: "This is visible tab 2",
				id: "tab-2",
				elem_id: undefined,
				visible: true,
				interactive: true,
				scale: null
			},
			{
				label: "This is visible tab 3",
				id: "tab-3",
				elem_id: undefined,
				visible: true,
				interactive: true,
				scale: null
			},
			{
				label: "This is invisible tab 4",
				id: "tab-4",
				elem_id: undefined,
				visible: false,
				interactive: true,
				scale: null
			},
			{
				label: "This is invisible tab 5",
				id: "tab-5",
				elem_id: undefined,
				visible: false,
				interactive: true,
				scale: null
			}
		]}
		selected="tab-1"
	>
		<TabItem
			order={0}
			id="tab-1"
			label="This is visible tab 1"
			visible={true}
			interactive={true}
		/>
		<TabItem
			order={1}
			id="tab-2"
			label="This is visible tab 2"
			visible={true}
			interactive={true}
		/>
		<TabItem
			order={2}
			id="tab-3"
			label="This is visible tab 3"
			visible={true}
			interactive={true}
		/>
		<TabItem
			order={3}
			id="tab-4"
			label="This is invisible tab 4"
			visible={false}
			interactive={true}
		/>
		<TabItem
			order={4}
			id="tab-5"
			label="This is invisible tab 5"
			visible={false}
			interactive={true}
		/>
	</Tabs>
</Story>
