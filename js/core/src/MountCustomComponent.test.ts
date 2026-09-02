import { waitFor } from "@testing-library/dom";
import { afterEach, expect, test, vi } from "vitest";
import { createRawSnippet, mount, unmount } from "svelte";

import AsyncChildren from "./AsyncChildren.test.svelte";
import MountCustomComponent from "./MountCustomComponent.svelte";

let mounted: Record<string, never> | undefined;

afterEach(async () => {
	if (mounted) {
		await unmount(mounted);
		mounted = undefined;
	}
	document.body.innerHTML = "";
});

test("renders host children from an async custom-component block", async () => {
	const runtime_create_raw_snippet = vi.fn(createRawSnippet);
	const children = createRawSnippet(() => ({
		render: () => "<button>Child button</button>"
	}));

	mounted = mount(MountCustomComponent, {
		target: document.body,
		props: {
			node: {
				component: Promise.resolve({ default: AsyncChildren }),
				runtime: Promise.resolve({
					createRawSnippet: runtime_create_raw_snippet,
					mount,
					unmount
				}),
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
		expect(document.querySelector("button")).toHaveTextContent("Child button");
	});
	expect(runtime_create_raw_snippet).toHaveBeenCalledOnce();
});
