import { describe, test, expect, afterEach } from "vitest";
import { render, cleanup } from "./render";

const loading_status = {
	status: "complete",
	queue_position: null,
	queue_size: null,
	eta: null,
	message: null
};

export interface SharedPropTestConfig {
	/** The Svelte component to test */
	component: any;
	/** Minimum props required to render the component without errors */
	base_props: Record<string, any>;
	/** Display name for test output */
	name: string;
	/**
	 * Some components don't render labels (e.g. HTML, Markdown).
	 * Set to false to skip label-related tests.
	 * @default true
	 */
	has_label?: boolean;
	/**
	 * Whether the component renders validation_error text.
	 * Not all components support this. Set to false to skip.
	 * @default true
	 */
	has_validation_error?: boolean;
}

export function run_shared_prop_tests(config: SharedPropTestConfig): void {
	const {
		component,
		base_props,
		name,
		has_label = true,
		has_validation_error = true
	} = config;

	const label = "Test Label";

	function make_props(
		overrides: Record<string, any> = {}
	): Record<string, any> {
		return {
			...base_props,
			loading_status,
			label,
			...overrides
		};
	}

	describe(`${name}: shared props`, () => {
		afterEach(() => cleanup());

		test("elem_id is applied to the wrapper", async () => {
			const { container } = await render(
				component,
				make_props({ elem_id: "my-test-id" })
			);
			const el = container.querySelector("#my-test-id");
			expect(el).not.toBeNull();
		});

		test("elem_classes are applied to the wrapper", async () => {
			const { container } = await render(
				component,
				make_props({ elem_classes: ["my-test-class"] })
			);
			const el = container.querySelector(".my-test-class");
			expect(el).not.toBeNull();
		});

		test("visible: true renders the component", async () => {
			const { container } = await render(
				component,
				make_props({ visible: true })
			);
			const el = container.querySelector(".block");
			expect(el).not.toBeNull();
		});

		test("visible: 'hidden' hides the component but keeps it in the DOM", async () => {
			const result = await render(
				component,
				make_props({ visible: "hidden", elem_id: "hidden-test" })
			);

			const el = result.container.querySelector("#hidden-test");
			expect(el).not.toBeNull();
			expect(el).not.toBeVisible();
		});

		test("visible: false removes the component from the DOM", async () => {
			const result = await render(
				component,
				make_props({ visible: false, elem_id: "gone-test" })
			);

			const el = result.container.querySelector("#gone-test");
			expect(el).toBeNull();
		});

		if (has_label) {
			test("label text is rendered", async () => {
				const result = await render(
					component,
					make_props({ label: "My Custom Label", show_label: true })
				);
				const el = result.getByText("My Custom Label");
				expect(el).toBeTruthy();
			});

			test("show_label: true makes the label visible", async () => {
				const result = await render(
					component,
					make_props({ label: "Visible Label", show_label: true })
				);
				const el = result.getByText("Visible Label");
				expect(el).toBeVisible();
			});

			test("show_label: false hides the label visually but keeps it in the DOM", async () => {
				const result = await render(
					component,
					make_props({ label: "Hidden Label", show_label: false })
				);
				const el = result.getByText("Hidden Label");
				// The label remains in the DOM for screen readers via sr-only.
				// sr-only uses clip/1px dimensions rather than display:none,
				// so toBeVisible() won't catch it. We check the class directly.
				expect(el.closest("[data-testid='block-info']")).toHaveClass("sr-only");
			});
		}

		if (has_validation_error) {
			test("validation_error displays error text", async () => {
				const result = await render(
					component,
					make_props({ validation_error: "This field is required" })
				);
				const el = result.getByText("This field is required");
				expect(el).toBeTruthy();
			});
		}
	});
}
