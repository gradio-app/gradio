import { create, type Options } from "..";

interface GradioComponentOptions {
	info: Options["info"];
	container: Options["container"];
	isEmbed: Options["isEmbed"];
	initialHeight?: Options["initialHeight"];
	eager: Options["eager"];
	themeMode: Options["themeMode"];
	autoScroll: Options["autoScroll"];
	controlPageTitle: Options["controlPageTitle"];
	appMode: Options["appMode"];
	sharedWorkerMode?: Options["sharedWorkerMode"];
}

interface GradioLiteAppOptions {
	files?: Options["files"];
	requirements?: Options["requirements"];
	code?: Options["code"];
	entrypoint?: Options["entrypoint"];
}

function parseRequirementsTxt(content: string): string[] {
	return content
		.split("\n")
		.filter((r) => !r.startsWith("#"))
		.map((r) => r.trim())
		.filter((r) => r !== "");
}

export function bootstrap_custom_element(): void {
	const CUSTOM_ELEMENT_NAME = "gradio-lite";

	if (customElements.get(CUSTOM_ELEMENT_NAME)) {
		return;
	}

	class GradioLiteAppElement extends HTMLElement {
		constructor() {
			super();

			const gradioComponentOptions = this.parseGradioComponentOptions();
			const gradioLiteAppOptions = this.parseGradioLiteAppOptions();

			this.innerHTML = "";

			create({
				target: this, // Same as `js/app/src/main.ts`
				code: gradioLiteAppOptions.code,
				requirements: gradioLiteAppOptions.requirements,
				files: gradioLiteAppOptions.files,
				entrypoint: gradioLiteAppOptions.entrypoint,
				...gradioComponentOptions
			});
		}

		parseGradioComponentOptions(): GradioComponentOptions {
			// Parse the options from the attributes of the <gradio-lite> element.
			// The following attributes are supported:
			// * info: boolean
			// * container: boolean
			// * embed: boolean
			// * initial-height: string
			// * eager: boolean
			// * theme: "light" | "dark" | null
			// * auto-scroll: boolean
			// * control-page-title: boolean
			// * app-mode: boolean

			const info = this.hasAttribute("info");
			const container = this.hasAttribute("container");
			const isEmbed = this.hasAttribute("embed");
			const initialHeight = this.getAttribute("initial-height");
			const eager = this.hasAttribute("eager");
			const themeMode = this.getAttribute("theme");
			const autoScroll = this.hasAttribute("auto-scroll");
			const controlPageTitle = this.hasAttribute("control-page-title");
			const appMode = this.hasAttribute("app-mode");
			const sharedWorkerMode = this.hasAttribute("shared-worker");

			return {
				info,
				container,
				isEmbed,
				initialHeight: initialHeight ?? undefined,
				eager,
				themeMode:
					themeMode != null && ["light", "dark"].includes(themeMode)
						? (themeMode as GradioComponentOptions["themeMode"])
						: null,
				autoScroll,
				controlPageTitle,
				appMode,
				sharedWorkerMode
			};
		}

		parseGradioLiteAppOptions(): GradioLiteAppOptions {
			// When gradioLiteAppElement only contains text content, it is treated as the Python code.
			if (this.childElementCount === 0) {
				return { code: this.textContent ?? "" };
			}

			// When it contains child elements, parse them as options. Available child elements are:
			// * <gradio-file />
			//   Represents a file to be mounted in the virtual file system of the Wasm worker.
			//   At least 1 <gradio-file> element must have the `entrypoint` attribute.
			//   The following 2 forms are supported:
			//   * <gradio-file name="{file name}" >{file content}</gradio-file>
			//   * <gradio-file name="{file name}" url="{remote URL}" />
			// * <gradio-requirements>{requirements.txt}</gradio-requirements>
			// * <gradio-code>{Python code}</gradio-code>
			const options: GradioLiteAppOptions = {};

			const fileElements = this.getElementsByTagName("gradio-file");
			for (const fileElement of fileElements) {
				const name = fileElement.getAttribute("name");
				if (name == null) {
					throw new Error("<gradio-file> must have the name attribute.");
				}

				const entrypoint = fileElement.hasAttribute("entrypoint");
				const url = fileElement.getAttribute("url");

				options.files ??= {};
				if (url != null) {
					options.files[name] = { url };
				} else {
					options.files[name] = { data: fileElement.textContent ?? "" };
				}

				if (entrypoint) {
					if (options.entrypoint != null) {
						throw new Error("Multiple entrypoints are not allowed.");
					}
					options.entrypoint = name;
				}
			}

			const codeElements = this.getElementsByTagName("gradio-code");
			if (codeElements.length > 1) {
				console.warn(
					"Multiple <gradio-code> elements are found. Only the first one will be used."
				);
			}
			const firstCodeElement = codeElements[0];
			options.code = firstCodeElement?.textContent ?? undefined;

			const requirementsElements = this.getElementsByTagName(
				"gradio-requirements"
			);
			if (requirementsElements.length > 1) {
				console.warn(
					"Multiple <gradio-requirements> elements are found. Only the first one will be used."
				);
			}
			const firstRequirementsElement = requirementsElements[0];
			const requirementsTxt = firstRequirementsElement?.textContent ?? "";
			options.requirements = parseRequirementsTxt(requirementsTxt);

			return options;
		}
	}

	customElements.define(CUSTOM_ELEMENT_NAME, GradioLiteAppElement);
}
