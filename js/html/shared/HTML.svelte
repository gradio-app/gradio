<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import Handlebars from "handlebars";

	let {
		elem_classes = [],
		props = {},
		html_template = "${value}",
		css_template = "",
		js_on_load = null,
		visible = true,
		autoscroll = false,
		apply_default_css = true
	} = $props();

	let old_props = $state(props);

	const dispatch = createEventDispatcher<{
		event: { type: "click" | "submit"; data: any };
		update_value: { data: any; property: "value" | "label" | "visible" };
	}>();

	const trigger = (
		event_type: "click" | "submit",
		event_data: any = {}
	): void => {
		dispatch("event", { type: event_type, data: event_data });
	};

	let element: HTMLDivElement;
	let scrollable_parent: HTMLElement | null = null;
	let random_id = `html-${Math.random().toString(36).substring(2, 11)}`;
	let style_element: HTMLStyleElement | null = null;
	let reactiveProps: Record<string, any> = {};
	let currentHtml = $state("");
	let currentCss = $state("");
	let renderScheduled = $state(false);
	let mounted = $state(false);

	function get_scrollable_parent(element: HTMLElement): HTMLElement | null {
		let parent = element.parentElement;
		while (parent) {
			const style = window.getComputedStyle(parent);
			if (
				style.overflow === "auto" ||
				style.overflow === "scroll" ||
				style.overflowY === "auto" ||
				style.overflowY === "scroll"
			) {
				return parent;
			}
			parent = parent.parentElement;
		}
		return null;
	}

	function is_at_bottom(): boolean {
		if (!element) return true;
		if (!scrollable_parent) {
			return (
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 100
			);
		}
		return (
			scrollable_parent.offsetHeight + scrollable_parent.scrollTop >=
			scrollable_parent.scrollHeight - 100
		);
	}

	function scroll_to_bottom(): void {
		if (!element) return;
		if (scrollable_parent) {
			scrollable_parent.scrollTo(0, scrollable_parent.scrollHeight);
		} else {
			window.scrollTo(0, document.documentElement.scrollHeight);
		}
	}

	async function scroll_on_html_update(): Promise<void> {
		if (!autoscroll || !element) return;
		if (!scrollable_parent) {
			scrollable_parent = get_scrollable_parent(element);
		}
		if (is_at_bottom()) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			scroll_to_bottom();
		}
	}

	function render_template(
		template: string,
		props: Record<string, any>
	): string {
		try {
			const handlebarsTemplate = Handlebars.compile(template);
			const handlebarsRendered = handlebarsTemplate(props);

			const propKeys = Object.keys(props);
			const propValues = Object.values(props);
			const templateFunc = new Function(
				...propKeys,
				`return \`${handlebarsRendered}\`;`
			);
			return templateFunc(...propValues);
		} catch (e) {
			console.error("Error evaluating template:", e);
			return "--- Error rendering template ---";
		}
	}

	function update_css(): void {
		if (typeof document === "undefined") return;
		if (!style_element) {
			style_element = document.createElement("style");
			document.head.appendChild(style_element);
		}
		currentCss = render_template(css_template, reactiveProps);
		if (currentCss) {
			style_element.textContent = `#${random_id} { ${currentCss} }`;
		} else {
			style_element.textContent = "";
		}
	}

	function updateDOM(oldHtml: string, newHtml: string): void {
		if (!element || oldHtml === newHtml) return;

		const tempContainer = document.createElement("div");
		tempContainer.innerHTML = newHtml;

		const oldNodes = Array.from(element.childNodes);
		const newNodes = Array.from(tempContainer.childNodes);

		const maxLength = Math.max(oldNodes.length, newNodes.length);

		for (let i = 0; i < maxLength; i++) {
			const oldNode = oldNodes[i];
			const newNode = newNodes[i];

			if (!oldNode && newNode) {
				element.appendChild(newNode.cloneNode(true));
			} else if (oldNode && !newNode) {
				element.removeChild(oldNode);
			} else if (oldNode && newNode) {
				updateNode(oldNode, newNode);
			}
		}
	}

	// eslint-disable-next-line complexity
	function updateNode(oldNode: Node, newNode: Node): void {
		if (
			oldNode.nodeType === Node.TEXT_NODE &&
			newNode.nodeType === Node.TEXT_NODE
		) {
			if (oldNode.textContent !== newNode.textContent) {
				oldNode.textContent = newNode.textContent;
			}
			return;
		}

		if (
			oldNode.nodeType === Node.ELEMENT_NODE &&
			newNode.nodeType === Node.ELEMENT_NODE
		) {
			const oldElement = oldNode as Element;
			const newElement = newNode as Element;

			if (oldElement.tagName !== newElement.tagName) {
				oldNode.parentNode?.replaceChild(newNode.cloneNode(true), oldNode);
				return;
			}

			const oldAttrs = Array.from(oldElement.attributes);
			const newAttrs = Array.from(newElement.attributes);

			for (const attr of oldAttrs) {
				if (!newElement.hasAttribute(attr.name)) {
					oldElement.removeAttribute(attr.name);
				}
			}

			for (const attr of newAttrs) {
				if (oldElement.getAttribute(attr.name) !== attr.value) {
					oldElement.setAttribute(attr.name, attr.value);

					if (
						attr.name === "value" &&
						(oldElement.tagName === "INPUT" ||
							oldElement.tagName === "TEXTAREA" ||
							oldElement.tagName === "SELECT")
					) {
						(
							oldElement as
								| HTMLInputElement
								| HTMLTextAreaElement
								| HTMLSelectElement
						).value = attr.value;
					}
				}
			}

			const oldChildren = Array.from(oldElement.childNodes);
			const newChildren = Array.from(newElement.childNodes);
			const maxChildren = Math.max(oldChildren.length, newChildren.length);

			for (let i = 0; i < maxChildren; i++) {
				const oldChild = oldChildren[i];
				const newChild = newChildren[i];

				if (!oldChild && newChild) {
					oldElement.appendChild(newChild.cloneNode(true));
				} else if (oldChild && !newChild) {
					oldElement.removeChild(oldChild);
				} else if (oldChild && newChild) {
					updateNode(oldChild, newChild);
				}
			}
		} else {
			oldNode.parentNode?.replaceChild(newNode.cloneNode(true), oldNode);
		}
	}

	function renderHTML(): void {
		console.trace(
			"re-rendering HTML with props:",
			JSON.stringify(reactiveProps)
		);
		const newHtml = render_template(html_template, reactiveProps);
		if (element) {
			updateDOM(currentHtml, newHtml);
		}
		currentHtml = newHtml;
		if (autoscroll) {
			scroll_on_html_update();
		}
	}

	function scheduleRender(): void {
		if (!renderScheduled) {
			renderScheduled = true;
			queueMicrotask(() => {
				renderScheduled = false;
				renderHTML();
				update_css();
			});
		}
	}

	// Mount effect
	$effect(() => {
		if (!element || mounted) return;
		mounted = true;

		reactiveProps = new Proxy(
			{ ...props },
			{
				set(target, property, value) {
					const oldValue = target[property as string];
					target[property as string] = value;

					if (oldValue !== value) {
						scheduleRender();

						if (
							property === "value" ||
							property === "label" ||
							property === "visible"
						) {
							props[property] = value;
							old_props[property] = value;
							dispatch("update_value", { data: value, property });
						}
					}
					return true;
				}
			}
		);

		currentHtml = render_template(html_template, reactiveProps);
		element.innerHTML = currentHtml;
		update_css();

		if (autoscroll) {
			scroll_to_bottom();
		}
		scroll_on_html_update();

		if (js_on_load && element) {
			try {
				const func = new Function("element", "trigger", "props", js_on_load);
				func(element, trigger, reactiveProps);
			} catch (error) {
				console.error("Error executing js_on_load:", error);
			}
		}
	});

	// Props update effect
	$effect(() => {
		if (
			reactiveProps &&
			props &&
			JSON.stringify(old_props) !== JSON.stringify(props)
		) {
			for (const key in props) {
				if (reactiveProps[key] !== props[key]) {
					reactiveProps[key] = props[key];
				}
			}
			old_props = props;
		}
	});
</script>

<div
	bind:this={element}
	id={random_id}
	class="{apply_default_css ? 'prose gradio-style' : ''} {elem_classes.join(
		' '
	)}"
	class:hide={!visible}
></div>

<style>
	.hide {
		display: none;
	}
</style>
