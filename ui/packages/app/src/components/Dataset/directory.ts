import ExampleNumber from "./ExampleComponents/Number.svelte";
import ExampleDropdown from "./ExampleComponents/Dropdown.svelte";
import ExampleCheckbox from "./ExampleComponents/Checkbox.svelte";
import ExampleCheckboxGroup from "./ExampleComponents/CheckboxGroup.svelte";
import ExampleSlider from "./ExampleComponents/Slider.svelte";
import ExampleRadio from "./ExampleComponents/Radio.svelte";
import ExampleImage from "./ExampleComponents/Image.svelte";
import ExampleTextbox from "./ExampleComponents/Textbox.svelte";
import ExampleAudio from "./ExampleComponents/Audio.svelte";
import ExampleVideo from "./ExampleComponents/Video.svelte";
import ExampleFile from "./ExampleComponents/File.svelte";
import ExampleDataframe from "./ExampleComponents/Dataframe.svelte";
import ExampleModel3D from "./ExampleComponents/Model3D.svelte";
import ExampleColorPicker from "./ExampleComponents/ColorPicker.svelte";
import ExampleTimeSeries from "./ExampleComponents/TimeSeries.svelte";
import ExampleMarkdown from "./ExampleComponents/Markdown.svelte";
import ExampleHTML from "./ExampleComponents/HTML.svelte";

export const component_map = {
	dropdown: ExampleDropdown,
	checkbox: ExampleCheckbox,
	checkboxgroup: ExampleCheckboxGroup,
	number: ExampleNumber,
	slider: ExampleSlider,
	radio: ExampleRadio,
	image: ExampleImage,
	textbox: ExampleTextbox,
	audio: ExampleAudio,
	video: ExampleVideo,
	file: ExampleFile,
	dataframe: ExampleDataframe,
	model3d: ExampleModel3D,
	colorpicker: ExampleColorPicker,
	timeseries: ExampleTimeSeries,
	markdown: ExampleMarkdown,
	html: ExampleHTML,
};
