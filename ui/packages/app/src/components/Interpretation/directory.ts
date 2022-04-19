import InterpretationNumber from "./InterpretationComponents/Number.svelte";
import InterpretationDropdown from "./InterpretationComponents/Dropdown.svelte";
import InterpretationCheckbox from "./InterpretationComponents/Checkbox.svelte";
import InterpretationCheckboxGroup from "./InterpretationComponents/CheckboxGroup.svelte";
import InterpretationSlider from "./InterpretationComponents/Slider.svelte";
import InterpretationRadio from "./InterpretationComponents/Radio.svelte";
import InterpretationImage from "./InterpretationComponents/Image.svelte";
import InterpretationAudio from "./InterpretationComponents/Audio.svelte";
import InterpretationTextbox from "./InterpretationComponents/Textbox.svelte";

export const component_map = {
	audio: InterpretationAudio,
	dropdown: InterpretationDropdown,
	checkbox: InterpretationCheckbox,
	checkboxgroup: InterpretationCheckboxGroup,
	number: InterpretationNumber,
	slider: InterpretationSlider,
	radio: InterpretationRadio,
	image: InterpretationImage,
	textbox: InterpretationTextbox
};
