import ExampleNumber from "@gradio/number/example";
import ExampleDropdown from "@gradio/dropdown/example";
import ExampleCheckbox from "@gradio/checkbox/example";
import ExampleCheckboxGroup from "@gradio/checkboxgroup/example";
import ExampleSlider from "@gradio/slider/example";
import ExampleRadio from "@gradio/radio/example";
import ExampleImage from "@gradio/image/example";
import ExampleTextbox from "@gradio/textbox/example";
import ExampleAudio from "@gradio/audio/example";
import ExampleVideo from "@gradio/video/example";
import ExampleFile from "@gradio/file/example";
import ExampleDataframe from "@gradio/dataframe/example";
import ExampleModel3D from "@gradio/model3d/example";
import ExampleColorPicker from "@gradio/colorpicker/example";
import ExampleTimeSeries from "@gradio/timeseries/example";
import ExampleMarkdown from "@gradio/markdown/example";
import ExampleHTML from "@gradio/html/example";
import ExampleCode from "@gradio/code/example";
import ExampleFileExplorer from "@gradio/fileexplorer/example";

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
	code: ExampleCode,
	fileexplorer: ExampleFileExplorer
};
