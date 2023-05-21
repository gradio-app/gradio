<script lang="ts">
	import { onDestroy } from "svelte";
	import TrafficBanner from "./TrafficBanner.svelte";
	import Dashboard from "./Dashboard.svelte";
	import type { ActivityLog } from "./utils";

	export let root: string;
	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	let activity: ActivityLog | undefined = undefined;
	let pending_request: boolean = false;

	const get_traffic = () => {
		if (pending_request) {
			return;
		}
		pending_request = true;
		fetch(root + "traffic")
			.then((response) => response.json())
			.then((data) => {
				activity = data;
				pending_request = false;
			});
	};
	get_traffic();
	let interval = window.setInterval(get_traffic, 2000);
	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<TrafficBanner on:close />

<div class="content-wrap">
	{#if activity === undefined}
		Loading...
	{:else}
		<Dashboard {...activity} />
	{/if}
</div>

<style>
	.content-wrap {
		padding: var(--size-6);
	}
</style>
