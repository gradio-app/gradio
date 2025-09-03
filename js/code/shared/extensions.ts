import type { Extension } from "@codemirror/state";
import {
	lineNumbers,
	highlightSpecialChars,
	drawSelection,
	rectangularSelection,
	crosshairCursor,
	keymap
} from "@codemirror/view";
export { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
	foldGutter,
	indentOnInput,
	syntaxHighlighting,
	defaultHighlightStyle,
	foldKeymap
} from "@codemirror/language";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import {
	closeBrackets,
	closeBracketsKeymap,
	completionKeymap
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

export const basicSetup: Extension = /*@__PURE__*/ ((): Extension[] => [
	highlightSpecialChars(),
	history(),
	foldGutter(),
	drawSelection(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	closeBrackets(),
	rectangularSelection(),
	crosshairCursor(),

	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap
	])
])();
