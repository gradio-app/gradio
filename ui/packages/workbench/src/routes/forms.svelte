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
	<Range label="Dropdown" />

	<TextBox
		on:change={({ detail }) => console.log(detail)}
		label="Static TextBox"
		disabled
		value="Some text"
	/>

	<TextBox
		label="Static TextArea"
		lines={5}
		on:change={({ detail }) => console.log(detail)}
		placeholder="Type here..."
		disabled
		value={`Some longer text.
Some more.

And more.`}
	/>

	<Number
		label="Number"
		on:change={({ detail }) => console.log(detail)}
		disabled
		value={10}
	/>

	<Radio label="Radio" choices={["true", "false"]} value={"true"} disabled />

	<Checkbox label="Checkbox" value={false} disabled />

	<CheckboxGroup
		label="CheckboxGroup"
		choices={["one", "two"]}
		value={["one"]}
		disabled
	/>

	<Dropdown
		label="Dropdown"
		choices={["one", "two", "three"]}
		value="three"
		disabled
	/>

	<Range label="Dropdown" value={27} disabled />
</Panel>
