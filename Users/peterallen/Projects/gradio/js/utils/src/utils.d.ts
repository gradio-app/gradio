import type { ActionReturn } from "svelte/action";
import type { Client } from "@gradio/client";
import type { ComponentType, SvelteComponent } from "svelte";
export interface ValueData {
    value: any;
    is_value_data: boolean;
}
export interface SelectData {
    row_value?: any[];
    index: number | [number, number];
    value: any;
    selected?: boolean;
}
export interface LikeData {
    index: number | [number, number];
    value: any;
    liked?: boolean | string;
}
export interface KeyUpData {
    key: string;
    input_value: string;
}
export interface ShareData {
    description: string;
    title?: string;
}
export interface CopyData {
    value: string;
}
export declare class ShareError extends Error {
    constructor(message: string);
}
export declare function uploadToHuggingFace(data: string | {
    url?: string;
    path?: string;
}, type: "base64" | "url"): Promise<string>;
export declare function copy(node: HTMLDivElement): ActionReturn;
export declare const format_time: (seconds: number) => string;
interface Args {
    api_url: string;
    name: string;
    id?: string;
    variant: "component" | "example" | "base";
}
type component_loader = (args: Args) => {
    name: "string";
    component: {
        default: ComponentType<SvelteComponent>;
    };
};
export type I18nFormatter = any;
export declare class Gradio<T extends Record<string, any> = Record<string, any>> {
    #private;
    theme: string;
    version: string;
    i18n: I18nFormatter;
    root: string;
    autoscroll: boolean;
    max_file_size: number | null;
    client: Client;
    _load_component?: component_loader;
    load_component: (name: string, variant?: "base" | "component" | "example" | undefined) => {
        name: "string";
        component: {
            default: ComponentType<SvelteComponent>;
        };
    };
    constructor(id: number, el: HTMLElement, theme: string, version: string, root: string, autoscroll: boolean, max_file_size: number | null, i18n: I18nFormatter, client: Client, virtual_component_loader?: component_loader);
    dispatch<E extends keyof T>(event_name: E, data?: T[E]): void;
}
export declare const css_units: (dimension_value: string | number) => string;
export {};
