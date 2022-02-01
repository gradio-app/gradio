export interface Processed {
    code: string;
    map?: string | object;
    dependencies?: string[];
    toString?: () => string;
}
export declare type MarkupPreprocessor = (options: {
    content: string;
    filename?: string;
}) => Processed | void | Promise<Processed | void>;
export declare type Preprocessor = (options: {
    /**
     * The script/style tag content
     */
    content: string;
    attributes: Record<string, string | boolean>;
    /**
     * The whole Svelte file content
     */
    markup: string;
    filename?: string;
}) => Processed | void | Promise<Processed | void>;
export interface PreprocessorGroup {
    markup?: MarkupPreprocessor;
    style?: Preprocessor;
    script?: Preprocessor;
}
