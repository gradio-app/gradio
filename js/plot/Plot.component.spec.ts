import { test, expect } from "@playwright/experimental-ct-svelte";
import Plot from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";
import { matplotlib_plot } from "./testplot";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete",
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

test("gr.Plot triggers load and change events correctly", async ({ mount }) => {
	const events = {
		change: 0
	};

	function event(name: "change") {
		events[name] += 1;
	}

	const component = await mount(Plot, {
		props: {
			value: { plot: matplotlib_plot, type: "matplotlib" },
			label: "My Plot",
			show_label: true,
			loading_status: loading_status,
			theme_mode: "light",
			caption: "",
			bokeh_version: null,
			show_actions_button: false,
			_selectable: false,
			x_lim: null,
			gradio: {
				dispatch: event,
				i18n: (x: string) => x,
				autoscroll: "false"
			}
		}
	});

	await component.update({
		props: {
			value: { plot: "fooo", type: "matplotlib" }
		}
	});

	expect(events.change).toEqual(1);
});
