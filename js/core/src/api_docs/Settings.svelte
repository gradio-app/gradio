<script lang="ts">
	/* eslint-disable */
	import { onMount } from "svelte";
	import SettingsBanner from "./SettingsBanner.svelte";
	export let root: string;
	export let space_id: string | null;
	export let pwa_enabled: boolean | undefined;
	import { BaseDropdown as Dropdown } from "@gradio/dropdown";
	import { language_choices, changeLocale } from "../i18n";
	import { locale, _ } from "svelte-i18n";
	import { setupi18n } from "../i18n";

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
		window.location.href = url.toString();
	}

	onMount(() => {
		document.body.style.overflow = "hidden";
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}
		const url = new URL(window.location.href);
		const theme = url.searchParams.get("__theme");
		current_theme = (theme as "light" | "dark" | "system") || "system";
		return () => {
			document.body.style.overflow = "auto";
		};
	});

	let current_locale: string;
	let current_theme: "light" | "dark" | "system" = "system";

	locale.subscribe((value) => {
		if (value) {
			current_locale = value;
		}
	});

	function handleLanguageChange(e: CustomEvent): void {
		const new_locale = e.detail;
		changeLocale(new_locale);
	}
	setupi18n();
</script>

<div class="banner-wrap">
	<SettingsBanner on:close {root} />
</div>
{#if space_id === null}
	<!-- on Spaces, the theme is set in HF settings -->
	<div class="banner-wrap">
		<h2>{$_("common.display_theme")}</h2>
		<p class="padded theme-buttons">
			<li
				class="theme-button {current_theme === 'light'
					? 'current-theme'
					: 'inactive-theme'}"
				on:click={() => setTheme("light")}
			>
				<button>☀︎ &nbsp;Light</button>
			</li>
			<li
				class="theme-button {current_theme === 'dark'
					? 'current-theme'
					: 'inactive-theme'}"
				on:click={() => setTheme("dark")}
			>
				<button>⏾ &nbsp; Dark</button>
			</li>
			<li
				class="theme-button {current_theme === 'system'
					? 'current-theme'
					: 'inactive-theme'}"
				on:click={() => setTheme("system")}
			>
				<button>🖥︎ &nbsp;System</button>
			</li>
		</p>
	</div>
{/if}
<div class="banner-wrap">
	<h2>{$_("common.language")}</h2>
	<p class="padded">
		<Dropdown
			label="Language"
			choices={language_choices}
			show_label={false}
			{root}
			value={current_locale}
			on:change={handleLanguageChange}
		/>
	</p>
</div>
<div class="banner-wrap">
	<h2>{$_("common.pwa")}</h2>
	<p class="padded">
		{#if pwa_enabled}
			You can install this app as a Progressive Web App on your device. Visit <a
				href={root} target="_blank">{root}</a
			> and click the install button in the URL address bar of your browser.
		{:else}
			Progressive Web App is not enabled for this app. To enable it, start your
			Gradio app with <code>launch(pwa=True)</code>.
		{/if}
	</p>
</div>

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

	.theme-button {
		display: flex;
		align-items: center;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		padding: var(--size-2) var(--size-2-5);
		line-height: 1;
		user-select: none;
		text-transform: capitalize;
		cursor: pointer;
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
</style>
