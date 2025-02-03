<script lang="ts">
	import space_logo from "./images/spaces.svg";
	import { _ } from "svelte-i18n";
	export let wrapper: HTMLDivElement;
	export let version: string;
	export let initial_height: string;
	export let fill_width: boolean;
	export let is_embed: boolean;

	export let space: string | null;
	export let display: boolean;
	export let info: boolean;
	export let loaded: boolean;
	export let pages: [string, string][] = [];
	export let current_page = "";
</script>

<div
	bind:this={wrapper}
	class:fill_width
	class:embed-container={display}
	class:with-info={info}
	class="gradio-container gradio-container-{version}"
	style:min-height={loaded ? "initial" : initial_height}
	style:flex-grow={!display ? "1" : "auto"}
	data-iframe-height
>
	{#if pages.length > 1}
		<div class="nav-holder">
			<nav class="fillable" class:fill_width>
				{#each pages as [route, label], i}
					<a
						href={route.length ? route : "/"}
						class:active={route === current_page}
						data-sveltekit-reload
						>{label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
	<main class="fillable" class:app={!display && !is_embed}>
		<slot />
		<div>
			{#if display && space && info}
				<div class="info">
					<span>
						<a href="https://huggingface.co/spaces/{space}" class="title"
							>{space}</a
						>
					</span>
					<span>
						{$_("common.built_with")}
						<a class="gradio" href="https://gradio.app">Gradio</a>.
					</span>
					<span>
						{$_("common.hosted_on")}
						<a class="hf" href="https://huggingface.co/spaces"
							><span class="space-logo">
								<img src={space_logo} alt="Hugging Face Space" />
							</span> Spaces</a
						>
					</span>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	.nav-holder {
		padding: var(--size-2) 0;
		border-bottom: solid 1px var(--border-color-primary);
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		justify-content: flex-end;
		margin: 0 auto;
		padding: 0 var(--size-8);
	}
	nav a {
		padding: var(--size-1) var(--size-2);
		border-radius: var(--block-radius);
		border-width: var(--block-border-width);
		border-color: transparent;
		color: var(--body-text-color-subdued);
	}
	nav a.active {
		color: var(--body-text-color);
		border-color: var(--block-border-color);
		background-color: var(--block-background-fill);
	}
	.gradio-container {
		display: flex;
		position: relative;
		flex-direction: column;
		padding: 0;
		min-height: 1px;
		overflow: hidden;
		color: var(--button-secondary-text-color);
	}

	.embed-container {
		margin: var(--size-4) 0px;
		border: 1px solid var(--button-secondary-border-color);
		border-radius: var(--embed-radius);
	}

	.with-info {
		padding-bottom: var(--size-7);
	}

	.embed-container > main {
		padding: var(--size-4);
	}

	main {
		margin: 0 auto;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
	}

	.app {
		position: relative;
		margin: auto;
		padding: var(--size-4) var(--size-8);
		width: 100%;
		height: 100%;
	}

	@media (--screen-sm) {
		.fillable:not(.fill_width) {
			max-width: 640px;
		}
	}
	@media (--screen-md) {
		.fillable:not(.fill_width) {
			max-width: 768px;
		}
	}
	@media (--screen-lg) {
		.fillable:not(.fill_width) {
			max-width: 1024px;
		}
	}
	@media (--screen-xl) {
		.fillable:not(.fill_width) {
			max-width: 1280px;
		}
	}
	@media (--screen-xxl) {
		.fillable:not(.fill_width) {
			max-width: 1536px;
		}
	}

	.info {
		display: flex;
		position: absolute;
		bottom: 0;
		justify-content: flex-start;
		border-top: 1px solid var(--button-secondary-border-color);
		padding: var(--size-1) var(--size-5);
		width: 100%;
		color: var(--body-text-color-subdued);
		font-size: var(--text-md);
		white-space: nowrap;
	}

	.info > span {
		word-wrap: break-word;
		-break: keep-all;
		display: block;
		word-break: keep-all;
	}

	.info > span:nth-child(1) {
		margin-right: 4px;
		min-width: 0px;
		max-width: max-content;
		overflow: hidden;
		color: var(--body-text-color);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.info > span:nth-child(2) {
		margin-right: 3px;
	}

	.info > span:nth-child(2),
	.info > span:nth-child(3) {
		width: max-content;
	}

	.info > span:nth-child(3) {
		align-self: flex-end;
		justify-self: flex-end;
		margin-left: auto;
		text-align: right;
	}

	.info > span:nth-child(1) {
		flex-shrink: 9;
	}

	.hidden-title {
		position: absolute;
		left: var(--size-5);
		opacity: 0;
		background: var(--button-secondary-background-fill);
		padding-right: 4px;
	}

	.info a {
		color: var(--body-text-color);
	}

	.title {
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}

	.hf {
		margin-left: 5px;
	}

	.space-logo img {
		display: inline-block;
		margin-bottom: 4px;
		height: 12px;
	}

	main a:hover {
		text-decoration: underline;
	}
</style>
