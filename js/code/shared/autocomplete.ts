import type {
	CompletionContext,
	CompletionResult
} from "@codemirror/autocomplete";
import { getWorkerProxyContext } from "@gradio/wasm/svelte";
import type { WorkerProxy } from "@gradio/wasm";

// Jedi's completion types to CodeMirror's completion types.
// If not defined here, Jedi's completion types will be used.
const completion_type_map: Record<string, string> = {
	module: "namespace"
};

type CodeMirrorAutocompleteAsyncFn = (
	context: CompletionContext
) => Promise<CompletionResult | null>;

export function create_pyodide_autocomplete(): CodeMirrorAutocompleteAsyncFn | null {
	let maybe_worker_proxy: WorkerProxy | undefined;
	try {
		maybe_worker_proxy = getWorkerProxyContext();
	} catch (e) {
		console.debug("Not in the Wasm env. Context-aware autocomplete disabled.");
		return null;
	}
	if (!maybe_worker_proxy) {
		return null;
	}
	const worker_proxy = maybe_worker_proxy;

	return async function pyodide_autocomplete(
		context: CompletionContext
	): Promise<CompletionResult | null> {
		try {
			const completions = await worker_proxy.getCodeCompletions({
				code: context.state.doc.toString(),
				line: context.state.doc.lineAt(context.state.selection.main.head)
					.number,
				column:
					context.state.selection.main.head -
					context.state.doc.lineAt(context.state.selection.main.head).from
			});
			if (completions.length === 0) {
				return null;
			}
			return {
				from:
					context.state.selection.main.head -
					completions[0].completion_prefix_length,
				options: completions.map((completion) => ({
					label: completion.label,
					type: completion_type_map[completion.type] ?? completion.type,
					documentation: completion.docstring,
					// Items starting with "_" are private attributes and should be sorted last.
					boost: completion.label.startsWith("_") ? -1 : 0
				}))
			};
		} catch (e) {
			console.error("Error getting completions", e);
			return null;
		}
	};
}
