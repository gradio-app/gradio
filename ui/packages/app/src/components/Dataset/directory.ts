import ExampleNumber from "./ExampleComponents/Number.svelte"
import ExampleDropdown from "./ExampleComponents/Dropdown.svelte"
import ExampleCheckbox from "./ExampleComponents/Checkbox.svelte"
import ExampleCheckboxGroup from "./ExampleComponents/CheckboxGroup.svelte"
import ExampleSlider from "./ExampleComponents/Slider.svelte"
import ExampleRadio from "./ExampleComponents/Radio.svelte"
import ExampleImage from "./ExampleComponents/Image.svelte"

export const component_map = {
	dropdown: ExampleDropdown,
	checkbox: ExampleCheckbox,
	checkboxgroup: ExampleCheckboxGroup,
	number: ExampleNumber,
	slider: ExampleSlider,
	radio: ExampleRadio,
	image: ExampleImage,
};
