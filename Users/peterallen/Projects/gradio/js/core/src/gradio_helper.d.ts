export { Gradio } from "@gradio/utils";
export type I18nFormatter = typeof formatter;
export declare function formatter(value: string | null | undefined): string;
export declare const reactive_formatter: import("svelte/store").Readable<typeof formatter>;
