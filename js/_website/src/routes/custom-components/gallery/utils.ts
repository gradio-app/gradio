export type ComponentData = {
	id: string;
	name: string;
	template: string;
	author: string;
	description: string;
	tags: string;
	version: string;
	subdomain: string;
	background_color: string;
	likes: number;
};

const API = "https://gradio-custom-component-gallery-backend.hf.space/";
const BACKUP =
	"https://huggingface.co/datasets/gradio/custom-component-gallery-backups/resolve/main/backup.json";

let backup_components: ComponentData[] | null = null;

async function fetch_component_data(url: string): Promise<ComponentData[]> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch custom components: ${response.status}`);
	}

	const result = await response.json();
	if (!Array.isArray(result)) {
		throw new Error("Custom component response was not an array");
	}
	return result;
}

function filter_components(
	components: ComponentData[],
	selection: string[]
): ComponentData[] {
	const terms = selection
		.map((term) => term.trim().toLowerCase())
		.filter(Boolean);
	if (!terms.length) return components;

	return components.filter((component) => {
		const searchable_text = [
			component.name,
			component.tags,
			component.description
		]
			.map((value) => value?.toLowerCase() ?? "")
			.join(" ");
		return terms.some((term) => searchable_text.includes(term));
	});
}

export async function get_components(
	selection: string[] = []
): Promise<ComponentData[]> {
	try {
		return await fetch_component_data(
			`${API}components?name_or_tags=${selection.join(",")}`
		);
	} catch {
		try {
			backup_components ??= await fetch_component_data(BACKUP);
			return filter_components(backup_components, selection);
		} catch {
			return [];
		}
	}
}

export const classToEmojiMapping: { [key: string]: string } = {
	AnnotatedImage: "🖼️",
	Audio: "🔊",
	Plot: "📈",
	Button: "🔘",
	Chatbot: "🤖",
	Code: "💻",
	ColorPicker: "🎨",
	Dataframe: "📊",
	Dataset: "📚",
	Fallback: "🔄",
	File: "📄",
	FileExplorer: "📂",
	Gallery: "🎨",
	HighlightedText: "✨",
	HTML: "🔗",
	Image: "🖼️",
	JSON: "📝",
	Label: "🏷️",
	Markdown: "📝",
	Model3D: "🗿",
	State: "🔢",
	UploadButton: "📤",
	Video: "🎥"
};

export function clickOutside(element: HTMLDivElement, callbackFunction: any) {
	function onClick(event: any) {
		if (
			!element.contains(event.target) &&
			!(event.target.textContent && event.target.textContent === "Share")
		) {
			callbackFunction();
		}
	}

	document.body.addEventListener("click", onClick);

	return {
		update(newCallbackFunction: any) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener("click", onClick);
		}
	};
}
