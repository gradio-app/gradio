export function patchParamViewer() {
	return {
		name: "patch-paramviewer",
		transform(code: string, id: string) {
			// Only patch the ParamViewer component
			if (id.includes("paramviewer") && id.includes("ParamViewer.svelte")) {
				return (
					code
						// prismjs is CommonJS. Under rolldown-vite (Vite 8) the CJS interop
						// leaves the `import * as Prism` namespace without `.languages`
						// (the real prismjs singleton the language components register onto
						// is on `.default`), so `Prism.languages` is undefined and highlight
						// crashes. Rebind Prism to the real singleton (falling back to the
						// namespace for classic bundlers).
						.replace(
							/import \* as Prism from ["']prismjs["'];?/,
							'import * as Prism__ns from "prismjs"; const Prism = (Prism__ns as any).default ?? Prism__ns;'
						)
						// Replace Prism.highlight call to check if language exists first
						.replace(
							/Prism\.highlight\(([^,]+),\s*Prism\.languages\[([^\]]+)\],\s*([^)]+)\)/g,
							"(Prism.languages?.[$2] ? Prism.highlight($1, Prism.languages[$2], $3) : $1)"
						)
				);
			}
		}
	};
}
