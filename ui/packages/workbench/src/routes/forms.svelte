<script lang="ts">
	import {
		Checkbox,
		CheckboxGroup,
		Dropdown,
		Radio,
		TextBox,
		Number
	} from "@gradio/form";
</script>

<h2>TextBox</h2>
<TextBox on:change={({ detail }) => console.log(detail)} />

<h2>TextArea</h2>
<TextBox lines={5} on:change={({ detail }) => console.log(detail)} />

<h2>Number</h2>
<Number on:change={({ detail }) => console.log(detail)} />

<h2>Radio</h2>
<Radio choices={["true", "false"]} value={"true"} />

<h2>CheckBox</h2>
<Checkbox value={false} />

<h2>Checkbox Group</h2>
<CheckboxGroup choices={["one", "two"]} value={[]} />

<h2>Dropdown</h2>
<Dropdown label={"choose"} choices={["one", "two", "three"]} />
