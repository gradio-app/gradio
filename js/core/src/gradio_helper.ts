import { format } from "svelte-i18n";
import { get } from "svelte/store";
export { Gradio } from "@gradio/utils";

export const formatter = get(format);

export type I18nFormatter = typeof formatter;
