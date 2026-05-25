import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";

import Timer from "./Index.svelte";

const default_props = {
	value: 1,
	active: true
};

describe("Timer", () => {
	afterEach(() => cleanup());

	test("renders without errors when active", async () => {
		const result = await render(Timer, default_props);
		expect(result.container).toBeInTheDocument();
	});

	test("renders without errors when inactive", async () => {
		const result = await render(Timer, {
			...default_props,
			active: false
		});
		expect(result.container).toBeInTheDocument();
	});
});

describe("Props: active", () => {
	afterEach(() => cleanup());

	test("active=true dispatches tick events", async () => {
		const { listen } = await render(Timer, {
			...default_props,
			value: 0.1,
			active: true
		});

		const tick = listen("tick");

		await waitFor(() => {
			expect(tick).toHaveBeenCalled();
		});
	});

	test("active=false does not dispatch tick events", async () => {
		const { listen } = await render(Timer, {
			...default_props,
			value: 0.1,
			active: false
		});

		const tick = listen("tick");

		await new Promise((resolve) => setTimeout(resolve, 300));
		expect(tick).not.toHaveBeenCalled();
	});

	test("setting active to false via set_data stops tick events", async () => {
		const { listen, set_data } = await render(Timer, {
			...default_props,
			value: 0.1,
			active: true
		});

		const tick = listen("tick");

		await waitFor(() => {
			expect(tick).toHaveBeenCalled();
		});

		await set_data({ active: false });

		const count_after_stop = tick.mock.calls.length;

		await new Promise((resolve) => setTimeout(resolve, 400));
		expect(tick.mock.calls.length).toBe(count_after_stop);
	});

	test("setting active to true via set_data starts tick events", async () => {
		const { listen, set_data } = await render(Timer, {
			...default_props,
			value: 0.1,
			active: false
		});

		const tick = listen("tick");

		await new Promise((resolve) => setTimeout(resolve, 300));
		expect(tick).not.toHaveBeenCalled();

		await set_data({ active: true });

		await waitFor(() => {
			expect(tick).toHaveBeenCalled();
		});
	});
});

describe("Props: value", () => {
	afterEach(() => cleanup());

	test("value controls the tick interval in seconds", async () => {
		const { listen } = await render(Timer, {
			...default_props,
			value: 0.5,
			active: true
		});

		const tick = listen("tick");

		await new Promise((resolve) => setTimeout(resolve, 120));
		expect(tick).not.toHaveBeenCalled();

		await waitFor(() => {
			expect(tick).toHaveBeenCalled();
		});
	});

	test("changing value via set_data resets the interval", async () => {
		const { listen, set_data } = await render(Timer, {
			...default_props,
			value: 0.1,
			active: true
		});

		const tick = listen("tick");

		await waitFor(() => {
			expect(tick).toHaveBeenCalled();
		});

		await set_data({ value: 0.5 });

		const count_after_change = tick.mock.calls.length;

		await new Promise((resolve) => setTimeout(resolve, 200));
		expect(tick.mock.calls.length).toBe(count_after_change);

		await waitFor(() => {
			expect(tick.mock.calls.length).toBeGreaterThan(count_after_change);
		});
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the current value and active state", async () => {
		const { get_data } = await render(Timer, default_props);

		const data = await get_data();
		expect(data.value).toBe(1);
		expect(data.active).toBe(true);
	});

	test("set_data updates the value and active state", async () => {
		const { set_data, get_data } = await render(Timer, default_props);

		await set_data({ value: 5, active: false });
		const data = await get_data();
		expect(data.value).toBe(5);
		expect(data.active).toBe(false);
	});

	test("set_data then get_data round-trips", async () => {
		const { set_data, get_data } = await render(Timer, default_props);

		await set_data({ value: 2.5, active: false });
		const data = await get_data();
		expect(data.value).toBe(2.5);
		expect(data.active).toBe(false);
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("large interval value dispatches ticks infrequently", async () => {
		const { listen } = await render(Timer, {
			...default_props,
			value: 10,
			active: true
		});

		const tick = listen("tick");

		await new Promise((resolve) => setTimeout(resolve, 500));
		expect(tick).not.toHaveBeenCalled();
	});

	test("no spurious tick event on mount before the first interval", async () => {
		const { listen } = await render(Timer, {
			...default_props,
			value: 10,
			active: true
		});

		const tick = listen("tick");

		expect(tick).not.toHaveBeenCalled();
	});
});
