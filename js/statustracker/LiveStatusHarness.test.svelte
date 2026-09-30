<script lang="ts">
	import LiveStatus from "./static/LiveStatus.svelte";
	import type { LoadingStatusArgs } from "./static/types";

	let status = $state<LoadingStatusArgs | null>(null);

	const translations: Record<string, string> = {
		"common.complete": "Complete",
		"common.error": "Error",
		"common.loading": "Loading",
		"status.queue_position": "In queue: {position} of {size}"
	};

	export function update_status(next_status: LoadingStatusArgs): void {
		status = next_status;
	}
</script>

<LiveStatus {status} i18n={(key: string) => translations[key] ?? key} />
