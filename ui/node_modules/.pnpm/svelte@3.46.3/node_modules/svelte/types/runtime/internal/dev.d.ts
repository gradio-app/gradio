import { SvelteComponent } from './Component';
export declare function dispatch_dev<T = any>(type: string, detail?: T): void;
export declare function append_dev(target: Node, node: Node): void;
export declare function append_hydration_dev(target: Node, node: Node): void;
export declare function insert_dev(target: Node, node: Node, anchor?: Node): void;
export declare function insert_hydration_dev(target: Node, node: Node, anchor?: Node): void;
export declare function detach_dev(node: Node): void;
export declare function detach_between_dev(before: Node, after: Node): void;
export declare function detach_before_dev(after: Node): void;
export declare function detach_after_dev(before: Node): void;
export declare function listen_dev(node: Node, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | EventListenerOptions, has_prevent_default?: boolean, has_stop_propagation?: boolean): () => void;
export declare function attr_dev(node: Element, attribute: string, value?: string): void;
export declare function prop_dev(node: Element, property: string, value?: any): void;
export declare function dataset_dev(node: HTMLElement, property: string, value?: any): void;
export declare function set_data_dev(text: any, data: any): void;
export declare function validate_each_argument(arg: any): void;
export declare function validate_slots(name: any, slot: any, keys: any): void;
declare type Props = Record<string, any>;
export interface SvelteComponentDev {
    $set(props?: Props): void;
    $on(event: string, callback: (event: any) => void): () => void;
    $destroy(): void;
    [accessor: string]: any;
}
interface IComponentOptions<Props extends Record<string, any> = Record<string, any>> {
    target: Element | ShadowRoot;
    anchor?: Element;
    props?: Props;
    context?: Map<any, any>;
    hydrate?: boolean;
    intro?: boolean;
    $$inline?: boolean;
}
/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */
export declare class SvelteComponentDev extends SvelteComponent {
    /**
     * @private
     * For type checking capabilities only.
     * Does not exist at runtime.
     * ### DO NOT USE!
     */
    $$prop_def: Props;
    /**
     * @private
     * For type checking capabilities only.
     * Does not exist at runtime.
     * ### DO NOT USE!
     */
    $$events_def: any;
    /**
     * @private
     * For type checking capabilities only.
     * Does not exist at runtime.
     * ### DO NOT USE!
     */
    $$slot_def: any;
    constructor(options: IComponentOptions);
    $capture_state(): void;
    $inject_state(): void;
}
export interface SvelteComponentTyped<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any> {
    $set(props?: Partial<Props>): void;
    $on<K extends Extract<keyof Events, string>>(type: K, callback: (e: Events[K]) => void): () => void;
    $destroy(): void;
    [accessor: string]: any;
}
/**
 * Base class to create strongly typed Svelte components.
 * This only exists for typing purposes and should be used in `.d.ts` files.
 *
 * ### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import { SvelteComponentTyped } from "svelte";
 * export class MyComponent extends SvelteComponentTyped<{foo: string}> {}
 * ```
 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
 * to provide intellisense and to use the component like this in a Svelte file
 * with TypeScript:
 * ```svelte
 * <script lang="ts">
 * 	import { MyComponent } from "component-library";
 * </script>
 * <MyComponent foo={'bar'} />
 * ```
 *
 * #### Why not make this part of `SvelteComponent(Dev)`?
 * Because
 * ```ts
 * class ASubclassOfSvelteComponent extends SvelteComponent<{foo: string}> {}
 * const component: typeof SvelteComponent = ASubclassOfSvelteComponent;
 * ```
 * will throw a type error, so we need to separate the more strictly typed class.
 */
export declare class SvelteComponentTyped<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any> extends SvelteComponentDev {
    /**
     * @private
     * For type checking capabilities only.
     * Does not exist at runtime.
     * ### DO NOT USE!
     */
    $$prop_def: Props;
    /**
     * @private
     * For type checking capabilities only.
     * Does not exist at runtime.
     * ### DO NOT USE!
     */
    $$events_def: Events;
    /**
     * @private
     * For type checking capabilities only.
     * Does not exist at runtime.
     * ### DO NOT USE!
     */
    $$slot_def: Slots;
    constructor(options: IComponentOptions<Props>);
}
export declare function loop_guard(timeout: any): () => void;
export {};
