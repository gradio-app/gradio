import { Readable } from 'svelte/store';
interface Options<T> {
    delay?: number;
    duration?: number | ((from: T, to: T) => number);
    easing?: (t: number) => number;
    interpolate?: (a: T, b: T) => (t: number) => T;
}
declare type Updater<T> = (target_value: T, value: T) => T;
export interface Tweened<T> extends Readable<T> {
    set(value: T, opts?: Options<T>): Promise<void>;
    update(updater: Updater<T>, opts?: Options<T>): Promise<void>;
}
export declare function tweened<T>(value?: T, defaults?: Options<T>): Tweened<T>;
export {};
