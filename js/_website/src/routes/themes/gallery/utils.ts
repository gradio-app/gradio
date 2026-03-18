import type { ThemeData, CommunityThemeManifestEntry } from "./types";

const COMMUNITY_MANIFEST_URL =
	"https://huggingface.co/datasets/gradio/theme-gallery/resolve/main/manifest.json";

export async function fetch_community_themes(): Promise<ThemeData[]> {
	try {
		const res = await fetch(COMMUNITY_MANIFEST_URL);
		if (!res.ok) return [];
		const entries: CommunityThemeManifestEntry[] = await res.json();
		return entries.map((entry) => ({
			...entry,
			is_official: false,
			likes: 0,
			subdomain: "",
			background_color: "",
			stylesheets: entry.stylesheets ?? []
		}));
	} catch {
		return [];
	}
}

export const COLOR_SETS = [
	"from-red-50 via-red-100 to-red-50 dark:from-red-950 dark:via-red-900 dark:to-red-950",
	"from-green-50 via-green-100 to-green-50 dark:from-green-950 dark:via-green-900 dark:to-green-950",
	"from-yellow-50 via-yellow-100 to-yellow-50 dark:from-yellow-950 dark:via-yellow-900 dark:to-yellow-950",
	"from-pink-50 via-pink-100 to-pink-50 dark:from-pink-950 dark:via-pink-900 dark:to-pink-950",
	"from-blue-50 via-blue-100 to-blue-50 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950",
	"from-purple-50 via-purple-100 to-purple-50 dark:from-purple-950 dark:via-purple-900 dark:to-purple-950"
];

export const BUILTIN_THEMES: ThemeData[] = [
	{
		id: "base",
		name: "Base",
		author: "Gradio",
		description:
			"The foundation theme with blue accents. A clean, minimal starting point.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#3b82f6",
			secondary: "#3b82f6",
			neutral: "#71717a",
			background: "#ffffff",
			background_dark: "#0b0f19"
		},
		fonts: {
			main: "IBM Plex Sans",
			mono: "IBM Plex Mono"
		}
	},
	{
		id: "default",
		name: "Default",
		author: "Gradio",
		description: "The standard Gradio theme with warm orange accents.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#f97316",
			secondary: "#3b82f6",
			neutral: "#71717a",
			background: "#ffffff",
			background_dark: "#0b0f19"
		},
		fonts: {
			main: "Source Sans Pro",
			mono: "IBM Plex Mono"
		}
	},
	{
		id: "soft",
		name: "Soft",
		author: "Gradio",
		description: "A soft, rounded theme with indigo accents and gentle curves.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#6366f1",
			secondary: "#6366f1",
			neutral: "#6b7280",
			background: "#ffffff",
			background_dark: "#0b0f19"
		},
		fonts: {
			main: "Montserrat",
			mono: "IBM Plex Mono"
		}
	},
	{
		id: "monochrome",
		name: "Monochrome",
		author: "Gradio",
		description: "A sleek black and white theme for a professional look.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#171717",
			secondary: "#737373",
			neutral: "#737373",
			background: "#ffffff",
			background_dark: "#0f0f0f"
		},
		fonts: {
			main: "Lora",
			mono: "IBM Plex Mono"
		}
	},
	{
		id: "glass",
		name: "Glass",
		author: "Gradio",
		description: "A modern glassmorphic theme with translucent elements.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#3b82f6",
			secondary: "#64748b",
			neutral: "#64748b",
			background: "#ffffff",
			background_dark: "#1e293b"
		},
		fonts: {
			main: "Optima",
			mono: "IBM Plex Mono"
		}
	},
	{
		id: "origin",
		name: "Origin",
		author: "Gradio",
		description:
			"The classic Gradio 3.x style theme for a familiar experience.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#f97316",
			secondary: "#3b82f6",
			neutral: "#6b7280",
			background: "#ffffff",
			background_dark: "#0b0f19"
		},
		fonts: {
			main: "Source Sans Pro",
			mono: "IBM Plex Mono"
		}
	},
	{
		id: "citrus",
		name: "Citrus",
		author: "Gradio",
		description: "A bright, energetic theme with fresh lime green accents.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#84cc16",
			secondary: "#f59e0b",
			neutral: "#78716c",
			background: "#ffffff",
			background_dark: "#0b0f19"
		},
		fonts: {
			main: "Ubuntu",
			mono: "Roboto Mono"
		}
	},
	{
		id: "ocean",
		name: "Ocean",
		author: "Gradio",
		description: "A calming theme inspired by ocean blues and cyans.",
		is_official: true,
		likes: 0,
		hf_space_id: "",
		subdomain: "",
		background_color: "",
		colors: {
			primary: "#06b6d4",
			secondary: "#0ea5e9",
			neutral: "#71717a",
			background: "#ffffff",
			background_dark: "#0b0f19"
		},
		fonts: {
			main: "IBM Plex Sans",
			mono: "IBM Plex Mono"
		}
	}
];

export function clickOutside(
	element: HTMLDivElement,
	callbackFunction: () => void
) {
	function onClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (
			!element.contains(target) &&
			!(target.textContent && target.textContent === "Share")
		) {
			callbackFunction();
		}
	}

	document.body.addEventListener("click", onClick);

	return {
		update(newCallbackFunction: () => void) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener("click", onClick);
		}
	};
}

export function assignColors(themes: ThemeData[]): void {
	let counter = 0;
	for (const theme of themes) {
		if (counter >= COLOR_SETS.length) {
			counter = 0;
		}
		theme.background_color = COLOR_SETS[counter];
		counter++;
	}
}
