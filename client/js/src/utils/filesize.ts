type SPEC = {
	readonly radix: number;
	readonly unit: string[];
};

const si = {
	radix: 1e3,
	unit: ["b", "kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"]
};
const iec = {
	radix: 1024,
	unit: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"]
};
const jedec = {
	radix: 1024,
	unit: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"]
};

export const SPECS: Record<string, SPEC> = {
	si,
	iec,
	jedec
};

/**
 * file size from https://github.com/hustcc/filesize.js
 * @param bytes - The number of bytes to convert to human-readable format
 * @param fixed - Number of decimal places to display (default: 1)
 * @param spec - Size specification to use: "si", "iec", or "jedec" (default: "jedec")
 * @returns Human-readable file size string
 */
export function filesize(bytes: number, fixed = 1, spec = "jedec"): string {
	bytes = Math.abs(bytes);
	const { radix, unit } = SPECS[spec] || SPECS.jedec;
	let loop = 0;
	while (bytes >= radix) {
		bytes /= radix;
		++loop;
	}
	return `${bytes.toFixed(fixed)} ${unit[loop]}`;
}
