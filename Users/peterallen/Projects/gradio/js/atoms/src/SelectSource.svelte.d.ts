type source_types = "upload" | "microphone" | "webcam" | "clipboard" | "webcam-video" | null;
type $$ComponentProps = {
    sources: Partial<source_types>[];
    active_source?: Partial<source_types>;
    handle_clear?: () => void;
    handle_select?: (source_type: Partial<source_types>) => void;
};
declare const SelectSource: import("svelte").Component<$$ComponentProps, {}, "active_source">;
type SelectSource = ReturnType<typeof SelectSource>;
export default SelectSource;
