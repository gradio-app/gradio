import type { ActionReturn } from "svelte/action";
import type { Client } from "@gradio/client";
import type { ComponentType, SvelteComponent } from "svelte";
import { getContext, tick, untrack } from "svelte";
import type { Component } from "svelte";
import { locale } from "svelte-i18n";

export const I18N_MARKER = "__i18n__";
const TRANSLATABLE_PROPS = [
	"label",
	"info",
	"placeholder",
	"description",
	"title",
	"value"
];

export interface SharedProps {
	elem_id?: string;
	elem_classes: string[];
	components?: string[];
	server_fns?: string[];
	interactive: boolean;
	visible: boolean | "hidden";
	id: number;
	container: boolean;
	target: HTMLElement;
	theme_mode: "light" | "dark" | "system";
	version: string;
	root: string;
	autoscroll: boolean;
	max_file_size: number | null;
	formatter: any; //I18nFormatter;
	client: Client;
	scale: number;
	min_width: number;
	padding: number;
	load_component: (
		arg0: string,
		arg1: "base" | "example" | "component"
	) => LoadingComponent; //component_loader;
	loading_status?: any;
	label: string;
	show_label: boolean;
	validation_error?: string | null;
	theme?: "light" | "dark";
	show_progress: boolean;
	api_prefix: string;
	server: ServerFunctions;
	attached_events?: string[];
}

export type LoadingComponent = Promise<{
	default: Component;
}>;

export const GRADIO_ROOT = "GRADIO_ROOT";

export interface ValueData {
	value: any;
	is_value_data: boolean;
}

export interface SelectData {
	row_value?: any[];
	col_value?: any[];
	index: number | [number, number];
	value: any;
	selected?: boolean;
}

export interface LikeData {
	index: number | [number, number];
	value: any;
	liked?: boolean | string;
}

export interface KeyUpData {
	key: string;
	input_value: string;
}

export interface ShareData {
	description: string;
	title?: string;
}

export interface CopyData {
	value: string;
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

export type component_loader = (args: Args) => {
	component: {
		default: ComponentType<SvelteComponent>;
	};
};

export type load_component = (
	name: string,
	variant: "component" | "example" | "base"
) => LoadingComponent;

const is_browser = typeof window !== "undefined";

export type ServerFunctions = Record<string, (...args: any[]) => Promise<any>>;

export const allowed_shared_props: (keyof SharedProps)[] = [
	"elem_id",
	"elem_classes",
	"visible",
	"interactive",
	"server_fns",
	"server",
	"id",
	"target",
	"theme_mode",
	"version",
	"root",
	"autoscroll",
	"max_file_size",
	"formatter",
	"client",
	"load_component",
	"scale",
	"min_width",
	"theme",
	"padding",
	"loading_status",
	"label",
	"show_label",
	"validation_error",
	"show_progress",
	"api_prefix",
	"container",
	"attached_events"
] as const;

export type I18nFormatter = any;

export function has_i18n_marker(value: unknown): value is string {
	return typeof value === "string" && value.includes(I18N_MARKER);
}

export function translate_i18n_marker(
	value: string,
	translate: (key: string) => string
): string {
	const start = value.indexOf(I18N_MARKER);
	if (start === -1) return value;

	const json_start = start + I18N_MARKER.length;
	const json_end = value.indexOf("}", json_start) + 1;
	if (json_end === 0) return value;

	try {
		const metadata = JSON.parse(value.slice(json_start, json_end));
		if (metadata?.key) {
			const translated = translate(metadata.key);
			const result = translated !== metadata.key ? translated : metadata.key;
			return value.slice(0, start) + result + value.slice(json_end);
		}
	} catch {}

	return value;
}

export class Gradio<T extends object = {}, U extends object = {}> {
	load_component: load_component;
	shared: SharedProps = $state<SharedProps>({} as SharedProps) as SharedProps;
	props = $state<U>({} as U) as U;
	i18n: I18nFormatter = $state<any>({}) as any;
	translatable_props: Record<string, string> = {};
	dispatcher!: Function;
	last_update: ReturnType<typeof tick> | null = null;
	shared_props: (keyof SharedProps)[] = allowed_shared_props;

	constructor(
		_props: { shared_props: SharedProps; props: U },
		default_values?: Partial<U>
	) {
		for (const key in _props.shared_props) {
			// @ts-ignore i'm not doing pointless typescript gymanstics
			this.shared[key] = _props.shared_props[key];
		}
		for (const key in _props.props) {
			// @ts-ignore same here
			this.props[key] = _props.props[key];
		}

		if (default_values) {
			for (const key in default_values) {
				// @ts-ignore same here

				if (this.props[key as keyof U] === undefined) {
					this.props[key] = default_values[key as keyof U];
				}
			}
		}
		// @ts-ignore same here
		this.i18n = this.props.i18n;

		for (const key of TRANSLATABLE_PROPS) {
			// @ts-ignore
			this.shared[key] = this._translate_and_store(
				"shared",
				key,
				_props.shared_props[key]
			);
			// @ts-ignore
			this.props[key] = this._translate_and_store(
				"props",
				key,
				_props.props[key]
			);
		}

		this.load_component = this.shared.load_component;

		if (!is_browser || _props.props?.__GRADIO_BROWSER_TEST__) {
			// Provide a no-op dispatcher for test environments
			this.dispatcher = () => {};
			return;
		}
		const { register, dispatcher } = getContext<{
			register: (
				id: number,
				set_data: (data: U & SharedProps) => void,
				get_data: Function
			) => void;
			dispatcher: Function;
		}>(GRADIO_ROOT);

		register(
			_props.shared_props.id,
			this.set_data.bind(this),
			this.get_data.bind(this)
		);

		this.dispatcher = dispatcher;

		$effect(() => {
			// Need to update the props here
			// otherwise UI won't reflect latest state from render
			for (const key in _props.shared_props) {
				if (this._is_i18n_managed(`shared.${key}`, _props.shared_props[key]))
					continue;
				// @ts-ignore i'm not doing pointless typescript gymanstics
				this.shared[key] = _props.shared_props[key];
			}
			for (const key in _props.props) {
				if (this._is_i18n_managed(`props.${key}`, _props.props[key])) continue;
				// @ts-ignore same here
				this.props[key] = _props.props[key];
			}
			register(
				_props.shared_props.id,
				this.set_data.bind(this),
				this.get_data.bind(this)
			);
			untrack(() => {
				this.shared.id = _props.shared_props.id;
			});
		});

		// retranslate props when locale changes
		if (Object.keys(this.translatable_props).length > 0) {
			locale.subscribe(() => {
				for (const [full_key, original] of Object.entries(this.translatable_props)) {
					const [target, key] = full_key.split(".");
					const translated = this.i18n(original);
					// @ts-ignore
					if (target === "shared") this.shared[key] = translated;
					// @ts-ignore
					else this.props[key] = translated;
				}
			});
		}
	}

	// check if props are translatable
	_is_i18n_managed(key: string, new_value: unknown): boolean {
		const original_marker = this.translatable_props[key];
		if (!original_marker) return false;
		if (new_value === original_marker) return true;
		// if value has changed then remove key
		delete this.translatable_props[key];
		return false;
	}

	_translate_and_store(target: "shared" | "props", key: string, value: unknown): unknown {
		if (typeof value !== "string") return value;
		const translated = this.i18n(value);
		if (translated !== value) {
			this.translatable_props[`${target}.${key}`] = value;
		}
		return translated;
	}

	dispatch<E extends keyof T>(event_name: E, data?: T[E]): void {
		this.dispatcher(this.shared.id, event_name, data);
	}

	async get_data() {
		return $state.snapshot(this.props);
	}

	update(data: Partial<U & SharedProps>): void {
		this.set_data(data as U & SharedProps);
	}

	set_data(data: Partial<U & SharedProps>): void {
		for (const key in data) {
			if (this.shared_props.includes(key as keyof SharedProps)) {
				const _key = key as keyof SharedProps;
				// @ts-ignore i'm not doing pointless typescript gymanstics

				this.shared[_key] = this._translate_and_store(
					"shared",
					key,
					data[_key]
				);

				continue;
			}
			// @ts-ignore
			this.props[key] = this._translate_and_store("props", key, data[key]);
		}
	}
}

// function _load_component(
// 	this: Gradio,
// 	name: string,
// 	variant: "component" | "example" | "base" = "component"
// ): ReturnType<component_loader> {
// 	return this._load_component!({
// 		name,
// 		api_url: this.shared.client.config?.root!,
// 		variant
// 	});
// }

export const css_units = (dimension_value: string | number): string => {
	return typeof dimension_value === "number"
		? dimension_value + "px"
		: dimension_value;
};

export function should_show_scroll_fade(
	container: HTMLElement | null
): boolean {
	if (!container) return false;
	const has_overflow = container.scrollHeight > container.clientHeight;
	const at_bottom =
		container.scrollTop >= container.scrollHeight - container.clientHeight - 1;
	return has_overflow && !at_bottom;
}

type MappedProps<T> = { [K in keyof T]: T[K] };
type MappedProp<T, K extends keyof T> = { [P in K]: T[P] };
