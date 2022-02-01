import { Readable } from 'svelte/store';
interface SpringOpts {
    stiffness?: number;
    damping?: number;
    precision?: number;
}
interface SpringUpdateOpts {
    hard?: any;
    soft?: string | number | boolean;
}
declare type Updater<T> = (target_value: T, value: T) => T;
export interface Spring<T> extends Readable<T> {
    set: (new_value: T, opts?: SpringUpdateOpts) => Promise<void>;
    update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
    precision: number;
    damping: number;
    stiffness: number;
}
export declare function spring<T = any>(value?: T, opts?: SpringOpts): Spring<T>;
export {};
