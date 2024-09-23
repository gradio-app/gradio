import type { ActionReturn } from "svelte/action";
import type { Client } from "@gradio/client";
import type { ComponentType, SvelteComponent } from "svelte";

export interface ValueData {
	value: any;
	is_value_data: boolean;
}

export interface SelectData {
	row_value?: any[];
	index: number | [number, number];
	value: any;
	selected?: boolean;
}

export interface LikeData {
	index: number | [number, number];
	value: any;
	liked?: boolean;
}

export interface KeyUpData {
	key: string;
	input_value: string;
}

export interface ShareData {
	description: string;
	title?: string;
}

export class ShareError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ShareError";
	}
}

export async function uploadToHuggingFace(
	data: string | { url?: string; path?: string },
	type: "base64" | "url"
): Promise<string> {
	if (window.__gradio_space__ == null) {
		throw new ShareError("Must be on Spaces to share.");
	}
	let blob: Blob;
	let contentType: string;
	let filename: string;
	if (type === "url") {
		let url: string;

		if (typeof data === "object" && data.url) {
			url = data.url;
		} else if (typeof data === "string") {
			url = data;
		} else {
			throw new Error("Invalid data format for URL type");
		}

		const response = await fetch(url);
		blob = await response.blob();
		contentType = response.headers.get("content-type") || "";
		filename = response.headers.get("content-disposition") || "";
	} else {
		let dataurl: string;

		if (typeof data === "object" && data.path) {
			dataurl = data.path;
		} else if (typeof data === "string") {
			dataurl = data;
		} else {
			throw new Error("Invalid data format for base64 type");
		}

		blob = dataURLtoBlob(dataurl);
		contentType = dataurl.split(";")[0].split(":")[1];
		filename = "file." + contentType.split("/")[1];
	}

	const file = new File([blob], filename, { type: contentType });

	// Send file to endpoint
	const uploadResponse = await fetch("https://huggingface.co/uploads", {
		method: "POST",
		body: file,
		headers: {
			"Content-Type": file.type,
			"X-Requested-With": "XMLHttpRequest"
		}
	});

	// Check status of response
	if (!uploadResponse.ok) {
		if (
			uploadResponse.headers.get("content-type")?.includes("application/json")
		) {
			const error = await uploadResponse.json();
			throw new ShareError(`Upload failed: ${error.error}`);
		}
		throw new ShareError(`Upload failed.`);
	}

	// Return response if needed
	const result = await uploadResponse.text();
	return result;
}

function dataURLtoBlob(dataurl: string): Blob {
	var arr = dataurl.split(","),
		mime = (arr[0].match(/:(.*?);/) as RegExpMatchArray)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}

export function copy(node: HTMLDivElement): ActionReturn {
	node.addEventListener("click", handle_copy);

	async function handle_copy(event: MouseEvent): Promise<void> {
		const path = event.composedPath() as HTMLButtonElement[];

		const [copy_button] = path.filter(
			(e) => e?.tagName === "BUTTON" && e.classList.contains("copy_code_button")
		);

		if (copy_button) {
			event.stopImmediatePropagation();

			const copy_text = copy_button.parentElement!.innerText.trim();
			const copy_sucess_button = Array.from(
				copy_button.children
			)[1] as HTMLDivElement;

			const copied = await copy_to_clipboard(copy_text);

			if (copied) copy_feedback(copy_sucess_button);

			function copy_feedback(_copy_sucess_button: HTMLDivElement): void {
				_copy_sucess_button.style.opacity = "1";
				setTimeout(() => {
					_copy_sucess_button.style.opacity = "0";
				}, 2000);
			}
		}
	}

	return {
		destroy(): void {
			node.removeEventListener("click", handle_copy);
		}
	};
}

async function copy_to_clipboard(value: string): Promise<boolean> {
	let copied = false;
	if ("clipboard" in navigator) {
		await navigator.clipboard.writeText(value);
		copied = true;
	} else {
		const textArea = document.createElement("textarea");
		textArea.value = value;

		textArea.style.position = "absolute";
		textArea.style.left = "-999999px";

		document.body.prepend(textArea);
		textArea.select();

		try {
			document.execCommand("copy");
			copied = true;
		} catch (error) {
			console.error(error);
			copied = false;
		} finally {
			textArea.remove();
		}
	}

	return copied;
}

export const format_time = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const seconds_remainder = Math.round(seconds) % 60;
	const padded_minutes = `${minutes < 10 ? "0" : ""}${minutes}`;
	const padded_seconds = `${
		seconds_remainder < 10 ? "0" : ""
	}${seconds_remainder}`;

	if (hours > 0) {
		return `${hours}:${padded_minutes}:${padded_seconds}`;
	}
	return `${minutes}:${padded_seconds}`;
};

interface Args {
	api_url: string;
	name: string;
	id?: string;
	variant: "component" | "example" | "base";
}

type component_loader = (args: Args) => {
	name: "string";
	component: {
		default: ComponentType<SvelteComponent>;
	};
};

const is_browser = typeof window !== "undefined";

export type I18nFormatter = any;
export class Gradio<T extends Record<string, any> = Record<string, any>> {
	#id: number;
	theme: string;
	version: string;
	i18n: I18nFormatter;
	#el: HTMLElement;
	root: string;
	autoscroll: boolean;
	max_file_size: number | null;
	client: Client;
	_load_component?: component_loader;
	load_component = _load_component.bind(this);

	constructor(
		id: number,
		el: HTMLElement,
		theme: string,
		version: string,
		root: string,
		autoscroll: boolean,
		max_file_size: number | null,
		i18n: I18nFormatter = (x: string): string => x,
		client: Client,
		virtual_component_loader?: component_loader
	) {
		this.#id = id;
		this.theme = theme;
		this.version = version;
		this.#el = el;
		this.max_file_size = max_file_size;

		this.i18n = i18n;
		this.root = root;
		this.autoscroll = autoscroll;
		this.client = client;

		this._load_component = virtual_component_loader;
	}

	dispatch<E extends keyof T>(event_name: E, data?: T[E]): void {
		if (!is_browser || !this.#el) return;
		const e = new CustomEvent("gradio", {
			bubbles: true,
			detail: { data, id: this.#id, event: event_name }
		});
		this.#el.dispatchEvent(e);
	}
}

function _load_component(
	this: Gradio,
	name: string,
	variant: "component" | "example" | "base" = "component"
): ReturnType<component_loader> {
	return this._load_component!({
		name,
		api_url: this.client.config?.root!,
		variant
	});
}

export const css_units = (dimension_value: string | number): string => {
	return typeof dimension_value === "number"
		? dimension_value + "px"
		: dimension_value;
};
