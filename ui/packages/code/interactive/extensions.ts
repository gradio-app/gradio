/// Identical to https://codemirror.net/docs/ref/#codemirror.basicSetup
/// with only one difference: no search extension so that default browser cmd+f behaviour can be used
import type { Extension } from "@codemirror/state";
import {
	lineNumbers,
	highlightActiveLineGutter,
	highlightSpecialChars,
	drawSelection,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
	highlightActiveLine,
	keymap
} from "@codemirror/view";
export { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
	foldGutter,
	indentOnInput,
	syntaxHighlighting,
	defaultHighlightStyle,
	bracketMatching,
	foldKeymap
} from "@codemirror/language";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
import {
	closeBrackets,
	autocompletion,
	closeBracketsKeymap,
	completionKeymap
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

export const basicSetup: Extension = /*@__PURE__*/ (() => [
	lineNumbers(),
	// highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	foldGutter(),
	drawSelection(),
	// dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	// bracketMatching(),
	closeBrackets(),
	autocompletion(),
	rectangularSelection(),
	crosshairCursor(),
	// highlightActiveLine(),
	// editable.of(false),

	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap
	])
])();
