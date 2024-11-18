async function handle_copy(): Promise<void> {
    if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(value);
        dispatch("copy", { value: value });
        copy_feedback();
    }
} 