<script lang="ts">
	/* eslint-disable */
	import { onMount } from "svelte";
	import SettingsBanner from "./SettingsBanner.svelte";
	export let root: string;
	export let space_id: string | null;
	console.log("space_id", space_id);

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	function setTheme(theme) {
  const url = new URL(window.location.href);
  
  if (theme === 'system') {
    // Remove the theme parameter for system theme
    url.searchParams.delete('__theme');
  } else {
    // Set theme parameter for light/dark
    url.searchParams.set('__theme', theme);
  }
  
  // Update the URL without refreshing the page
  window.history.replaceState({}, '', url);
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
</script>

<div class="banner-wrap">
	<SettingsBanner on:close {root} />
</div>
{#if space_id === null} <!-- on Spaces, the theme is set in HF settings -->
<div class="banner-wrap">
	<h2> Theme</h2>
	<p class="padded">
		<button on:click={() => setTheme('light')}>Light</button>
		<button on:click={() => setTheme('dark')}>Dark</button>
		<button on:click={() => setTheme('system')}>System</button>
	</p>
</div>
{/if}
<div class="banner-wrap">
	<h2> Language </h2>
	<p class="padded">
		<em>Choose a language to use for the Gradio app. Dropdown of languages...</em>
	</p>
</div>
<div class="banner-wrap">
	<h2> Progressive Web App</h2>
	<p class="padded">
		You can install this app as a Progressive Web App on your device.
		Visit <a href="https://abidlabs-gradio-playground-bot.hf.space">https://abidlabs-gradio-playground-bot.hf.space</a> and click 
		the install button in the address bar of your browser.
	</p>
</div>


<style>
	.banner-wrap {
		position: relative;
		border-bottom: 1px solid var(--border-color-primary);
		padding: var(--size-4) var(--size-6);
		font-size: var(--text-md);
	}

	@media (--screen-md) {
		.banner-wrap {
			font-size: var(--text-xl);
		}
	}

	a {
		text-decoration: underline;
	}

	p.padded {
		padding: 15px 0px;
		font-size: var(--text-lg);
	}
</style>
