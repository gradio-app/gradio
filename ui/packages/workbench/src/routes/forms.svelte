<script lang="ts">
	import {
		Checkbox,
		CheckboxGroup,
		Dropdown,
		Radio,
		TextBox,
		Number,
		Range
	} from "@gradio/form";
	import { Panel } from "@gradio/atoms";
</script>

<Panel>
	<TextBox on:change={({ detail }) => console.log(detail)} label="TextBox" />

	<TextBox
		label="TextArea"
		lines={5}
		on:change={({ detail }) => console.log(detail)}
		placeholder="Type here..."
	/>

	<Number label="Number" on:change={({ detail }) => console.log(detail)} />

	<Radio label="Radio" choices={["true", "false"]} value={"true"} />

	<Checkbox label="Checkbox" value={false} />

	<CheckboxGroup label="CheckboxGroup" choices={["one", "two"]} value={[]} />

	<Dropdown label="Dropdown" choices={["one", "two", "three"]} />
	<Range label="Dropdown" choices={["one", "two", "three"]} />
</Panel>
