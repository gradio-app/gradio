export declare function create_rule(node: Element & ElementCSSInlineStyle, a: number, b: number, duration: number, delay: number, ease: (t: number) => number, fn: (t: number, u: number) => string, uid?: number): string;
export declare function delete_rule(node: Element & ElementCSSInlineStyle, name?: string): void;
export declare function clear_rules(): void;
