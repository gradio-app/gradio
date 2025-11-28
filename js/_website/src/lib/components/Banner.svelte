<script lang="ts">
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	export let id: string = "default";
	export let show: boolean = true;
	export let message: string = "";
	export let link_text: string = "";
	export let link_url: string = "";
	export let type: "announcement" | "warning" | "info" = "announcement";
	export let target: "_blank" | "_self" = "_self";

	let dismissed = false;

	$: badge_label =
		type === "announcement" ? "New" : type === "warning" ? "Update" : "Info";

	const STORAGE_KEY = `gradio-banner-dismissed-${id}`;

	$: visible = show && !dismissed;

	onMount(() => {
		if (browser) {
			const wasDismissed = localStorage.getItem(STORAGE_KEY) === "true";
			if (wasDismissed) {
				dismissed = true;
			}
		}
	});

	function dismiss() {
		dismissed = true;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, "true");
		}
	}
</script>

{#if visible}
	<a
		href={link_url}
		{target}
		rel={target === "_blank" ? "noopener noreferrer" : undefined}
		class="pill {type}"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 150 }}
	>
		<span class="badge {type}">{badge_label}</span>
		<span class="message">{message}</span>
		{#if link_text}
			<span class="link-text">
				{link_text}
				<svg
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M5 12h14" />
					<path d="m12 5 7 7-7 7" />
				</svg>
			</span>
		{/if}
	</a>
{/if}

<style>
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px 4px 4px;
		border-radius: 9999px;
		background: var(--neutral-100);
		border: 1px solid var(--neutral-200);
		font-size: var(--text-xs);
		color: var(--neutral-700);
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.pill:hover {
		background: var(--neutral-200);
		border-color: var(--neutral-300);
	}

	:global(html.dark) .pill {
		background: var(--neutral-800);
		border-color: var(--neutral-700);
		color: var(--neutral-300);
	}

	:global(html.dark) .pill:hover {
		background: var(--neutral-700);
		border-color: var(--neutral-600);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 8px;
		border-radius: 9999px;
		color: white;
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.badge.announcement {
		background: var(--primary-500);
	}

	.badge.warning {
		background: #dc2626;
	}

	.badge.info {
		background: var(--secondary-500);
	}

	.message {
		color: var(--neutral-600);
		font-size: 11px;
	}

	:global(html.dark) .message {
		color: var(--neutral-400);
	}

	.link-text {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-weight: 500;
		font-size: 10px;
		background: transparent !important;
		border: none !important;
		padding: 0 !important;
		margin: 0 !important;
		box-shadow: none !important;
		color: var(--primary-500);
	}

	:global(html.dark) .link-text {
		color: var(--primary-400);
	}

	.link-text svg {
		transition: transform 0.15s ease;
	}

	.pill:hover .link-text svg {
		transform: translateX(2px);
	}
</style>
