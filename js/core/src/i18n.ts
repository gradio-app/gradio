import {
	addMessages,
	init,
	getLocaleFromNavigator,
	locale,
	_
} from "svelte-i18n";
import { formatter } from "./gradio_helper";
export { formatter };

import type { ComponentMeta } from "./types";

export const TRANSLATABLE_PROPS = [
	"label",
	"value",
	"placeholder",
	"title",
	"description"
];

export interface I18nComponentProps {
	[key: string]: any;
	__i18n_original_values?: {
		[prop: string]: string;
	};
}

const langs = import.meta.glob("./lang/*.json", {
	eager: true
});

type LangsRecord = Record<
	string,
	{
		[key: string]: any;
	}
>;

export function process_langs(): LangsRecord {
	let _langs: LangsRecord = {};

	for (const lang in langs) {
		const code = (lang.split("/").pop() as string).split(".").shift() as string;
		_langs[code] = (langs[lang] as Record<string, any>).default;
	}

	return _langs;
}

const processed_langs = process_langs();
const available_locales = Object.keys(processed_langs);

export const language_choices: [string, string][] = Object.entries(
	processed_langs
).map(([code, data]) => [data._name || code, code]);

export let all_common_keys: Set<string> = new Set();

export function load_translations(
	translations: LangsRecord | null | undefined
): void {
	if (!translations) {
		return;
	}

	for (const lang in translations) {
		addMessages(lang, translations[lang]);
	}
}

export function get_init_state(): boolean {
	return _i18n_initialized;
}
export function set_init_state(state: boolean): void {
	_i18n_initialized = state;
}

export function get_initial_locale(
	browser_locale: string | null,
	available_locales: string[],
	fallback_locale = "en"
): string {
	const normalized_locale = browser_locale?.split("-")[0];

	return normalized_locale && available_locales.includes(normalized_locale)
		? normalized_locale
		: fallback_locale;
}

let _i18n_initialized = false;

export async function init_i18n(
	initial_locale: string,
	fallback_locale = "en"
): Promise<void> {
	await init({
		fallbackLocale: fallback_locale,
		initialLocale: initial_locale
	});

	for (const lang_code in processed_langs) {
		if (
			processed_langs[lang_code] &&
			typeof processed_langs[lang_code] === "object" &&
			processed_langs[lang_code].common &&
			typeof processed_langs[lang_code].common === "object"
		) {
			const common_ns = processed_langs[lang_code].common;
			for (const key in common_ns) {
				all_common_keys.add(`common.${key}`);
			}
		}
	}
}

export async function setupi18n(
	custom_translations?: Record<string, Record<string, string>>
): Promise<void> {
	if (get_init_state()) {
		return;
	}

	try {
		load_translations(processed_langs);

		const browser_locale = getLocaleFromNavigator();
		const initial_locale = get_initial_locale(
			browser_locale,
			available_locales
		);

		await init_i18n(initial_locale);

		if (custom_translations) {
			load_translations(custom_translations);
		}

		set_init_state(true);
	} catch (error) {
		console.error("Error initializing i18n:", error);
	}
}

/**
 * Create a special translatable string object that preserves the original metadata key
 */
export interface TranslatableString {
	__i18n_key?: string;
	toString(): string;
	valueOf(): string;
}

// Store the original translation keys for component props
export const translationKeys = new WeakMap<object, Map<string, string>>();

/**
 * Get current locale with a synchronous approach
 */
export function get_locale(): string {
	let _locale = "en";
	locale.subscribe((value) => {
		_locale = value || "en";
	});
	return _locale;
}

/**
 * Extracts translation key from i18n metadata string
 */
function extractI18nKey(value: string): string | null {
	if (!value.startsWith("__i18n__")) return null;

	try {
		const jsonStr = value.substring("__i18n__".length);
		const data = JSON.parse(jsonStr);
		return data && data.key ? data.key : null;
	} catch (e) {
		return null;
	}
}

/**
 * Registers a translation key for a component property
 */
export function registerTranslation(obj: any, prop: string, key: string): void {
	if (!obj || typeof obj !== "object") return;

	// Get or create the property map for this object
	let propMap = translationKeys.get(obj);
	if (!propMap) {
		propMap = new Map<string, string>();
		translationKeys.set(obj, propMap);
	}

	// Store the translation key
	propMap.set(prop, key);
}

/**
 * Translates a string value, handling i18n metadata format
 * @param value Any value that might need translation
 * @param obj Optional parent object
 * @param prop Optional property name in the parent object
 * @returns The translated string
 */
export function translate_value(value: any, obj?: any, prop?: string): any {
	// Handle non-strings
	if (typeof value !== "string") {
		return value;
	}

	// Handle i18n metadata format strings from Python
	if (value.startsWith("__i18n__")) {
		const key = extractI18nKey(value);
		if (key) {
			// Store the key for future translations if obj and prop are provided
			if (obj && prop) {
				registerTranslation(obj, prop, key);

				// Store the original i18n string format to enable re-translation on locale changes
				if (!obj.__i18n_original_values) {
					obj.__i18n_original_values = {};
				}
				obj.__i18n_original_values[prop] = value;
			}
			return formatter(key);
		}
	}

	// Check if we have a stored original i18n string for this property
	if (
		obj &&
		prop &&
		obj.__i18n_original_values &&
		obj.__i18n_original_values[prop]
	) {
		const originalValue = obj.__i18n_original_values[prop];
		const key = extractI18nKey(originalValue);
		if (key) {
			return formatter(key);
		}
	}

	// Check if we have a registered translation key for this property
	if (obj && prop && translationKeys.has(obj)) {
		const propMap = translationKeys.get(obj);
		const key = propMap?.get(prop);
		if (key) {
			// Store the key in the original values map for future translations
			if (!obj.__i18n_original_values) {
				obj.__i18n_original_values = {};
			}
			obj.__i18n_original_values[prop] =
				`__i18n__${JSON.stringify({ __type__: "translation_metadata", key: key })}`;
			return formatter(key);
		}
	}

	// Return as is if no translation found
	return value;
}

/**
 * Recursively walks an object and translates any string values
 * @param obj Any object that might contain translatable strings
 * @param visited WeakMap to track already visited objects and prevent circular reference issues
 * @returns The same object with translated strings
 */
export function translate_object(obj: any, visited = new WeakMap()): any {
	if (obj === null || obj === undefined) {
		return obj;
	}

	// Handle primitive types
	if (typeof obj !== "object") {
		return typeof obj === "string" ? translate_value(obj) : obj;
	}

	// Handle circular references by tracking visited objects
	if (visited.has(obj)) {
		return visited.get(obj);
	}

	// Skip special objects that shouldn't be traversed
	if (
		obj instanceof Map ||
		obj instanceof Set ||
		obj instanceof Date ||
		obj instanceof RegExp ||
		obj instanceof Promise ||
		obj instanceof Function ||
		obj instanceof HTMLElement
	) {
		return obj;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		const result = [...obj];
		visited.set(obj, result);
		for (let i = 0; i < result.length; i++) {
			result[i] = translate_object(result[i], visited);
		}
		return result;
	}

	// Handle objects
	const result = { ...obj };
	visited.set(obj, result);

	// Skip certain properties that can cause circular references
	const skipProps = [
		"parent",
		"gradio",
		"__proto__",
		"constructor",
		"instance"
	];

	for (const key in result) {
		if (!skipProps.includes(key)) {
			result[key] = translate_object(result[key], visited);
		}
	}

	return result;
}

export function changeLocale(new_locale: string): void {
	locale.set(new_locale);
}

/**
 * Checks if a property has translation metadata or registered keys
 * @param props The component props object
 * @param prop The property name to check
 * @returns True if the property has translation data
 */
function has_translation_for_prop(
	props: I18nComponentProps,
	prop: string
): boolean {
	if (!props || props[prop] === undefined) return false;

	return !!(
		props.__i18n_original_values?.[prop] ||
		(translationKeys.has(props) && translationKeys.get(props)?.has(prop))
	);
}

/**
 * Translates tab labels in a tab component
 * @param tabs The array of tab items to translate
 * @returns Translated tab items
 */
function translate_tabs(tabs: any[]): any[] {
	return tabs.map((tab) => {
		if (tab && tab.label) {
			tab.label = translate_value(tab.label, tab, "label");
		}
		return tab;
	});
}

/**
 * Checks if a component's props contain any translatable properties
 * @param props The component props to check
 * @returns True if the component has any translatable properties
 */
export function has_translatable_props(props: I18nComponentProps): boolean {
	if (!props) return false;

	// Check if any translatable property has stored metadata
	return TRANSLATABLE_PROPS.some((prop) =>
		has_translation_for_prop(props, prop)
	);
}

/**
 * Translates a component's properties, handling special cases
 * @param component The component metadata object to translate
 */
export function translate_component_props(component: ComponentMeta): void {
	if (!component || !component.props) return;

	const props: I18nComponentProps = component.props;

	// Translate standard properties
	for (const prop of TRANSLATABLE_PROPS) {
		if (props[prop] !== undefined) {
			props[prop] = translate_value(props[prop], props, prop);
		}
	}

	// Handle special case for tabs
	if (component.type === "tabs" && props.initial_tabs) {
		props.initial_tabs = translate_tabs(props.initial_tabs);
	}
}

/**
 * Recursively translates a component tree
 * @param component The root component to start translation from
 * @returns The same component with translated strings
 */
export function translate_component_tree(
	component: ComponentMeta
): ComponentMeta {
	if (!component) return component;

	translate_component_props(component);

	if (component.children && Array.isArray(component.children)) {
		component.children.forEach(translate_component_tree);
	}

	return component;
}

/**
 * Creates an update transaction for a component property
 * @param component_id The component ID
 * @param prop The property name
 * @param value The property value
 * @returns Update transaction object
 */
function create_property_update(
	component_id: number,
	prop: string,
	value: any
): { id: number; prop: string; value: any } {
	return { id: component_id, prop, value };
}

/**
 * Generate update transactions for components that need re-translation
 * @param components Array of components to check for updates
 * @returns Array of update transactions
 */
export function create_translation_updates(
	components: ComponentMeta[]
): { id: number; prop: string; value: any }[] {
	return components
		.filter((c) => c.props)
		.flatMap((c) => {
			const updates = [];
			const props: I18nComponentProps = c.props;

			for (const prop of TRANSLATABLE_PROPS) {
				if (has_translation_for_prop(props, prop)) {
					updates.push(create_property_update(c.id, prop, props[prop]));
				}
			}

			if (c.type === "tabs" && props.initial_tabs) {
				updates.push(
					create_property_update(c.id, "initial_tabs", props.initial_tabs)
				);
			}

			return updates;
		});
}
