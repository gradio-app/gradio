import { getByRole, getByText, waitFor } from "@testing-library/dom";
import { afterEach, expect, test, vi } from "vitest";
import { createRawSnippet, flushSync, mount, unmount } from "svelte";
import type { Component } from "svelte";

import MountCustomComponent from "./MountCustomComponent.svelte";
import MountCustomComponentHost from "./MountCustomComponentHost.test.svelte";
import NestedCustomComponentHost from "./NestedCustomComponentHost.test.svelte";

let mounted: Record<string, never> | undefined;
const runtime_frames: HTMLIFrameElement[] = [];

type AsyncChildrenRuntime = Pick<
	typeof import("svelte"),
	"createRawSnippet" | "mount" | "unmount"
> & { default: Component };

type RemountProbeRuntime = AsyncChildrenRuntime & { RemountProbe: Component };

type ContextRuntime = AsyncChildrenRuntime & {
	ContextConsumer: Component;
	ContextProvider: Component;
	getAllContexts: typeof import("svelte").getAllContexts;
};

async function load_async_children_runtime(): Promise<AsyncChildrenRuntime> {
	const runtime_frame = document.createElement("iframe");
	runtime_frame.hidden = true;
	runtime_frames.push(runtime_frame);

	const runtime = new Promise<AsyncChildrenRuntime>((resolve) => {
		const handle_message = (event: MessageEvent) => {
			if (
				event.source !== runtime_frame.contentWindow ||
				event.data !== "async-children-runtime-ready"
			) {
				return;
			}

			window.removeEventListener("message", handle_message);
			resolve(
				(
					runtime_frame.contentWindow as Window & {
						async_children_runtime: AsyncChildrenRuntime;
					}
				).async_children_runtime
			);
		};

		window.addEventListener("message", handle_message);
	});

	runtime_frame.src = new URL(
		"./AsyncChildrenRuntime.fixture.html",
		import.meta.url
	).href;
	document.body.append(runtime_frame);

	return runtime;
}

afterEach(async () => {
	if (mounted) {
		await unmount(mounted);
		mounted = undefined;
	}
	runtime_frames.forEach((frame) => frame.remove());
	runtime_frames.length = 0;
	document.body.innerHTML = "";
});

test("renders host children from an isolated Svelte runtime", async () => {
	const runtime = (await load_async_children_runtime()) as RemountProbeRuntime;
	const children = createRawSnippet(() => ({
		render: () => "<button>Child button</button>"
	}));

	mounted = mount(MountCustomComponent, {
		target: document.body,
		props: {
			node: {
				component: Promise.resolve({ default: runtime.default }),
				runtime: Promise.resolve(runtime),
				props: {
					shared_props: {},
					props: {}
				}
			},
			children
		}
	});

	await waitFor(() => {
		expect(document.body).toHaveTextContent("hello");
		const button = getByRole(document.body, "button", {
			name: "Child button"
		});
		expect(button).toHaveTextContent("Child button");
		expect(button?.parentElement?.textContent).toContain("hello");

		const mount_target = button.parentElement?.parentElement;
		expect(mount_target?.tagName).toBe("GRADIO-CUSTOM-COMPONENT");
		expect(getComputedStyle(mount_target as HTMLElement).display).toBe(
			"contents"
		);
	});
});

test("does not remount an isolated component when its prop proxy updates", async () => {
	const runtime = (await load_async_children_runtime()) as RemountProbeRuntime;
	const on_mount = vi.fn();

	mounted = mount(MountCustomComponentHost, {
		target: document.body,
		props: {
			component: runtime.RemountProbe,
			runtime,
			on_mount
		}
	});

	await waitFor(() => expect(on_mount).toHaveBeenCalledOnce());
	flushSync(() => {
		(mounted as { update_value: (value: string) => void }).update_value(
			"updated"
		);
	});

	expect(on_mount).toHaveBeenCalledOnce();
});

test("preserves context across nested custom components", async () => {
	const provider_runtime =
		(await load_async_children_runtime()) as ContextRuntime;
	const consumer_runtime =
		(await load_async_children_runtime()) as ContextRuntime;

	mounted = mount(NestedCustomComponentHost, {
		target: document.body,
		props: {
			provider: provider_runtime.ContextProvider,
			consumer: consumer_runtime.ContextConsumer,
			provider_runtime,
			consumer_runtime
		}
	});

	await waitFor(() => {
		expect(
			getByText(document.body, "Context: provided by parent").textContent
		).toBe("Context: provided by parent");
	});
});
