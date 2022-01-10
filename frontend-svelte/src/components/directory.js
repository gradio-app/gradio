import InputNumber from "./input/Number.svelte";
import InputRadio from "./input/Radio.svelte";
import InputAudio from "./input/Audio.svelte";
import InputFile from "./input/File.svelte";
import InputImage from "./input/Image.svelte";
import InputVideo from "./input/Video.svelte";
import InputDropdown from "./input/Dropdown.svelte";

import OutputTextbox from "./output/Textbox.svelte";
import OutputImage from "./output/Image.svelte";
import OutputVideo from "./output/Video.svelte";
import OutputAudio from "./output/Audio.svelte";
import OutputFile from "./output/File.svelte";
import OutputJson from "./output/Json.svelte";
import OutputHtml from "./output/Html.svelte";
import OutputDataframe from "./output/Dataframe.svelte";

import Dummy from "./Dummy.svelte"

export const inputComponentMap = {
    "audio": InputAudio,
    "checkbox": Dummy,
    "checkboxgroup": Dummy,
    "dataframe": Dummy,
    "dropdown": InputDropdown,
    "file": InputFile,
    "image": InputImage,
    "number": InputNumber,
    "radio": InputRadio,
    "slider": Dummy,
    "textbox": Dummy,
    "timeseries": Dummy,
    "video": InputVideo,
}

export const outputComponentMap = {
    "audio": OutputAudio,
    "carousel": Dummy,
    "dataframe": OutputDataframe,
    "file": OutputFile,
    "highlightedtext": Dummy,
    "html": OutputHtml,
    "image": OutputImage,
    "json": OutputJson,
    "label": Dummy,
    "textbox": OutputTextbox,
    "timeseries": Dummy,
    "video": OutputVideo,
}
