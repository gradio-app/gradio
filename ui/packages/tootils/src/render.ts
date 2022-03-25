import { getQueriesForElement, prettyDOM } from "@testing-library/dom";
import type { SvelteComponentTyped } from "svelte";

const containerCache = new Map();
const componentCache = new Set();

type Component<T extends SvelteComponentTyped, Props> = new (args: {
	target: any;
	props?: Props;
}) => T;

function render<Events, Props, T extends SvelteComponentTyped<Props, Events>>(
	Component: Component<T, Props> | { default: Component<T, Props> },
	props?: Props
) {
	const container = document.body;
	const target = container.appendChild(document.createElement("div"));

	const ComponentConstructor: Component<T, Props> =
		//@ts-ignore
		Component.default || Component;

	const component = new ComponentConstructor({
		target,
		props
	});

	containerCache.set(container, { target, component });
	componentCache.add(component);

	component.$$.on_destroy.push(() => {
		componentCache.delete(component);
	});

	return {
		container,
		component,
		debug: (el = container) => console.log(prettyDOM(el)),
		unmount: () => {
			if (componentCache.has(component)) component.$destroy();
		},
		...getQueriesForElement(container)
	};
}

const cleanupAtContainer = (container: HTMLElement) => {
	const { target, component } = containerCache.get(container);

	if (componentCache.has(component)) component.$destroy();

	if (target.parentNode === document.body) {
		document.body.removeChild(target);
	}

	containerCache.delete(container);
};

const cleanup = () => {
	Array.from(containerCache.keys()).forEach(cleanupAtContainer);
};

export * from "@testing-library/dom";

export { render, cleanup };
export { fireEvent } from "@testing-library/svelte";
