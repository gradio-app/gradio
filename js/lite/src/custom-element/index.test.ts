import { describe, it, expect, vi, beforeEach } from "vitest";
import { bootstrap_custom_element } from "./index";

const awaitAnimationFrame = () =>
	new Promise((resolve) => window.requestAnimationFrame(resolve));

describe("bootstrap_custom_element", () => {
	const create = vi.fn();

	beforeEach(() => {
		document.body.innerHTML = "";
		create.mockClear();
	});

	bootstrap_custom_element(create);

	it("parses a <gradio-lite> element that contains a string literal as a direct child", async () => {
		document.body.innerHTML = `
<gradio-lite>
  import gradio as gr
</gradio-lite>
`;
		await awaitAnimationFrame(); // Wait for `create` to be called in the `requestAnimationFrame` callback

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				code: expect.stringMatching(/import gradio as gr/),
				requirements: [],
				files: undefined
			})
		);
	});

	it("parses a <gradio-lite> element that contains <gradio-code> and <gradio-requirements> elements", async () => {
		document.body.innerHTML = `
<gradio-lite>
    <gradio-code>
import gradio as gr
    </gradio-code>

    <gradio-requirements>
numpy
scipy
    </gradio-requirements>
</gradio-lite>
`;
		await awaitAnimationFrame(); // Wait for `create` to be called in the `requestAnimationFrame` callback

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				code: expect.stringMatching(/import gradio as gr/),
				requirements: ["numpy", "scipy"],
				files: undefined
			})
		);
	});

	it("parses a <gradio-lite> element that contains <gradio-file> and <gradio-requirements> elements", async () => {
		document.body.innerHTML = `
<gradio-lite>
    <gradio-file name="app.py" entrypoint>
import gradio as gr

from foo import foo
    </gradio-file>

    <gradio-file name="foo.py">
def foo():
    return "bar"
    </gradio-file>

    <gradio-requirements>
numpy
scipy
    </gradio-requirements>
</gradio-lite>
`;
		await awaitAnimationFrame(); // Wait for `create` to be called in the `requestAnimationFrame` callback

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				files: {
					"app.py": {
						data: expect.stringMatching(/import gradio as gr/)
					},
					"foo.py": {
						data: expect.stringMatching(/def foo\(\):/)
					}
				},
				entrypoint: "app.py",
				code: undefined,
				requirements: ["numpy", "scipy"]
			})
		);
	});

	it("dedents the code inside <gradio-lite>", async () => {
		document.body.innerHTML = `
<gradio-lite>
		import gradio as gr
</gradio-lite>
`;
		await awaitAnimationFrame(); // Wait for `create` to be called in the `requestAnimationFrame` callback

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				code: expect.stringMatching(/^import gradio as gr/),
				requirements: [],
				files: undefined
			})
		);
	});

	it("dedents the code inside <gradio-code>", async () => {
		document.body.innerHTML = `
<gradio-lite>
		<gradio-code>
				import gradio as gr
		</gradio-code>
</gradio-lite>
`;
		await awaitAnimationFrame(); // Wait for `create` to be called in the `requestAnimationFrame` callback

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				code: expect.stringMatching(/^import gradio as gr/),
				requirements: [],
				files: undefined
			})
		);
	});

	it("dedents Python code but normal files inside <gradio-file>", async () => {
		document.body.innerHTML = `
<gradio-lite>
		<gradio-file name="app.py" entrypoint>
				import gradio as gr

				from foo import foo
		</gradio-file>

		<gradio-file name="foo.py">
				def foo():
						return "bar"
		</gradio-file>

		<gradio-file name="data.txt">
				Hello, world!
		</gradio-file>
</gradio-lite>
`;
		await awaitAnimationFrame(); // Wait for `create` to be called in the `requestAnimationFrame` callback

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				files: {
					"app.py": {
						data: expect.stringMatching(/^import gradio as gr/)
					},
					"foo.py": {
						data: expect.stringMatching(/^def foo\(\):/)
					},
					"data.txt": {
						data: expect.stringMatching(/Hello, world!/)
					}
				},
				entrypoint: "app.py",
				code: undefined,
				requirements: []
			})
		);
	});
});
