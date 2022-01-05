import InputNumber from "./input/Number.svelte";
import InputRadio from "./input/Radio.svelte";
import OutputTextbox from "./output/Textbox.svelte";

export const inputComponentMap = {
    "number": InputNumber,
    "radio": InputRadio,
}
export const outputComponentMap = {
    "textbox": OutputTextbox,
}
