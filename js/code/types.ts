export interface CodeProps {
    value: string;
    language: string;
    max_lines: number;
    wrap_lines: boolean;
    show_line_numbers: boolean;
    autocomplete: boolean;
    lines: number;
}

export interface CodeEvents {
    change: any;
    input: any; 
    focus: any;
    blur: any;
    clear_status: any;
}