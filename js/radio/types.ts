import type { LoadingStatus } from "@gradio/statustracker";
import type { SelectData } from "@gradio/utils";


export interface RadioProps {
    choices: [string, string | number][];
    value: string;
    info: string;
    rtl: boolean;
}

export interface RadioEvents {
    select: SelectData;
    change: any;
    input: any;
    clear_status: LoadingStatus;
}