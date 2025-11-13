export function patchParamViewer() {
	return {
		name: "patch-paramviewer",
		transform(code: string, id: string) {
			// Only patch the ParamViewer component
			if (id.includes("paramviewer") && id.includes("ParamViewer.svelte")) {
				// Replace Prism.highlight call to check if language exists first
				return code.replace(
					/Prism\.highlight\(([^,]+),\s*Prism\.languages\[([^\]]+)\],\s*([^)]+)\)/g,
					"(Prism.languages[$2] ? Prism.highlight($1, Prism.languages[$2], $3) : $1)"
				);
			}
		}
	};
}
