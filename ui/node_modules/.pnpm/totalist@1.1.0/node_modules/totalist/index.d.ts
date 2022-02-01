declare module 'totalist' {
	import { Stats } from 'fs';
	export type Caller = (relPath: string, absPath: string, stats: Stats) => any;
	function totalist(dir: string, callback: Caller, prefix?: string): Promise<void>;
	export = totalist;
}

declare module 'totalist/sync' {
	import { Stats } from 'fs';
	export type Caller = (relPath: string, absPath: string, stats: Stats) => any;
	function totalist(dir: string, callback: Caller, prefix?: string): void;
	export = totalist;
}
