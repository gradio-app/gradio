import {
	getQueriesForElement,
	prettyDOM,
	fireEvent as dtlFireEvent
} from "@testing-library/dom";
import { tick, mount, unmount } from "svelte";
import type { SvelteComponent, Component } from "svelte";

import type {
	queries,
	Queries,
	BoundFunction,
	EventType,
	FireObject
} from "@testing-library/dom";
import { spy, type Spy } from "tinyspy";
import { GRADIO_ROOT, allowed_shared_props } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";
import { get } from "svelte/store";
import { _ } from "svelte-i18n";

const containerCache = new Map();
const componentCache = new Set();

type ComponentType<T extends SvelteComponent, Props> = Component<Props>;

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

	const ComponentConstructor: ComponentType<T, Props> =
		//@ts-ignore
		Component.default || Component;

	const id = Math.floor(Math.random() * 1000000);

	const mockRegister = (): void => {};

	const mockDispatcher = (_id: number, event: string, data: any): void => {
		const e = new CustomEvent("gradio", {
			bubbles: true,
			detail: { data, id: _id, event }
		});
		target.dispatchEvent(e);
	};

	const i18nFormatter = (s: string | null | undefined): string => s ?? "";

	const shared_props_obj: Record<string, any> = {
		id,
		target,
		theme_mode: "light" as const,
		version: "2.0.0",
		formatter: i18nFormatter,
		client: {} as any,
		load_component: () => Promise.resolve({ default: {} as any }),
		show_progress: true,
		api_prefix: "",
		server: {} as any,
		show_label: true
	};

	const component_props_obj: Record<string, any> = {
		i18n: i18nFormatter
	};

	if (props) {
		for (const key in props) {
			const value = (props as any)[key];
			if (allowed_shared_props.includes(key as any)) {
				shared_props_obj[key] = value;
			} else {
				component_props_obj[key] = value;
			}
		}
	}

	const componentProps = {
		shared_props: shared_props_obj,
		props: {
			...component_props_obj
		},
		...shared_props_obj
	};

	const component = mount(ComponentConstructor, {
		target,
		props: componentProps,
		context: new Map([
			[GRADIO_ROOT, { register: mockRegister, dispatcher: mockDispatcher }]
		])
	}) as T;

	containerCache.set(container, { target, component });
	componentCache.add(component);

	await tick();

	type event_name = string;

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
			if (componentCache.has(component)) {
				unmount(component);
			}
		},
		...getQueriesForElement(container),
		listen,
		wait_for_event
	};
}

const cleanupAtContainer = (container: HTMLElement): void => {
	const { target, component } = containerCache.get(container);

	if (componentCache.has(component)) {
		unmount(component);
	}

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
