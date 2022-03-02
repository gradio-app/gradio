import InputAudio from "./input/Audio/config.js";
import InputCheckbox from "./input/Checkbox/config.js";
import InputCheckboxGroup from "./input/CheckboxGroup/config.js";
import InputDropdown from "./input/Dropdown/config.js";
import InputFile from "./input/File/config.js";
import InputImage from "./input/Image/config.js";
import InputNumber from "./input/Number/config.js";
import InputRadio from "./input/Radio/config.js";
import InputSlider from "./input/Slider/config.js";
import InputTextbox from "./input/Textbox/config.js";
import InputVideo from "./input/Video/config.js";
import InputDataFrame from "./input/DataFrame/config.js";
import InputTimeSeries from "./input/TimeSeries/config.js";

import OutputAudio from "./output/Audio/config.js";
import OutputCarousel from "./output/Carousel/config.js";
import OutputDataframe from "./output/Dataframe/config.js";
import OutputFile from "./output/File/config.js";
import OutputHighlightedText from "./output/HighlightedText/config.js";
import OutputHtml from "./output/Html/config.js";
import OutputImage from "./output/Image/config.js";
import OutputJson from "./output/Json/config.js";
import OutputLabel from "./output/Label/config.js";
import OutputTextbox from "./output/Textbox/config.js";
import OutputVideo from "./output/Video/config.js";
import OutputTimeSeries from "./output/TimeSeries/config.js";
import OutputChatbot from "./output/Chatbot/config.js";

import StaticButton from "./static/Button/config.js";
import StaticMarkdown from "./static/Markdown/config.js";

export const input_component_map = {
	audio: InputAudio,
	checkbox: InputCheckbox,
	checkboxgroup: InputCheckboxGroup,
	dataframe: InputDataFrame,
	dropdown: InputDropdown,
	file: InputFile,
	image: InputImage,
	number: InputNumber,
	radio: InputRadio,
	slider: InputSlider,
	textbox: InputTextbox,
	timeseries: InputTimeSeries,
	video: InputVideo
};

export const output_component_map = {
	audio: OutputAudio,
	carousel: OutputCarousel,
	dataframe: OutputDataframe,
	file: OutputFile,
	highlightedtext: OutputHighlightedText,
	html: OutputHtml,
	image: OutputImage,
	json: OutputJson,
	label: OutputLabel,
	textbox: OutputTextbox,
	timeseries: OutputTimeSeries,
	video: OutputVideo,
	chatbot: OutputChatbot
};

export const static_component_map = {
	button: StaticButton,
	markdown: StaticMarkdown
};

export const all_components_map = {
	input: input_component_map,
	output: output_component_map,
	static: static_component_map
};
