<script lang="ts">
	/* eslint-disable */
	import { onMount } from "svelte";
	import SettingsBanner from "./SettingsBanner.svelte";
	export let root: string;
	export let space_id: string | null;
	import { BaseDropdown as Dropdown } from "@gradio/dropdown";
	import { setupi18n, language_choices, changeLocale } from "../i18n";
	import { locale } from "svelte-i18n";

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
		} else {
			url.searchParams.set("__theme", theme);
		}
		window.location.href = url.toString();
	}

	onMount(() => {
		document.body.style.overflow = "hidden";
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	});

	let current_locale: string;

	locale.subscribe((value) => {
		current_locale = value;
	});

	function handleLanguageChange(e: CustomEvent): void {
		const new_locale = e.detail;
		changeLocale(new_locale);
	}
</script>

<div class="banner-wrap">
	<SettingsBanner on:close {root} />
</div>
{#if space_id === null}
	<!-- on Spaces, the theme is set in HF settings -->
	<div class="banner-wrap">
		<h2>Display Theme</h2>
		<p class="padded theme-buttons">
			<li class="theme-button">
				<button on:click={() => setTheme("light")}>☀︎ &nbsp;Light</button>
			</li>
			<li class="theme-button">
				<button on:click={() => setTheme("dark")}>⏾ &nbsp; Dark</button>
			</li>
			<li class="theme-button">
				<button on:click={() => setTheme("system")}>🖥︎ &nbsp;System</button>
			</li>
		</p>
	</div>
{/if}
<div class="banner-wrap">
	<h2>Language</h2>
	<p class="padded">
		Gradio automatically detects the language of your browser. You can also choose a language manually:
	</p>
	<Dropdown
		label="Language"
		choices={language_choices}
		show_label={false}
		{root}
		value={current_locale}
		on:change={handleLanguageChange}
	/>
</div>
<div class="banner-wrap">
	<h2>Progressive Web App</h2>
	<p class="padded">
		You can install this app as a Progressive Web App on your device. Visit <a
			href={root}
			>{root}</a
		> and click the install button in the URL bar of your browser.
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
		color: var(--body-text-color-subdued);
		color: var(--body-text-color);
		line-height: 1;
		user-select: none;
		text-transform: capitalize;
	}

</style>
