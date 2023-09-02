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

function handle_option_selected(e: any, choices: [string, string][]): void {
    const option_index = e.detail.target.dataset.index;
    const option_name = choices[option_index][0];
    const option_value = choices[option_index][1];

    input_text = option_name;

    if (multiselect) {
        // TODO
        // if (value?.includes(option)) {
        // 	remove(option);
        // } else {
        // 	add(option_index);
        // }
        // input_text = "";
    } else {
        value = option_value;
        input_text = option_name;
        show_options = false;
        dispatch("select", {
            index: option_index,
            value: option_value,
            selected: true
        });
        filter_input.blur();
    }
}
