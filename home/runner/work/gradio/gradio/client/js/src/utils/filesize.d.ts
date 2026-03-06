type SPEC = {
    readonly radix: number;
    readonly unit: string[];
};
export declare const SPECS: Record<string, SPEC>;
/**
 * file size from https://github.com/hustcc/filesize.js
 * @param bytes - The number of bytes to convert to human-readable format
 * @param fixed - Number of decimal places to display (default: 1)
 * @param spec - Size specification to use: "si", "iec", or "jedec" (default: "jedec")
 * @returns Human-readable file size string
 */
export declare function filesize(bytes: number, fixed?: number, spec?: string): string;
export {};
