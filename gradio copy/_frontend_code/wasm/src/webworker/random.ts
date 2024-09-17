const charSet =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateRandomString(length: number): string {
	return Array.from(Array(length))
		.map(() => charSet[Math.floor(Math.random() * charSet.length)])
		.join("");
}
