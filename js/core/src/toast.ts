import type { ToastMessage } from "@gradio/statustracker";

const DEFAULT_TOAST_TITLES = {
	error: "Error",
	warning: "Warning",
	info: "Info",
	success: "Success"
} as const;

export interface EventToast {
	title: string;
	message: string;
	type: ToastMessage["type"];
	duration: number | null;
	visible: boolean;
}

/**
 * The toast for a component's "error", "warning", "info" or "success" event,
 * or null for any other event. `data` is a message, or a toast with its own
 * title, duration and visibility (e.g. a gr.Error raised by a gr.WebRTC
 * stream handler).
 */
export function event_toast(event: string, data: unknown): EventToast | null {
	if (!Object.hasOwn(DEFAULT_TOAST_TITLES, event)) return null;
	const toast =
		typeof data === "string"
			? { message: data }
			: ((data ?? {}) as {
					message?: string;
					title?: string;
					duration?: number | null;
					visible?: boolean;
				});
	const type = event as keyof typeof DEFAULT_TOAST_TITLES;
	return {
		title: toast.title ?? DEFAULT_TOAST_TITLES[type],
		message: toast.message ?? "",
		type,
		duration: toast.duration === undefined ? 10 : toast.duration,
		visible: toast.visible ?? true
	};
}
