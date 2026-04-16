import type { ThemeData, ThemeStatus, HfSpaceEntry } from "./types";

const HF_API_URL =
	"https://huggingface.co/api/spaces?filter=gradio-theme&limit=500&sort=lastModified&direction=-1&expand[]=subdomain&expand[]=likes&expand[]=runtime&expand[]=cardData";

const DEFAULT_COLORS = {
	primary: "#3b82f6",
	secondary: "#3b82f6",
	neutral: "#71717a",
	background: "#ffffff",
	background_dark: "#0b0f19",
	block_background: "#ffffff",
	block_border: "#e4e4e7",
	text_color: "#1f2937",
	button_primary: "#3b82f6",
	button_secondary_border: "#e4e4e7",
	button_secondary_text: "#71717a"
};

const DEFAULT_FONTS = {
	main: "IBM Plex Sans",
	mono: "IBM Plex Mono"
};

function format_theme_name(id: string): string {
	const name = id.split("/").pop() || id;
	return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const CSS_NAMED_COLORS: Record<string, string> = {
	black: "#000000",
	white: "#ffffff",
	red: "#ff0000",
	green: "#008000",
	blue: "#0000ff",
	yellow: "#ffff00",
	cyan: "#00ffff",
	magenta: "#ff00ff",
	purple: "#800080",
	orange: "#ffa500",
	pink: "#ffc0cb",
	gray: "#808080",
	grey: "#808080",
	teal: "#008080",
	navy: "#000080",
	maroon: "#800000",
	lime: "#00ff00",
	aqua: "#00ffff",
	silver: "#c0c0c0",
	olive: "#808000",
	fuchsia: "#ff00ff",
	indigo: "#4b0082",
	violet: "#ee82ee",
	coral: "#ff7f50",
	salmon: "#fa8072",
	tomato: "#ff6347",
	gold: "#ffd700",
	khaki: "#f0e68c",
	plum: "#dda0dd",
	orchid: "#da70d6",
	tan: "#d2b48c",
	crimson: "#dc143c",
	turquoise: "#40e0d0"
};

const HEX_6_RE = /^#[0-9a-fA-F]{6}$/;
const HEX_SHORT_RE = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
const HEX_ANY_RE = /^#[0-9a-fA-F]{3,8}$/;
const HEX_IN_VALUE_RE = /#[0-9a-fA-F]{3,8}/;
const VAR_REF_RE = /^var\(--([\w-]+)\)$/;
const CSS_VAR_DECL_RE = /--([\w-]+):\s*([^;]+);/g;
const MAX_VAR_RESOLVE_DEPTH = 10;

function normalize_hex(hex: string): string {
	const short = HEX_SHORT_RE.exec(hex);
	if (short) {
		return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
	}
	return hex;
}

function extract_hex_color(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	if (HEX_ANY_RE.test(trimmed)) return normalize_hex(trimmed);
	const named = CSS_NAMED_COLORS[trimmed.toLowerCase()];
	if (named) return named;
	const hex_match = trimmed.match(HEX_IN_VALUE_RE);
	if (hex_match) return normalize_hex(hex_match[0]);
	return undefined;
}

export function hex_to_rgb(
	hex: string
): { r: number; g: number; b: number } | null {
	const normalized = normalize_hex(hex);
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: null;
}

export function is_color_dark(hex: string): boolean {
	const rgb = hex_to_rgb(hex);
	if (!rgb) return false;
	const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
	return luminance < 0.5;
}

function parse_css_vars(css: string): Record<string, string> {
	const vars: Record<string, string> = {};
	let match;
	CSS_VAR_DECL_RE.lastIndex = 0;
	while ((match = CSS_VAR_DECL_RE.exec(css)) !== null) {
		vars[match[1]] = match[2].trim();
	}
	return vars;
}

function resolve_css_var(
	vars: Record<string, string>,
	name: string,
	depth = 0
): string | undefined {
	const value = vars[name];
	if (!value || depth > MAX_VAR_RESOLVE_DEPTH) return undefined;
	const ref = value.match(VAR_REF_RE);
	if (ref && ref[1]) {
		return resolve_css_var(vars, ref[1], depth + 1);
	}
	return value;
}

const FETCH_TIMEOUT_MS = 5000;

type SpaceConfig = {
	body_css?: {
		body_background_fill?: string;
		body_text_color?: string;
		body_background_fill_dark?: string;
		body_text_color_dark?: string;
	};
};

function first_font_family(raw: string | undefined): string | undefined {
	return raw
		?.split(",")[0]
		?.trim()
		?.replace(/^['"]|['"]$/g, "");
}

function fetch_with_timeout(
	url: string,
	fetcher: typeof fetch
): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	return fetcher(url, { signal: controller.signal }).finally(() =>
		clearTimeout(timeout)
	);
}

async function fetch_theme_details(
	subdomain: string,
	fetcher: typeof fetch
): Promise<{
	colors: ThemeData["colors"];
	fonts: ThemeData["fonts"];
}> {
	const fallback = { colors: DEFAULT_COLORS, fonts: DEFAULT_FONTS };
	try {
		const [css_res, config_res] = await Promise.all([
			fetch_with_timeout(`${subdomain}/theme.css`, fetcher),
			fetch_with_timeout(`${subdomain}/config`, fetcher)
		]);

		if (!css_res.ok) return fallback;
		const css = await css_res.text();
		const vars = parse_css_vars(css);

		// /config provides pre-resolved background colors; /theme.css may have unresolved var() chains
		let body_css: SpaceConfig["body_css"] = undefined;
		if (config_res.ok) {
			try {
				const config: SpaceConfig = await config_res.json();
				body_css = config.body_css;
			} catch {
				// ignore parse errors
			}
		}

		const resolved_accent = extract_hex_color(
			resolve_css_var(vars, "color-accent")
		);

		const primary =
			extract_hex_color(resolve_css_var(vars, "primary-500")) ??
			resolved_accent ??
			DEFAULT_COLORS.primary;

		const accent = resolved_accent ?? primary;

		const neutral =
			extract_hex_color(resolve_css_var(vars, "neutral-500")) ??
			DEFAULT_COLORS.neutral;

		const background =
			extract_hex_color(body_css?.body_background_fill) ??
			extract_hex_color(resolve_css_var(vars, "body-background-fill")) ??
			DEFAULT_COLORS.background;

		const background_dark =
			extract_hex_color(body_css?.body_background_fill_dark) ??
			extract_hex_color(resolve_css_var(vars, "body-background-fill-dark")) ??
			DEFAULT_COLORS.background_dark;

		const block_background =
			extract_hex_color(resolve_css_var(vars, "block-background-fill")) ??
			DEFAULT_COLORS.block_background;

		const block_border =
			extract_hex_color(resolve_css_var(vars, "block-border-color")) ??
			DEFAULT_COLORS.block_border;

		const text_color =
			extract_hex_color(resolve_css_var(vars, "body-text-color")) ??
			DEFAULT_COLORS.text_color;

		const button_primary =
			extract_hex_color(
				resolve_css_var(vars, "button-primary-background-fill")
			) ?? primary;

		const button_secondary_border =
			extract_hex_color(
				resolve_css_var(vars, "button-secondary-border-color")
			) ?? neutral;

		const button_secondary_text =
			extract_hex_color(resolve_css_var(vars, "button-secondary-text-color")) ??
			neutral;

		return {
			colors: {
				primary,
				secondary: accent,
				neutral,
				background,
				background_dark,
				block_background,
				block_border,
				text_color,
				button_primary,
				button_secondary_border,
				button_secondary_text
			},
			fonts: {
				main:
					first_font_family(resolve_css_var(vars, "font")) ||
					DEFAULT_FONTS.main,
				mono:
					first_font_family(resolve_css_var(vars, "font-mono")) ||
					DEFAULT_FONTS.mono
			}
		};
	} catch {
		return fallback;
	}
}

export async function fetch_community_themes(
	fetcher: typeof fetch = fetch
): Promise<ThemeData[]> {
	try {
		const res = await fetcher(HF_API_URL);
		if (!res.ok) return [];
		const spaces: HfSpaceEntry[] = await res.json();

		const running_spaces = spaces.filter(
			(space) => space.runtime?.stage === "RUNNING"
		);

		const results = await Promise.allSettled(
			running_spaces.map(async (space) => {
				const subdomain = `https://${space.subdomain}.hf.space`;
				const details = await fetch_theme_details(subdomain, fetcher);

				return {
					id: space.id,
					name: space.cardData?.title || format_theme_name(space.id),
					author: space.id.split("/")[0],
					description: space.cardData?.short_description || "",
					is_official: false,
					likes: space.likes,
					hf_space_id: space.id,
					subdomain,
					background_color: "",
					status: "RUNNING" as ThemeStatus,
					colors: details.colors,
					fonts: details.fonts
				};
			})
		);

		return results
			.filter(
				(r): r is PromiseFulfilledResult<ThemeData> => r.status === "fulfilled"
			)
			.map((r) => r.value);
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
			background_dark: "#0b0f19",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#3b82f6",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#71717a"
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
			background_dark: "#0b0f19",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#f97316",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#71717a"
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
			background_dark: "#0b0f19",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#6366f1",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#6b7280"
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
			background_dark: "#0f0f0f",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#171717",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#737373"
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
			background_dark: "#1e293b",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#3b82f6",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#64748b"
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
			background_dark: "#0b0f19",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#f97316",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#6b7280"
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
			background_dark: "#0b0f19",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#84cc16",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#78716c"
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
			background_dark: "#0b0f19",
			block_background: "#ffffff",
			block_border: "#e4e4e7",
			text_color: "#1f2937",
			button_primary: "#06b6d4",
			button_secondary_border: "#e4e4e7",
			button_secondary_text: "#71717a"
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
