import type { PyodideInterface } from "pyodide";
import code_completion_py from "./code_completion.py?raw";
import type { PyProxy } from "pyodide/ffi";

export interface CodeCompletionRequest {
	code: string;
	// line is 1-based and column is 0-based due to Jedi's spec: https://jedi.readthedocs.io/en/latest/docs/api.html#jedi.Script
	line: number; // 1-based
	column: number; // 0-based
}
export interface CodeCompletion {
	label: string;
	type: string;
	docstring: string;
	completion_prefix_length: number;
}
export type CodeCompletionResponse = CodeCompletion[];

type GetCodeCompletionsPyFn = (
	code: string,
	line: number,
	column: number
) => PyProxy;

export class CodeCompleter {
	private setupPromise: Promise<GetCodeCompletionsPyFn | null>;

	constructor(private pyodide: PyodideInterface) {
		// NOTE: obviously this constructor has a side effect on the Pyodide instance.
		this.setupPromise = this.setup().catch((err) => {
			console.error("Error while setting up code completion", err);
			return null;
		});
	}

	private async setup(): Promise<GetCodeCompletionsPyFn> {
		const micropip = this.pyodide.pyimport("micropip");
		await micropip.install.callKwargs(["jedi"], {
			keep_going: true
		});

		this.pyodide.runPython(code_completion_py);

		return this.pyodide.globals.get(
			"get_code_completions"
		) as GetCodeCompletionsPyFn;
	}

	public async getCodeCompletions(
		request: CodeCompletionRequest
	): Promise<CodeCompletionResponse> {
		const getCodeCompletionsPyFn = await this.setupPromise;
		if (!getCodeCompletionsPyFn) {
			// Setting up failed, return empty response
			console.debug("Code completion setup failed, returning empty response");
			return [];
		}

		const { code, line, column } = request;
		const completionsPy = getCodeCompletionsPyFn(code, line, column);
		const completions: CodeCompletionResponse = completionsPy.toJs({
			dict_converter: Object.fromEntries // dict -> object
		});
		// > ... If the return value is a PyProxy, you must explicitly destroy it or else it will be leaked.
		// https://pyodide.org/en/stable/usage/type-conversions.html#calling-python-objects-from-javascript
		completionsPy.destroy();

		return completions;
	}
}
