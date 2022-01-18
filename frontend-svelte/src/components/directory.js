import InputTextbox from "./input/Textbox/Component.svelte";
import InputNumber from "./input/Number/Component.svelte";
import InputRadio from "./input/Radio/Component.svelte";
import InputSlider from "./input/Slider/Component.svelte";
import InputCheckbox from "./input/Checkbox/Component.svelte";
import InputCheckboxGroup from "./input/CheckboxGroup/Component.svelte";
import InputAudio from "./input/Audio/Component.svelte";
import InputFile from "./input/File/Component.svelte";
import InputImage from "./input/Image/Component.svelte";
import InputVideo from "./input/Video/Component.svelte";
import InputDropdown from "./input/Dropdown/Component.svelte";
import InputTextboxExample from "./input/Textbox/Example.svelte";

import OutputTextbox from "./output/Textbox/Component.svelte";
import OutputCarousel from "./output/Carousel/Component.svelte";
import OutputImage from "./output/Image/Component.svelte";
import OutputVideo from "./output/Video/Component.svelte";
import OutputAudio from "./output/Audio/Component.svelte";
import OutputLabel from "./output/Label/Component.svelte";
import OutputHighlightedText from "./output/HighlightedText/Component.svelte";
import OutputFile from "./output/File/Component.svelte";
import OutputJson from "./output/Json/Component.svelte";
import OutputHtml from "./output/Html/Component.svelte";
import OutputDataframe from "./output/Dataframe/Component.svelte";

import Dummy from "./Dummy.svelte"

export const inputComponentMap = {
    "audio": { component: InputAudio, example: Dummy },
    "checkbox": { component: InputCheckbox, example: Dummy },
    "checkboxgroup": { component: InputCheckboxGroup, example: Dummy },
    "dataframe": { component: Dummy, example: Dummy },
    "dropdown": { component: InputDropdown, example: Dummy },
    "file": { component: InputFile, example: Dummy },
    "image": { component: InputImage, example: Dummy },
    "number": { component: InputNumber, example: Dummy },
    "radio": { component: InputRadio, example: Dummy },
    "slider": { component: InputSlider, example: Dummy },
    "textbox": { component: InputTextbox, example: InputTextboxExample },
    "timeseries": { component: Dummy, example: Dummy },
    "video": { component: InputVideo, example: Dummy },
}

export const outputComponentMap = {
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
