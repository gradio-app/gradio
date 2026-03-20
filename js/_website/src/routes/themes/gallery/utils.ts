import type { ThemeData, ThemeStatus, HfSpaceEntry } from "./types";

const HF_API_URL =
	"https://huggingface.co/api/spaces?filter=gradio-theme&limit=200&expand[]=subdomain&expand[]=likes&expand[]=runtime&expand[]=cardData";

const HF_COLOR_MAP: Record<string, string> = {
	red: "#ef4444",
	orange: "#f97316",
	amber: "#f59e0b",
	yellow: "#eab308",
	lime: "#84cc16",
	green: "#22c55e",
	emerald: "#10b981",
	teal: "#14b8a6",
	cyan: "#06b6d4",
	sky: "#0ea5e9",
	blue: "#3b82f6",
	indigo: "#6366f1",
	violet: "#8b5cf6",
	purple: "#a855f7",
	fuchsia: "#d946ef",
	pink: "#ec4899",
	rose: "#f43f5e",
	gray: "#6b7280",
	stone: "#78716c",
	zinc: "#71717a",
	neutral: "#737373",
	slate: "#64748b"
};

function format_theme_name(id: string): string {
	const name = id.split("/").pop() || id;
	return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function fetch_community_themes(
	fetcher: typeof fetch = fetch
): Promise<ThemeData[]> {
	try {
		const res = await fetcher(HF_API_URL);
		if (!res.ok) return [];
		const spaces: HfSpaceEntry[] = await res.json();

		return spaces
			.filter((space) => space.runtime?.stage === "RUNNING")
			.map((space) => {
				const color_from = space.cardData?.colorFrom ?? "";
				const color_to = space.cardData?.colorTo ?? "";

				return {
					id: space.id,
					name: space.cardData?.title || format_theme_name(space.id),
					author: space.id.split("/")[0],
					description: space.cardData?.short_description || "",
					is_official: false,
					likes: space.likes,
					hf_space_id: space.id,
					subdomain: `https://${space.subdomain}.hf.space`,
					background_color: "",
					status: "RUNNING" as ThemeStatus,
					colors: {
						primary: HF_COLOR_MAP[color_from] ?? "#3b82f6",
						secondary: HF_COLOR_MAP[color_to] ?? "#3b82f6",
						neutral: "#71717a",
						background: "#ffffff",
						background_dark: "#0b0f19"
					},
					fonts: {
						main: "IBM Plex Sans",
						mono: "IBM Plex Mono"
					}
				};
			});
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
		status: "RUNNING",
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
		status: "RUNNING",
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
		status: "RUNNING",
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
		status: "RUNNING",
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
		status: "RUNNING",
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
		status: "RUNNING",
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
		status: "RUNNING",
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
		status: "RUNNING",
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
