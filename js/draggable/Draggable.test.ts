import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";

import Draggable from "./Index.svelte";
import DraggableWithChildren from "./WithChildren.svelte";
import DraggableWithFormChildren from "./WithFormChildren.svelte";

const default_props = {
	orientation: "column" as const,
	show_progress: false,
	visible: true,
	elem_classes: [] as string[]
};

function item_order(container: HTMLElement): (string | null)[] {
	return Array.from(container.querySelectorAll("[data-testid^='item-']")).map(
		(el) => el.textContent?.replace("⋮⋮", "").trim() ?? null
	);
}

async function drag(from: HTMLElement, to: HTMLElement): Promise<void> {
	const handle = from.querySelector("[data-testid='drag-handle']")!;
	await fireEvent.dragStart(handle, { dataTransfer: new DataTransfer() });
	await fireEvent.dragEnter(to, { dataTransfer: new DataTransfer() });
	await fireEvent.drop(to, { dataTransfer: new DataTransfer() });
	await fireEvent.dragEnd(handle, { dataTransfer: new DataTransfer() });
}

describe("Draggable", () => {
	afterEach(() => cleanup());

	test("renders a labelled region for the draggable items", async () => {
		const { getByRole } = await render(Draggable, default_props);

		expect(
			getByRole("region", { name: "Draggable items container" })
		).toBeVisible();
	});

	test("renders its children", async () => {
		const { getByTestId } = await render(DraggableWithChildren, default_props);

		expect(getByTestId("item-a")).toBeVisible();
		expect(getByTestId("item-b")).toBeVisible();
		expect(getByTestId("item-c")).toBeVisible();
	});

	test("gives every child a drag handle", async () => {
		const { getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);

		await waitFor(() => {
			expect(getAllByTestId("drag-handle")).toHaveLength(3);
		});
	});

	test("drag handles are draggable and start un-grabbed", async () => {
		const { getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);

		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		for (const handle of getAllByTestId("drag-handle")) {
			expect(handle).toHaveAttribute("draggable", "true");
			expect(handle).toHaveAttribute("aria-grabbed", "false");
		}
	});

	test("handles are numbered in the order the children appear", async () => {
		const { getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);

		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		expect(
			getAllByTestId("drag-handle").map((h) => h.getAttribute("data-index"))
		).toEqual(["0", "1", "2"]);
	});

	test("adds no drag handles when it has no children", async () => {
		const { queryAllByTestId } = await render(Draggable, default_props);

		expect(queryAllByTestId("drag-handle")).toHaveLength(0);
	});
});

describe("Props: visible", () => {
	afterEach(() => cleanup());

	test("visible: true shows the container and its children", async () => {
		const { getByRole, getByTestId } = await render(DraggableWithChildren, {
			...default_props,
			visible: true
		});

		expect(getByRole("region")).toBeVisible();
		expect(getByTestId("item-a")).toBeVisible();
	});

	test("visible: false hides the container and its children", async () => {
		const { getByRole, getByTestId } = await render(DraggableWithChildren, {
			...default_props,
			visible: false
		});

		expect(getByRole("region", { hidden: true })).not.toBeVisible();
		expect(getByTestId("item-a")).not.toBeVisible();
	});

	test("visible: 'hidden' does NOT hide the container (Draggable uses !visible — 'hidden' is truthy)", async () => {
		// Draggable's template uses class:hide={!gradio.shared.visible}. "hidden" is
		// a non-empty string and therefore truthy, so !("hidden") === false and
		// .hide is never applied. This matches Row and the other bare layouts, and
		// differs from components that check === "hidden" explicitly.
		const { getByRole } = await render(DraggableWithChildren, {
			...default_props,
			visible: "hidden"
		});

		expect(getByRole("region")).toBeVisible();
	});
});

describe("Props: elem_id / elem_classes", () => {
	afterEach(() => cleanup());

	test("elem_id is applied to the container", async () => {
		const { container } = await render(Draggable, {
			...default_props,
			elem_id: "my-draggable"
		});

		expect(container.querySelector("#my-draggable")).not.toBeNull();
	});

	test("elem_classes are applied to the container", async () => {
		const { getByRole } = await render(Draggable, {
			...default_props,
			elem_classes: ["my-draggable-class"]
		});

		expect(getByRole("region")).toHaveClass("my-draggable-class");
	});

	test("missing elem_classes still renders the container", async () => {
		const { getByRole } = await render(Draggable, {
			orientation: "column",
			visible: true
		});

		expect(getByRole("region")).toBeVisible();
	});
});

describe("Props: show_progress", () => {
	afterEach(() => cleanup());

	test("never renders a status tracker, whatever show_progress is set to", async () => {
		// The template guards the StatusTracker on gradio.props.show_progress, but
		// show_progress is in allowed_shared_props, so it always lands on
		// gradio.shared and gradio.props.show_progress is always undefined. Python's
		// gr.Draggable exposes no show_progress parameter either, so the branch is
		// unreachable in the app as well as here.
		for (const show_progress of [true, false]) {
			const { queryByTestId, unmount } = await render(Draggable, {
				...default_props,
				show_progress
			});

			expect(queryByTestId("status-tracker")).not.toBeInTheDocument();
			unmount();
		}
	});
});

describe("Drag interactions", () => {
	afterEach(() => cleanup());

	test("starting a drag marks the handle as grabbed", async () => {
		const { getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		const handle = getAllByTestId("drag-handle")[0];
		await fireEvent.dragStart(handle, { dataTransfer: new DataTransfer() });

		expect(handle).toHaveAttribute("aria-grabbed", "true");
	});

	test("ending a drag releases the handle again", async () => {
		const { getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		const handle = getAllByTestId("drag-handle")[0];
		await fireEvent.dragStart(handle, { dataTransfer: new DataTransfer() });
		await fireEvent.dragEnd(handle, { dataTransfer: new DataTransfer() });

		expect(handle).toHaveAttribute("aria-grabbed", "false");
	});

	test("dragging over an item allows the drop", async () => {
		const { getByTestId } = await render(DraggableWithChildren, default_props);

		const allowed = await fireEvent.dragOver(getByTestId("item-b"), {
			dataTransfer: new DataTransfer()
		});

		// fireEvent resolves false when a handler called preventDefault, which is
		// how the drop target opts in to receiving the drop.
		expect(allowed).toBe(false);
	});

	test("dropping one item onto another swaps their positions", async () => {
		const { container, getByTestId } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() =>
			expect(item_order(container)).toEqual(["Item A", "Item B", "Item C"])
		);

		await drag(getByTestId("item-a"), getByTestId("item-c"));

		expect(item_order(container)).toEqual(["Item C", "Item B", "Item A"]);
	});

	test("swapping adjacent items reorders them", async () => {
		const { container, getByTestId } = await render(
			DraggableWithChildren,
			default_props
		);

		await drag(getByTestId("item-a"), getByTestId("item-b"));

		expect(item_order(container)).toEqual(["Item B", "Item A", "Item C"]);
	});

	test("dropping an item onto itself leaves the order unchanged", async () => {
		const { container, getByTestId } = await render(
			DraggableWithChildren,
			default_props
		);

		await drag(getByTestId("item-b"), getByTestId("item-b"));

		expect(item_order(container)).toEqual(["Item A", "Item B", "Item C"]);
	});

	test("a drop with no drag in progress leaves the order unchanged", async () => {
		const { container, getByTestId } = await render(
			DraggableWithChildren,
			default_props
		);

		await fireEvent.drop(getByTestId("item-c"), {
			dataTransfer: new DataTransfer()
		});

		expect(item_order(container)).toEqual(["Item A", "Item B", "Item C"]);
	});

	test("handles are renumbered after a swap", async () => {
		const { getByTestId, getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		await drag(getByTestId("item-a"), getByTestId("item-c"));

		await waitFor(() => {
			expect(
				getAllByTestId("drag-handle").map((h) => h.getAttribute("data-index"))
			).toEqual(["0", "1", "2"]);
		});
		expect(
			getByTestId("item-c").querySelector("[data-testid='drag-handle']")
		).toHaveAttribute("data-index", "0");
	});

	test("every item keeps exactly one handle after a swap", async () => {
		const { getByTestId, getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		await drag(getByTestId("item-a"), getByTestId("item-c"));

		await waitFor(() => {
			expect(getAllByTestId("drag-handle")).toHaveLength(3);
		});
	});

	test("the dropped item is released when the drag completes", async () => {
		const { getByTestId } = await render(DraggableWithChildren, default_props);

		await drag(getByTestId("item-a"), getByTestId("item-c"));

		await waitFor(() => {
			expect(
				getByTestId("item-a").querySelector("[data-testid='drag-handle']")
			).toHaveAttribute("aria-grabbed", "false");
		});
	});
});

describe("Children in a form wrapper", () => {
	afterEach(() => cleanup());

	test("children inside a form each get their own handle", async () => {
		const { getAllByTestId } = await render(
			DraggableWithFormChildren,
			default_props
		);

		await waitFor(() => {
			expect(getAllByTestId("drag-handle")).toHaveLength(3);
		});
	});

	test("form children share one index sequence with direct children", async () => {
		const { getByTestId } = await render(
			DraggableWithFormChildren,
			default_props
		);

		await waitFor(() => {
			expect(
				getByTestId("item-c").querySelector("[data-testid='drag-handle']")
			).toHaveAttribute("data-index", "2");
		});
	});

	test("two children inside the same form can be swapped", async () => {
		const { container, getByTestId } = await render(
			DraggableWithFormChildren,
			default_props
		);

		await drag(getByTestId("item-a"), getByTestId("item-b"));

		expect(item_order(container)).toEqual(["Item B", "Item A", "Item C"]);
	});

	test("a form child can be swapped with a direct child", async () => {
		const { container, getByTestId } = await render(
			DraggableWithFormChildren,
			default_props
		);

		await drag(getByTestId("item-a"), getByTestId("item-c"));

		expect(item_order(container)).toEqual(["Item C", "Item B", "Item A"]);
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("a child added after mount is made draggable", async () => {
		const { getAllByTestId, getByRole } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		const late_child = document.createElement("div");
		late_child.dataset.testid = "item-d";
		late_child.textContent = "Item D";
		getByRole("region").appendChild(late_child);

		await waitFor(() => {
			expect(getAllByTestId("drag-handle")).toHaveLength(4);
		});
	});

	test("a child removed after mount takes its handle with it", async () => {
		const { getAllByTestId, getByTestId } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		getByTestId("item-c").remove();

		await waitFor(() => {
			expect(getAllByTestId("drag-handle")).toHaveLength(2);
		});
	});

	test("a late child joins the existing index sequence", async () => {
		const { getAllByTestId, getByRole } = await render(
			DraggableWithChildren,
			default_props
		);
		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		const late_child = document.createElement("div");
		late_child.dataset.testid = "item-d";
		late_child.textContent = "Item D";
		getByRole("region").appendChild(late_child);

		await waitFor(() => {
			expect(
				getAllByTestId("drag-handle").map((h) => h.getAttribute("data-index"))
			).toEqual(["0", "1", "2", "3"]);
		});
	});

	test("setting up twice does not leave a child with two handles", async () => {
		const { getByTestId, getAllByTestId } = await render(
			DraggableWithChildren,
			default_props
		);

		await waitFor(() => expect(getAllByTestId("drag-handle")).toHaveLength(3));

		expect(
			getByTestId("item-a").querySelectorAll("[data-testid='drag-handle']")
		).toHaveLength(1);
	});
});
