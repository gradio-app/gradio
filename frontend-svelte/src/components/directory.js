import InputAudio from "./input/Audio/Component.svelte";
import InputAudioExample from "./input/Audio/Example.svelte";
import InputAudioConfig from "./input/Audio/config.js";
import InputCheckbox from "./input/Checkbox/Component.svelte";
import InputCheckboxExample from "./input/Checkbox/Example.svelte";
import InputCheckboxGroup from "./input/CheckboxGroup/Component.svelte";
import InputCheckboxGroupExample from "./input/CheckboxGroup/Example.svelte";
import InputDropdown from "./input/Dropdown/Component.svelte";
import InputDropdownExample from "./input/Dropdown/Example.svelte";
import InputFile from "./input/File/Component.svelte";
import InputFileExample from "./input/File/Example.svelte";
import InputFileConfig from "./input/File/config.js";
import InputImage from "./input/Image/Component.svelte";
import InputImageExample from "./input/Image/Example.svelte";
import InputImageConfig from "./input/Image/config.js";
import InputNumber from "./input/Number/Component.svelte";
import InputNumberExample from "./input/Number/Example.svelte";
import InputRadio from "./input/Radio/Component.svelte";
import InputRadioExample from "./input/Radio/Example.svelte";
import InputSlider from "./input/Slider/Component.svelte";
import InputSliderExample from "./input/Slider/Example.svelte";
import InputTextbox from "./input/Textbox/Component.svelte";
import InputTextboxExample from "./input/Textbox/Example.svelte";
import InputVideo from "./input/Video/Component.svelte";
import InputVideoExample from "./input/Video/Example.svelte";
import InputVideoConfig from "./input/Video/config.js";

import OutputAudio from "./output/Audio/Component.svelte";
import OutputCarousel from "./output/Carousel/Component.svelte";
import OutputDataframe from "./output/Dataframe/Component.svelte";
import OutputFile from "./output/File/Component.svelte";
import OutputHighlightedText from "./output/HighlightedText/Component.svelte";
import OutputHtml from "./output/Html/Component.svelte";
import OutputImage from "./output/Image/Component.svelte";
import OutputJson from "./output/Json/Component.svelte";
import OutputLabel from "./output/Label/Component.svelte";
import OutputTextbox from "./output/Textbox/Component.svelte";
import OutputVideo from "./output/Video/Component.svelte";

import Dummy from "./Dummy.svelte"

export const input_component_map = {
    "audio": { component: InputAudio, example: InputAudioExample, config: InputVideoConfig },
    "checkbox": { component: InputCheckbox, example: InputCheckboxExample },
    "checkboxgroup": { component: InputCheckboxGroup, example: InputCheckboxGroupExample },
    "dataframe": { component: Dummy, example: Dummy },
    "dropdown": { component: InputDropdown, example: InputDropdownExample },
    "file": { component: InputFile, example: InputFileExample, config: InputFileConfig },
    "image": { component: InputImage, example: InputImageExample, config: InputImageConfig },
    "number": { component: InputNumber, example: InputNumberExample },
    "radio": { component: InputRadio, example: InputRadioExample },
    "slider": { component: InputSlider, example: InputSliderExample },
    "textbox": { component: InputTextbox, example: InputTextboxExample },
    "timeseries": { component: Dummy, example: Dummy },
    "video": { component: InputVideo, example: InputVideoExample, config: InputVideoConfig },
}

export const output_component_map = {
    "audio": { component: OutputAudio, example: Dummy },
    "carousel": { component: OutputCarousel, example: Dummy },
    "dataframe": { component: OutputDataframe, example: Dummy },
    "file": { component: OutputFile, example: Dummy },
    "highlightedtext": { component: OutputHighlightedText, example: Dummy },
    "html": { component: OutputHtml, example: Dummy },
    "image": { component: OutputImage, example: Dummy },
    "json": { component: OutputJson, example: Dummy },
    "label": { component: OutputLabel, example: Dummy },
    "textbox": { component: OutputTextbox, example: Dummy },
    "timeseries": { component: Dummy, example: Dummy },
    "video": { component: OutputVideo, example: Dummy },
}
