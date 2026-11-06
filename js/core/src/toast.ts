import type { ToastMessage } from "@gradio/statustracker";

const DEFAULT_TOAST_TITLES = {
	error: "Error",
	warning: "Warning",
	info: "Info",
	success: "Success"
} as const;

type ToastType = keyof typeof DEFAULT_TOAST_TITLES;

// "success" is not among them: a component may have a "success" event of its
// own, so a success toast is dispatched as "info" with `type: "success"`
const TOAST_EVENTS = ["error", "warning", "info"];

export interface EventToast {
	title: string;
	message: string;
	type: ToastMessage["type"];
	duration: number | null;
	visible: boolean;
}

/**
 * The toast for a component's "error", "warning" or "info" event, or null for
 * any other event. `data` is a message, or a toast with its own type, title,
 * duration and visibility (e.g. a gr.Success from a gr.WebRTC stream handler).
 */
export function event_toast(event: string, data: unknown): EventToast | null {
	if (!TOAST_EVENTS.includes(event)) return null;
	const toast =
		typeof data === "string"
			? { message: data }
			: ((data ?? {}) as {
					message?: string;
					title?: string;
					type?: string;
					duration?: number | null;
					visible?: boolean;
				});
	const type = (
		toast.type !== undefined && Object.hasOwn(DEFAULT_TOAST_TITLES, toast.type)
			? toast.type
			: event
	) as ToastType;
	return {
		title: toast.title ?? DEFAULT_TOAST_TITLES[type],
		message: toast.message ?? "",
		type,
		duration: toast.duration === undefined ? 10 : toast.duration,
		visible: toast.visible ?? true
	};
}
