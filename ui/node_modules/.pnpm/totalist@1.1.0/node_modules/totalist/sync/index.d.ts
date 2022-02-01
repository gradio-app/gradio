import { Stats } from 'fs';
export type Caller = (relPath: string, absPath: string, stats: Stats) => any;
declare function totalist(dir: string, callback: Caller, prefix?: string): void;
export default totalist;
