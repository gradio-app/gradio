export interface I18nData {
    __type__: "translation_metadata";
    key: string;
}
export type Lang = {
    [key: string]: Record<string, string> | string;
};
export interface LangsRecord {
    [lang: string]: {
        type: "lazy";
        data: () => Promise<Lang>;
    } | {
        type: "static";
        data: Lang;
    };
}
export declare function is_translation_metadata(obj: any): obj is I18nData;
export declare function translate_if_needed(value: any): string;
export declare function process_langs(): LangsRecord;
export declare const language_choices: [string, string][];
export declare let all_common_keys: Set<string>;
export declare function setupi18n(custom_translations?: Record<string, Record<string, string>>): Promise<void>;
export declare function changeLocale(new_locale: string): void;
export declare function get_initial_locale(browser_locale: string | null, available_locales: string[], fallback_locale?: string): string;
export declare function load_translations(translations: {
    processed_langs: LangsRecord;
    custom_translations: Record<string, Record<string, string>>;
}): void;
