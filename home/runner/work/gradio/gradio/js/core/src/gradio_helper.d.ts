export { Gradio } from "@gradio/utils";
export type I18nFormatter = typeof formatter;
/**
 * i18n formatter with fallback to svelte-i18n's format function.
 *
 * @param value - The string to translate or format
 * @returns The translated string
 *
 * This formatter attempts translation in the following order:
 * 1. Direct translation of the input string
 * 2. Checks if input matches any common key names
 * 3. Falls back to svelte-i18n's format function
 */
export declare function formatter(value: string | null | undefined): string;
