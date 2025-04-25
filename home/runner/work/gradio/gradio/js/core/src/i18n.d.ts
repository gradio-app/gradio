type LangsRecord = Record<string, {
    [key: string]: any;
}>;
export declare function process_langs(): LangsRecord;
export declare const language_choices: [string, string][];
export declare let all_common_keys: Set<string>;
export declare function setupi18n(): Promise<void>;
export declare function changeLocale(new_locale: string): void;
export {};
