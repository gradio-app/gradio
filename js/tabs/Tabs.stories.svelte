<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Tabs from "./Index.svelte";
	import TabItem from "../tabitem/Index.svelte";
</script>

<Meta title="Components/Tabs" component={Tabs} />

<Template let:args>
	<Tabs {...args}>
		<TabItem
			order={0}
			id="tab-1"
			label="Image Tab"
			gradio={undefined}
			visible
			interactive
			elem_classes={["editor-tabitem"]}
			scale={0}
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
			gradio={undefined}
			visible={false}
			interactive
			elem_classes={["editor-tabitem"]}
			scale={0}
		>
			Secret Tab
		</TabItem>
		<TabItem
			order={2}
			id="tab-3"
			label="Visible Tab"
			gradio={undefined}
			visible
			interactive
			elem_classes={["editor-tabitem"]}
			scale={0}
		>
			Visible Tab
		</TabItem>
	</Tabs>
</Template>

<Story name="Tabs" args={{}} />

<Story name="TabsLastInvisible" args={{}}>
	<Tabs selected="tab-1" gradio={undefined}>
		<TabItem
			order={0}
			id="tab-1"
			label="This is visible tab 1"
			gradio={undefined}
			visible
			interactive
			scale={0}
		></TabItem>
		<TabItem
			order={1}
			id="tab-2"
			label="This is visible tab 2"
			gradio={undefined}
			visible
			interactive
			scale={0}
		></TabItem>
		<TabItem
			order={2}
			id="tab-3"
			label="This is visible tab 3"
			gradio={undefined}
			visible
			interactive
			scale={0}
		></TabItem>
		<TabItem
			order={3}
			id="tab-4"
			label="This is invisible tab 4"
			gradio={undefined}
			visible={false}
			interactive
			scale={0}
		></TabItem>
		<TabItem
			order={4}
			id="tab-5"
			label="This is invisible tab 5"
			gradio={undefined}
			visible={false}
			interactive
			scale={0}
		></TabItem>
	</Tabs>
</Story>
