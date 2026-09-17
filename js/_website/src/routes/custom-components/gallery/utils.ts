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
const BACKUP_API =
	"https://datasets-server.huggingface.co/rows?dataset=gradio/custom-component-gallery-backups&config=default&split=train";
const BACKUP_PAGE_SIZE = 100;

type BackupPage = {
	rows: { row: ComponentData }[];
	num_rows_total: number;
};

let backupComponentsPromise: Promise<ComponentData[]> | null = null;

async function fetchComponentData(url: string): Promise<ComponentData[]> {
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

async function fetchBackupComponents(): Promise<ComponentData[]> {
	const components: ComponentData[] = [];
	let offset = 0;
	let total = Infinity;

	while (offset < total) {
		const response = await fetch(
			`${BACKUP_API}&offset=${offset}&length=${BACKUP_PAGE_SIZE}`
		);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch custom component backup: ${response.status}`
			);
		}

		const result = (await response.json()) as BackupPage;
		if (
			!Array.isArray(result.rows) ||
			typeof result.num_rows_total !== "number"
		) {
			throw new Error("Custom component backup response was invalid");
		}

		components.push(...result.rows.map(({ row }) => row));
		total = result.num_rows_total;
		offset += result.rows.length;

		if (result.rows.length === 0 && offset < total) {
			throw new Error("Custom component backup pagination stopped early");
		}
	}

	return components;
}

function filterComponents(
	components: ComponentData[],
	selection: string[]
): ComponentData[] {
	const terms = selection
		.map((term) => term.trim().toLowerCase())
		.filter(Boolean);
	if (!terms.length) return components;

	return components.filter((component) => {
		const searchableText = [
			component.name,
			component.tags,
			component.description
		]
			.map((value) => value?.toLowerCase() ?? "")
			.join(" ");
		return terms.some((term) => searchableText.includes(term));
	});
}

export async function getComponents(
	selection: string[] = []
): Promise<ComponentData[]> {
	try {
		return await fetchComponentData(
			`${API}components?name_or_tags=${encodeURIComponent(selection.join(","))}`
		);
	} catch {
		try {
			backupComponentsPromise ??= fetchBackupComponents();
			return filterComponents(await backupComponentsPromise, selection);
		} catch {
			backupComponentsPromise = null;
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
