import { noop } from './utils';
import { AnimationConfig } from '../animate';
declare type PositionRect = DOMRect | ClientRect;
declare type AnimationFn = (node: Element, { from, to }: {
    from: PositionRect;
    to: PositionRect;
}, params: any) => AnimationConfig;
export declare function create_animation(node: Element & ElementCSSInlineStyle, from: PositionRect, fn: AnimationFn, params: any): typeof noop;
export declare function fix_position(node: Element & ElementCSSInlineStyle): void;
export declare function add_transform(node: Element & ElementCSSInlineStyle, a: PositionRect): void;
export {};
