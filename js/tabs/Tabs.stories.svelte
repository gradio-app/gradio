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
