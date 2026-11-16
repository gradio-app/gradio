import { flushSync } from "svelte";

/** runs an effect that logs a $state object, and counts how often it runs */
export function log_state_in_effect(log: (...args: unknown[]) => void): {
	state: { nested: { count: number } };
	runs: () => number;
	cleanup: () => void;
} {
	const state = $state({ nested: { count: 0 } });
	let runs = 0;
	const cleanup = $effect.root(() => {
		$effect(() => {
			runs++;
			log("state", state);
		});
	});
	flushSync();
	return { state, runs: () => runs, cleanup };
}
