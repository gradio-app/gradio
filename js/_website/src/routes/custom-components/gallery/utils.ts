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
