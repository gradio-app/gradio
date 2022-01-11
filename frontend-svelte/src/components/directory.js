import InputTextbox from "./input/Textbox.svelte";
import InputNumber from "./input/Number.svelte";
import InputRadio from "./input/Radio.svelte";
import InputSlider from "./input/Slider.svelte";
import InputCheckbox from "./input/Checkbox.svelte";
import InputCheckboxGroup from "./input/CheckboxGroup.svelte";
import InputAudio from "./input/Audio.svelte";
import InputFile from "./input/File.svelte";
import InputImage from "./input/Image.svelte";
import InputVideo from "./input/Video.svelte";
import InputDropdown from "./input/Dropdown.svelte";

import OutputTextbox from "./output/Textbox.svelte";
import OutputCarousel from "./output/Carousel.svelte";
import OutputImage from "./output/Image.svelte";
import OutputVideo from "./output/Video.svelte";
import OutputAudio from "./output/Audio.svelte";
import OutputLabel from "./output/Label.svelte";
import OutputHighlightedText from "./output/HighlightedText.svelte";
import OutputFile from "./output/File.svelte";
import OutputJson from "./output/Json.svelte";
import OutputHtml from "./output/Html.svelte";
import OutputDataframe from "./output/Dataframe.svelte";

import Dummy from "./Dummy.svelte"

export const inputComponentMap = {
    "audio": InputAudio,
    "checkbox": InputCheckbox,
    "checkboxgroup": InputCheckboxGroup,
    "dataframe": Dummy,
    "dropdown": InputDropdown,
    "file": InputFile,
    "image": InputImage,
    "number": InputNumber,
    "radio": InputRadio,
    "slider": InputSlider,
    "textbox": InputTextbox,
    "timeseries": Dummy,
    "video": InputVideo,
}

export const outputComponentMap = {
    "audio": OutputAudio,
    "carousel": OutputCarousel,
    "dataframe": OutputDataframe,
    "file": OutputFile,
    "highlightedtext": OutputHighlightedText,
    "html": OutputHtml,
    "image": OutputImage,
    "json": OutputJson,
    "label": OutputLabel,
    "textbox": OutputTextbox,
    "timeseries": Dummy,
    "video": OutputVideo,
}
