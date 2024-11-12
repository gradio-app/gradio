/**
 * Encrypts data using AES-GCM with a provided key
 */
export async function encrypt(data: string, key: string): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);
    const encodedKey = new TextEncoder().encode(key);
    
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encodedKey,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        cryptoKey,
        encodedData
    );

    const encryptedArray = new Uint8Array(encryptedData);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...result));
}

/**
 * Decrypts data using AES-GCM with a provided key
 */
export async function decrypt(encryptedData: string, key: string): Promise<string> {
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encryptedContent = data.slice(12);
    const encodedKey = new TextEncoder().encode(key);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encodedKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    const decryptedData = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        cryptoKey,
        encryptedContent
    );

    return new TextDecoder().decode(decryptedData);
} 