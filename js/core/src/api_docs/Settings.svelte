<script lang="ts">
	import { onMount } from "svelte";
	import HistoryStorageControl from "./HistoryStorageControl.svelte";
	import SettingsBanner from "./SettingsBanner.svelte";
	import { BaseDropdown as Dropdown } from "@gradio/dropdown";
	import { BaseCheckbox as Checkbox } from "@gradio/checkbox";
	import { language_choices, changeLocale } from "../i18n";
	import { locale, _ } from "svelte-i18n";
	import { get } from "svelte/store";
	import {
		list_bucket_records,
		on_run_history_change,
		read_run_history,
		read_run_history_storage,
		run_history_url,
		type RunHistoryStorage
	} from "@gradio/client";
	import record from "./img/record.svg";

	let {
		root,
		run_history_scope,
		run_history_enabled = true,
		space_id,
		pwa_enabled,
		allow_zoom = $bindable(),
		allow_video_trim = $bindable(),
		onclose,
		start_recording,
		i18n
	} = $props();

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	function setTheme(theme: "light" | "dark" | "system") {
		const url = new URL(window.location.href);
		if (theme === "system") {
			url.searchParams.delete("__theme");
			current_theme = "system";
		} else {
			url.searchParams.set("__theme", theme);
			current_theme = theme;
		}
		url.searchParams.delete("view");
		window.location.href = url.toString();
	}

	onMount(() => {
		// document.body.style.overflow = "hidden";
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}
		const url = new URL(window.location.href);
		const theme = url.searchParams.get("__theme");
		current_theme = (theme as "light" | "dark" | "system") || "system";
		let unsubscribe_run_history = (): void => {};
		if (run_history_enabled) {
			void refreshRunCount();
			unsubscribe_run_history = on_run_history_change(() => {
				void refreshRunCount();
			});
		}
		return () => {
			unsubscribe_run_history();
			document.body.style.overflow = "auto";
		};
	});

	let current_locale: string = $state(get(locale) ?? "en");
	let current_theme: "light" | "dark" | "system" = $state("system");
	let run_count = $state(0);
	let history_storage = $state<RunHistoryStorage>({ type: "browser" });
	let run_count_version = 0;

	async function refreshRunCount(): Promise<void> {
		const version = ++run_count_version;
		history_storage = read_run_history_storage(run_history_scope);
		if (history_storage.type === "browser") {
			run_count = read_run_history(run_history_scope).length;
			return;
		}
		const result = await list_bucket_records(root, history_storage.bucket_id);
		if (version !== run_count_version) return;
		run_count = result.ok ? result.data.length : 0;
	}

	function handleLanguageChange(value: string): void {
		const new_locale = value;
		changeLocale(new_locale);
	}

	function handleZoomChange(value: boolean): void {
		allow_zoom = value;
	}

	function handleVideoTrimChange(value: boolean): void {
		allow_video_trim = value;
	}
</script>

<div class="banner-wrap">
	<SettingsBanner onclose={() => onclose()} {root} />
</div>
{#if space_id === null}
	<!-- on Spaces, the theme is set in HF settings -->
	<div class="banner-wrap">
		<h2>{i18n("common.display_theme")}</h2>
		<ul class="padded theme-buttons">
			<li
				class="theme-button {current_theme === 'light'
					? 'current-theme'
					: 'inactive-theme'}"
			>
				<button onclick={() => setTheme("light")}>☀︎ &nbsp;Light</button>
			</li>
			<li
				class="theme-button {current_theme === 'dark'
					? 'current-theme'
					: 'inactive-theme'}"
			>
				<button onclick={() => setTheme("dark")}>⏾ &nbsp; Dark</button>
			</li>
			<li
				class="theme-button {current_theme === 'system'
					? 'current-theme'
					: 'inactive-theme'}"
			>
				<button onclick={() => setTheme("system")}>🖥︎ &nbsp;System</button>
			</li>
		</ul>
	</div>
{/if}
<div class="banner-wrap">
	<h2>{i18n("common.language")}</h2>
	<p class="padded">
		<Dropdown
			label="Language"
			choices={language_choices}
			show_label={false}
			bind:value={current_locale}
			on_change={() => handleLanguageChange(current_locale)}
		/>
	</p>
</div>
<div class="banner-wrap">
	<h2>{i18n("common.pwa")}</h2>
	<p class="padded">
		{#if pwa_enabled}
			You can install this app as a Progressive Web App on your device. Visit <a
				href={root}
				target="_blank">{root}</a
			> and click the install button in the URL address bar of your browser.
		{:else}
			Progressive Web App is not enabled for this app. To enable it, start your
			Gradio app with <code>launch(pwa=True)</code>.
		{/if}
	</p>
</div>
<div class="banner-wrap">
	<h2>{i18n("common.screen_studio")} <span class="beta-tag">beta</span></h2>
	<p class="padded">
		Screen Studio allows you to record your screen and generates a video of your
		app with automatically adding zoom in and zoom out effects as well as
		trimming the video to remove the prediction time.
		<br /><br />
		Start recording by clicking the <i>Start Recording</i> button below and then
		sharing the current browser tab of your Gradio demo. Use your app as you
		would normally to generate a prediction.
		<br />
		Stop recording by clicking the <i>Stop Recording</i> button in the footer of
		the demo.
		<br /><br />
		<Checkbox
			label="Include automatic zoom in/out"
			interactive={true}
			value={allow_zoom}
			on_change={handleZoomChange}
		/>
		<Checkbox
			label="Include automatic video trimming"
			interactive={true}
			value={allow_video_trim}
			on_change={handleVideoTrimChange}
		/>
	</p>
	<button
		class="record-button"
		onclick={() => {
			onclose?.();
			start_recording?.();
		}}
	>
		<img src={record} alt="Start Recording" />
		Start Recording
	</button>
</div>
{#if run_history_enabled}
	<div class="banner-wrap history-section">
		<div class="history-heading">
			<div>
				<h2>Run history ({run_count})</h2>
				<p>Choose where new runs are saved and revisit earlier results.</p>
			</div>
			<a class="run-history-button" href={run_history_url(root)}>
				View run history <span aria-hidden="true">→</span>
			</a>
		</div>
		<HistoryStorageControl
			{root}
			scope={run_history_scope}
			bind:storage={history_storage}
		/>
	</div>
{/if}

<style>
	.banner-wrap {
		position: relative;
		border-bottom: 1px solid var(--border-color-primary);
		padding: var(--size-4) var(--size-6);
		font-size: var(--text-md);
	}

	.banner-wrap h2 {
		font-size: var(--text-xl);
	}

	a {
		text-decoration: underline;
	}

	p.padded {
		padding: 15px 0px;
	}

	.theme-buttons {
		display: flex;
		align-items: center;
	}

	.theme-buttons > * + * {
		margin-left: var(--size-2);
	}

	.theme-button,
	.record-button,
	.run-history-button {
		display: flex;
		align-items: center;
		width: fit-content;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		padding: var(--size-2) var(--size-2-5);
		line-height: 1;
		user-select: none;
		cursor: pointer;
	}

	.theme-button,
	.record-button {
		text-transform: capitalize;
	}

	.run-history-button {
		gap: var(--size-1);
		flex: none;
		background: var(--color-accent-soft);
		color: var(--color-accent);
		font-weight: var(--button-large-text-weight);
		text-decoration: none;
	}

	.run-history-button:hover,
	.run-history-button:focus-visible {
		border-color: var(--color-accent);
		background: var(--background-fill-primary);
	}

	.history-section {
		padding-block: var(--size-6);
	}

	.history-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-4);
		margin-bottom: var(--size-4);
	}

	.history-heading h2 {
		margin: 0;
	}

	.history-heading p {
		margin: var(--size-1) 0 0;
		color: var(--body-text-color-subdued);
		font-size: var(--text-sm);
	}

	.record-button img {
		margin-right: var(--size-1);
		margin-left: var(--size-1);
		width: var(--size-3);
	}
	.record-button:hover {
		border-color: red;
	}

	.current-theme {
		border: 1px solid var(--body-text-color-subdued);
		color: var(--body-text-color);
	}

	.inactive-theme {
		color: var(--body-text-color-subdued);
	}

	.inactive-theme:hover,
	.inactive-theme:focus {
		box-shadow: var(--shadow-drop);
		color: var(--body-text-color);
	}

	.theme-button button {
		all: unset;
		cursor: pointer;
	}

	.beta-tag {
		position: relative;
		top: -5px;
		font-size: var(--text-xs);
		background-color: var(--color-accent);
		color: white;
		padding: 2px 6px;
		border-radius: 10px;
		margin-left: 5px;
		font-weight: normal;
		text-transform: uppercase;
	}

	@media (max-width: 700px) {
		.history-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.run-history-button {
			box-sizing: border-box;
			width: 100%;
			justify-content: center;
		}
	}
</style>
