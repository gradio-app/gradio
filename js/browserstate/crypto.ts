import CryptoJS from "crypto-js";

export function encrypt(data: string, key: string): string {
	const hashedKey = CryptoJS.SHA256(key).toString();
	const iv = CryptoJS.lib.WordArray.random(16);
	const encrypted = CryptoJS.AES.encrypt(data, hashedKey, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});

	const ivString = CryptoJS.enc.Base64.stringify(iv);
	const cipherString = encrypted.toString();
	return ivString + ":" + cipherString;
}

export function decrypt(encryptedData: string, key: string): string {
	const hashedKey = CryptoJS.SHA256(key).toString();
	const [ivString, cipherString] = encryptedData.split(":");
	const iv = CryptoJS.enc.Base64.parse(ivString);
	const decrypted = CryptoJS.AES.decrypt(cipherString, hashedKey, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});

	return decrypted.toString(CryptoJS.enc.Utf8);
}
