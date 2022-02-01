/**
 * INTERNAL, DO NOT USE. Code may change at any time.
 */
export interface Fragment {
    key: string | null;
    first: null;
    c: () => void;
    l: (nodes: any) => void;
    h: () => void;
    m: (target: HTMLElement, anchor: any) => void;
    p: (ctx: any, dirty: any) => void;
    r: () => void;
    f: () => void;
    a: () => void;
    i: (local: any) => void;
    o: (local: any) => void;
    d: (detaching: 0 | 1) => void;
}
interface T$$ {
    dirty: number[];
    ctx: null | any;
    bound: any;
    update: () => void;
    callbacks: any;
    after_update: any[];
    props: Record<string, 0 | string>;
    fragment: null | false | Fragment;
    not_equal: any;
    before_update: any[];
    context: Map<any, any>;
    on_mount: any[];
    on_destroy: any[];
    skip_bound: boolean;
    on_disconnect: any[];
    root: Element | ShadowRoot;
}
export declare function bind(component: any, name: any, callback: any): void;
export declare function create_component(block: any): void;
export declare function claim_component(block: any, parent_nodes: any): void;
export declare function mount_component(component: any, target: any, anchor: any, customElement: any): void;
export declare function destroy_component(component: any, detaching: any): void;
export declare function init(component: any, options: any, instance: any, create_fragment: any, not_equal: any, props: any, append_styles: any, dirty?: number[]): void;
export declare let SvelteElement: any;
/**
 * Base class for Svelte components. Used when dev=false.
 */
export declare class SvelteComponent {
    $$: T$$;
    $$set?: ($$props: any) => void;
    $destroy(): void;
    $on(type: any, callback: any): () => void;
    $set($$props: any): void;
}
export {};
