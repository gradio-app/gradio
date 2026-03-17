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
import { vi, type Mock } from "vitest";
import { GRADIO_ROOT, allowed_shared_props } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";
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
		listen: (event_name: string) => Mock;
		set_data: (data: Record<string, any>) => void;
		get_data: () => Promise<Record<string, any>>;
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

	let component_set_data: (data: Record<string, any>) => void;
	let component_get_data: () => Promise<Record<string, any>>;

	const mock_register = (
		_id: number,
		set_data: (data: Record<string, any>) => void,
		get_data: () => Promise<Record<string, any>>
	): void => {
		component_set_data = set_data;
		component_get_data = get_data;
	};

	const event_listeners = new Map<string, Set<(data: any) => void>>();

	function notify_listeners(event: string, data: any): void {
		const listeners = event_listeners.get(event);
		if (listeners) {
			for (const listener of listeners) {
				listener(data);
			}
		}
	}

	const dispatcher = (_id: number, event: string, data: any): void => {
		notify_listeners(event, data);
	};

	function listen(event_name: string): Mock {
		const fn = vi.fn();
		if (!event_listeners.has(event_name)) {
			event_listeners.set(event_name, new Set());
		}
		event_listeners.get(event_name)!.add(fn);
		return fn;
	}

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
		show_label: true,
		register_component: mock_register,
		dispatcher
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
		props: componentProps
	}) as T;

	containerCache.set(container, { target, component });
	componentCache.add(component);

	await tick();

	return {
		container,
		component,
		listen,
		set_data: (data: Record<string, any>) => component_set_data(data),
		get_data: () => component_get_data(),
		//@ts-ignore
		debug: (el = container): void => console.warn(prettyDOM(el)),
		unmount: (): void => {
			if (componentCache.has(component)) {
				unmount(component);
			}
		},
		...getQueriesForElement(container)
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
