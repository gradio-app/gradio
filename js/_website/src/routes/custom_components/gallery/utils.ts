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
};

export function getRandomIntInclusive(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
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
