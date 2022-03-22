import { test, describe, assert, afterEach } from "vitest";
import { cleanup, render, get_text } from "@gradio/tootils";

import Chatbot from "./Chatbot.svelte";

describe("Chatbot", () => {
	afterEach(() => cleanup());

	test("renders bot and user messages", () => {
		const { getAllByTestId } = render(Chatbot, {
			value: [["bot message one", "user message one"]]
		});

		const bot = getAllByTestId("bot")[0];
		const user = getAllByTestId("user")[0];

		assert.equal(get_text(bot), "bot message one");
		assert.equal(get_text(user), "user message one");
	});

	test("renders additional message as they are passed", async () => {
		const { component, getAllByTestId } = render(Chatbot, {
			value: [["bot message one", "user message one"]]
		});

		const bot = getAllByTestId("bot");
		const user = getAllByTestId("user");

		assert.equal(bot.length, 1);
		assert.equal(user.length, 1);

		await component.$set({
			value: [
				["bot message one", "user message one"],
				["bot message two", "user message two"]
			]
		});

		const bot_2 = getAllByTestId("bot");
		const user_2 = getAllByTestId("user");

		assert.equal(bot_2.length, 2);
		assert.equal(user_2.length, 2);

		assert.equal(get_text(bot_2[1]), "bot message two");
		assert.equal(get_text(user_2[1]), "user message two");
	});
});
