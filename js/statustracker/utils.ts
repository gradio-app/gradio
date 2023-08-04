export function pretty_si(num: number): string {
	let units = ["", "k", "M", "G", "T", "P", "E", "Z"];
	let i = 0;
	while (num > 1000 && i < units.length - 1) {
		num /= 1000;
		i++;
	}
	let unit = units[i];
	return (Number.isInteger(num) ? num : num.toFixed(1)) + unit;
}
