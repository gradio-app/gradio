<script lang="ts">
	import { onDestroy, tick } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import type { LoadingStatusArgs } from "./types";
	import { pretty_si } from "./utils";

	interface Props {
		status: LoadingStatusArgs | null;
		i18n: I18nFormatter;
	}

	interface ProgressAnnouncement {
		message: string;
		milestone: number;
	}

	interface PendingAnnouncement {
		message: string;
		fn_index: number;
		milestone?: number;
	}

	let { status, i18n }: Props = $props();

	const MILLISECONDS_BETWEEN_ANNOUNCEMENTS = 5000;
	const MILLISECONDS_TO_CLEAR_ANNOUNCEMENT = 1000;

	let live_message = $state("");
	let pending_announcement: PendingAnnouncement | null = null;
	let flush_timeout: ReturnType<typeof setTimeout> | null = null;
	let clear_timeout: ReturnType<typeof setTimeout> | null = null;
	let last_announcement_time = Number.NEGATIVE_INFINITY;
	let announcement_id = 0;

	const announced_milestones = new Map<number, number>();
	const previous_statuses = new Map<number, LoadingStatusArgs["status"]>();

	function interpolate(
		message: string,
		values: Record<string, string | number>
	): string {
		return message.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));
	}

	function get_progress_announcement(
		loading_status: LoadingStatusArgs
	): ProgressAnnouncement | null {
		const last = loading_status.progress_data?.at(-1);
		if (!last) return null;

		const progress =
			last.index != null && last.length != null
				? last.index / last.length
				: last.progress;
		if (progress == null) return null;

		const percentage = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
		let message = `${percentage}%`;
		if (last.index != null && last.length != null) {
			message = `${pretty_si(last.index)} / ${pretty_si(last.length)}`;
			if (last.unit) message += ` ${last.unit}`;
		}
		if (last.desc) message = `${last.desc}: ${message}`;

		return {
			message,
			milestone: Math.floor(percentage / 10)
		};
	}

	function flush(): void {
		if (pending_announcement === null) return;

		const { message, fn_index, milestone } = pending_announcement;
		pending_announcement = null;
		last_announcement_time = performance.now();
		const current_announcement_id = ++announcement_id;
		live_message = "";

		void tick().then(() => {
			if (current_announcement_id !== announcement_id) return;

			live_message = message;
			if (milestone != null) announced_milestones.set(fn_index, milestone);
			if (clear_timeout) clearTimeout(clear_timeout);
			clear_timeout = setTimeout(() => {
				if (current_announcement_id === announcement_id) {
					live_message = "";
				}
			}, MILLISECONDS_TO_CLEAR_ANNOUNCEMENT);
		});
	}

	// Every announcement, including terminal ones, goes through this throttle so
	// that a frequently re-triggered dependency (a gr.Timer tick, say) collapses
	// into a single trailing announcement instead of one per run.
	function announce(
		message: string,
		fn_index: number,
		milestone?: number
	): void {
		pending_announcement = { message, fn_index, milestone };

		const wait =
			MILLISECONDS_BETWEEN_ANNOUNCEMENTS -
			(performance.now() - last_announcement_time);
		if (wait <= 0) {
			if (flush_timeout) clearTimeout(flush_timeout);
			flush_timeout = null;
			flush();
		} else if (!flush_timeout) {
			flush_timeout = setTimeout(() => {
				flush_timeout = null;
				flush();
			}, wait);
		}
	}

	$effect(() => {
		if (status === null) return;
		// `show_progress="hidden"` (which is what `show_progress=False` and the
		// default for `gr.Timer.tick` resolve to) suppresses the visual progress
		// indicator, so it must suppress the spoken one too.
		if (status.show_progress === "hidden") return;

		const previous_status = previous_statuses.get(status.fn_index);
		const status_changed = previous_status !== status.status;
		previous_statuses.set(status.fn_index, status.status);

		if (status.status === "complete") {
			announced_milestones.delete(status.fn_index);
			announce(i18n("common.complete"), status.fn_index);
			return;
		}

		if (status.status === "error") {
			announced_milestones.delete(status.fn_index);
			announce(i18n("common.error"), status.fn_index);
			return;
		}

		if (
			status.status !== "pending" &&
			status.status !== "generating" &&
			status.status !== "streaming"
		) {
			return;
		}

		const progress = get_progress_announcement(status);
		const announced_milestone = announced_milestones.get(status.fn_index) ?? 0;
		if (progress && progress.milestone > announced_milestone) {
			announce(progress.message, status.fn_index, progress.milestone);
			return;
		}

		if (status.position != null && status.size != null) {
			announce(
				interpolate(i18n("status.queue_position"), {
					position: status.position + 1,
					size: status.size
				}),
				status.fn_index
			);
			return;
		}

		if (status_changed) {
			announced_milestones.set(status.fn_index, 0);
			announce(i18n("common.loading"), status.fn_index);
		}
	});

	onDestroy(() => {
		if (flush_timeout) clearTimeout(flush_timeout);
		if (clear_timeout) clearTimeout(clear_timeout);
	});
</script>

<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
	{live_message}
</div>
