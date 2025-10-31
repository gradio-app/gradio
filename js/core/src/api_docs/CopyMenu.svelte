<script lang="ts">
	import IconCopy from "./img/IconCopy.svelte";

	export let label = "Copy page as Markdown for LLMs";
    export let markdown_content: string = "";

	let copied = false;
    
    $: markdown_content

	async function copyMarkdown() {

		try {
			if (!markdown_content) {
				console.warn("Nothing to copy");
				return;
			}

			const hasNavigatorClipboard =
				typeof navigator !== "undefined" &&
				!!navigator.clipboard &&
				typeof navigator.clipboard.writeText === "function";

			if (hasNavigatorClipboard) {
				await navigator.clipboard.writeText(markdown_content);
			} else if (hasDocument) {
				copyToClipboard(markdown_content);
			} else {
				console.warn("Clipboard API unavailable");
				return;
			}

			copied = true;
			setTimeout(() => {
				copied = false;
			}, 1000);
		} catch (error) {
			console.error("Failed to write to clipboard", error);
		}
	}

</script>


<button
    on:click={copyMarkdown}
    class="copy-button"
    aria-live="polite"
>
    <span
        class="inline-flex items-center justify-center rounded-md p-0.5 max-sm:p-0"
    >
        <IconCopy classNames="w-3 h-3 max-sm:w-2.5 max-sm:h-2.5" />
    </span>
    <span>{copied ? "Copied!" : label}</span>
</button>


<style>
    .copy-button {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 24px;
        padding-left: 8px;
        padding-right: 8px;
        margin-right: 20px;
        font-size: 11px;
        font-weight: 500;
        color: rgb(31, 41, 55);
        border: 1px solid rgb(229, 231, 235);
        border-radius: 6px;
        background-color: white;
        
        @media (max-width: 640px) {
            gap: 2px;
            height: 20px;
            padding-left: 6px;
            padding-right: 6px;
            font-size: 9px;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }

        &:hover {
            box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
        }

        @media (prefers-color-scheme: dark) {
            border-color: rgb(38, 38, 38);
            background-color: rgb(10, 10, 10);
            color: rgb(229, 231, 235);

            &:hover {
                background-color: rgb(38, 38, 38);
            }
        }
    }
</style>