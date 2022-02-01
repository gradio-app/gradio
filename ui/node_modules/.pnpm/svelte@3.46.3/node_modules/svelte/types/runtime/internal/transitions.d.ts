import { TransitionConfig } from '../transition';
import { Fragment } from './Component';
export declare function group_outros(): void;
export declare function check_outros(): void;
export declare function transition_in(block: Fragment, local?: 0 | 1): void;
export declare function transition_out(block: Fragment, local: 0 | 1, detach?: 0 | 1, callback?: any): void;
declare type TransitionFn = (node: Element, params: any) => TransitionConfig;
export declare function create_in_transition(node: Element & ElementCSSInlineStyle, fn: TransitionFn, params: any): {
    start(): void;
    invalidate(): void;
    end(): void;
};
export declare function create_out_transition(node: Element & ElementCSSInlineStyle, fn: TransitionFn, params: any): {
    end(reset: any): void;
};
export declare function create_bidirectional_transition(node: Element & ElementCSSInlineStyle, fn: TransitionFn, params: any, intro: boolean): {
    run(b: 0 | 1): void;
    end(): void;
};
export {};
