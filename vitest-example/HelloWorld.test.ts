import { expect, test } from "vitest";
import { render } from "vitest-browser-svelte";
import HelloWorld from "./HelloWorld.svelte";

test("renders name", async () => {
	const { getByText } = render(HelloWorld, { name: "Vitest" });
	await expect.element(getByText("Hello Vitest!")).toBeInTheDocument();
});
