import {createEventDispatcher} from "svelte";
import type { SelectData } from "@gradio/utils";

const dispatch = createEventDispatcher<{
    change: string | string[] | undefined;
    input: undefined;
    select: SelectData;
    blur: undefined;
    focus: undefined;
}>();


export function handle_filter(choices: [string, string][], input_text: string): number[] {
    let filtered_indices: number[] = [];
    choices.forEach((o, index) => {
        if (input_text ? o[0].toLowerCase().includes(input_text.toLowerCase()) : true) {
            filtered_indices.push(index);
        }
    });
    return filtered_indices;
}

export function handle_change(value: string | string[] | undefined, value_is_output: boolean): void {
    dispatch("change", value);
    if (!value_is_output) {
        dispatch("input");
    }
}

export function dispatch_blur(): void {
    dispatch("blur");
}

export function dispatch_select(option_index: number, option_value: string): void {
    dispatch("select", {
        index: option_index,
        value: option_value,
        selected: true
    });
}

export function handle_key_down(): void {
    // TODO: implement
}

export function handle_focus(): void {
    // TODO: implement
}