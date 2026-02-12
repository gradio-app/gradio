import { format } from "svelte-i18n";
import { get } from "svelte/store";

/**
 * Helper to wrap props in the format Gradio components expect.
 * Provides mock shared_props and formats component props for Storybook stories.
 */
export function wrapProps(componentProps) {
	const i18nFormatter = (s) => {
		if (!s) return "";
		const formatFn = get(format);
		return formatFn(s);
	};
	return {
		shared_props: {
			id: Math.floor(Math.random() * 1000000),
			theme_mode: "light",
			version: "5.0.0",
			formatter: i18nFormatter,
			client: {
				upload: () => Promise.resolve([]),
				fetch: (...args) => fetch(...args)
			},
			load_component: () => Promise.resolve({ default: {} }),
			show_progress: "full",
			api_prefix: "",
			root: "",
			visible: componentProps.visible ?? true,
			interactive: componentProps.interactive ?? true,
			show_label: componentProps.show_label ?? true,
			label: componentProps.label ?? "",
			container: true,
			scale: componentProps.scale ?? null,
			min_width: componentProps.min_width ?? 0,
			elem_id: componentProps.elem_id ?? undefined,
			elem_classes: componentProps.elem_classes ?? [],
			autoscroll: false,
			max_file_size: null,
			attached_events: [],
			server: {
				accept_blobs: () => {}
			},
			loading_status: {
				eta: 0,
				queue_position: 1,
				queue_size: 1,
				status: "complete",
				scroll_to_output: false,
				visible: true,
				fn_index: 0,
				show_progress: "full"
			}
		},
		props: {
			...componentProps,
			i18n: i18nFormatter,
			__GRADIO_BROWSER_TEST__: true
		}
	};
}
