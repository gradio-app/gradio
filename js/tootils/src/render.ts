import {
	getQueriesForElement,
	prettyDOM,
	fireEvent as dtlFireEvent
} from "@testing-library/dom";
import { tick } from "svelte";
import type { SvelteComponent } from "svelte";

import type {
	queries,
	Queries,
	BoundFunction,
	EventType,
	FireObject
} from "@testing-library/dom";
import { spy, type Spy } from "tinyspy";
import { Gradio } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";

const containerCache = new Map();
const componentCache = new Set();

type ComponentType<T extends SvelteComponent, Props> = new (args: {
	target: any;
	props?: Props;
}) => T;

export type RenderResult<
	C extends SvelteComponent,
	Q extends Queries = typeof queries
> = {
	container: HTMLElement;
	component: C;
	debug: (el?: HTMLElement | DocumentFragment) => void;
	unmount: () => void;
} & { [P in keyof Q]: BoundFunction<Q[P]> };

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete" as LoadingStatus["status"],
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

export interface RenderOptions<Q extends Queries = typeof queries> {
	container?: HTMLElement;
	queries?: Q;
}

export async function render<
	Events extends Record<string, any>,
	Props extends Record<string, any>,
	T extends SvelteComponent<Props, Events>,
	X extends Record<string, any>
>(
	Component: ComponentType<T, Props> | { default: ComponentType<T, Props> },
	props?: Omit<Props, "gradio" | "loading_status"> & {
		loading_status?: LoadingStatus;
	},
	_container?: HTMLElement
): Promise<
	RenderResult<T> & {
		listen: typeof listen;
		wait_for_event: typeof wait_for_event;
	}
> {
	let container: HTMLElement;
	if (!_container) {
		container = document.body;
	} else {
		container = _container;
	}

	const target = container.appendChild(document.createElement("div"));

	const ComponentConstructor: ComponentType<
		T,
		Props & { gradio: typeof Gradio<X> }
	> =
		//@ts-ignore
		Component.default || Component;

	const id = Math.floor(Math.random() * 1000000);

	const component = new ComponentConstructor({
		target,
		//@ts-ignore
		props: {
			loading_status,
			...(props || {}),
			//@ts-ignore
			gradio: new Gradio(
				id,
				target,
				"light",
				"2.0.0",
				"http://localhost:8000",
				false,
				null,
				//@ts-ignore
				(s) => s,
				// @ts-ignore
				{ client: {} },
				() => {}
			)
		}
	});

	containerCache.set(container, { target, component });
	componentCache.add(component);

	component.$$.on_destroy.push(() => {
		componentCache.delete(component);
	});

	await tick();

	type extractGeneric<Type> = Type extends Gradio<infer X> ? X : null;
	type event_name = keyof extractGeneric<Props["gradio"]>;

	function listen(event: event_name): Spy {
		const mock = spy();
		target.addEventListener("gradio", (e: Event) => {
			if (isCustomEvent(e)) {
				if (e.detail.event === event && e.detail.id === id) {
					mock(e);
				}
			}
		});

		return mock;
	}

	async function wait_for_event(event: event_name): Promise<Spy> {
		return new Promise((res) => {
			const mock = spy();
			target.addEventListener("gradio", (e: Event) => {
				if (isCustomEvent(e)) {
					if (e.detail.event === event && e.detail.id === id) {
						mock(e);
						res(mock);
					}
				}
			});
		});
	}

	return {
		container,
		component,
		//@ts-ignore
		debug: (el = container): void => console.warn(prettyDOM(el)),
		unmount: (): void => {
			if (componentCache.has(component)) component.$destroy();
		},
		...getQueriesForElement(container),
		listen,
		wait_for_event
	};
}

const cleanupAtContainer = (container: HTMLElement): void => {
	const { target, component } = containerCache.get(container);

	if (componentCache.has(component)) component.$destroy();

	if (target.parentNode === document.body) {
		document.body.removeChild(target);
	}

	containerCache.delete(container);
};

export function cleanup(): void {
	Array.from(containerCache.keys()).forEach(cleanupAtContainer);
}

export const fireEvent = Object.keys(dtlFireEvent).reduce((acc, key) => {
	const _key = key as EventType;
	return {
		...acc,
		[_key]: async (
			element: Document | Element | Window,
			options: object = {}
		): Promise<boolean> => {
			const event = dtlFireEvent[_key](element, options);
			await tick();
			return event;
		}
	};
}, {} as FireObject);

export type FireFunction = (
	element: Document | Element | Window,
	event: Event
) => Promise<boolean>;

export * from "@testing-library/dom";

function isCustomEvent(event: Event): event is CustomEvent {
	return "detail" in event;
}
