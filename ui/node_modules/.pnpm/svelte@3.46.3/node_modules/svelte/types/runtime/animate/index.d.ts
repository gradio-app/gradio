export interface AnimationConfig {
    delay?: number;
    duration?: number;
    easing?: (t: number) => number;
    css?: (t: number, u: number) => string;
    tick?: (t: number, u: number) => void;
}
export interface FlipParams {
    delay?: number;
    duration?: number | ((len: number) => number);
    easing?: (t: number) => number;
}
export declare function flip(node: Element, { from, to }: {
    from: DOMRect;
    to: DOMRect;
}, params?: FlipParams): AnimationConfig;
