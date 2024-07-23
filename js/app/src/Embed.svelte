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
</script>

<div
	bind:this={wrapper}
	class:app={!display && !is_embed}
	class:fill_width
	class:embed-container={display}
	class:with-info={info}
	class="gradio-container gradio-container-{version}"
	style:min-height={loaded ? "initial" : initial_height}
	style:flex-grow={!display ? "1" : "auto"}
	data-iframe-height
>
	<div class="main">
		<slot />
	</div>
	{#if display && space && info}
		<div class="info">
			<span>
				<a href="https://huggingface.co/spaces/{space}" class="title">{space}</a
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

<style>
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

	.embed-container > .main {
		padding: var(--size-4);
	}

	.app > .main {
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
		.app:not(.fill_width) {
			max-width: 640px;
		}
	}
	@media (--screen-md) {
		.app:not(.fill_width) {
			max-width: 768px;
		}
	}
	@media (--screen-lg) {
		.app:not(.fill_width) {
			max-width: 1024px;
		}
	}
	@media (--screen-xl) {
		.app:not(.fill_width) {
			max-width: 1280px;
		}
	}
	@media (--screen-xxl) {
		.app:not(.fill_width) {
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

	a:hover {
		text-decoration: underline;
	}
</style>
