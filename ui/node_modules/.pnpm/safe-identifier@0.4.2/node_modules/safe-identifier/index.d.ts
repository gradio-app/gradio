/**
 * Sanitize a string for use as an identifier name
 *
 * Replaces invalid character sequences with _ and may add a _ prefix if the
 * resulting name would conflict with a JavaScript reserved name.
 *
 * @param key The desired identifier name
 * @param unique Append a hash of the key to the result
 */
export declare function identifier(key: string, unique?: boolean): string

/**
 * Sanitize a string for use as a property name
 *
 * By default uses `obj.key` notation, falling back to `obj["key"]` if the key
 * contains invalid characters or is an ECMAScript 3rd Edition reserved word
 * (required by IE8).
 *
 * @param obj If empty, returns only the possibly quoted key
 * @param key The property name
 */
export function property(obj: string | null | undefined, key: string): string
