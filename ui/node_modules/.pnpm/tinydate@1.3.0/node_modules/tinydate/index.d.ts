declare module 'tinydate' {
	type Defaults = 'YYYY' | 'YY' | 'MM' | 'DD' | 'HH' | 'mm' | 'ss' | 'fff';
	export type Formatter = (date: Date) => string | number;
	export type Dictionary = Record<Defaults | string, Formatter>;

	function tinydate(template: string, dict?: Dictionary): (date?: Date) => string;
	export = tinydate;
}
