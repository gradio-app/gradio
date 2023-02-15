<script lang="ts">
	import logo from "./images/logo.svg";

	export let wrapper: HTMLDivElement;
	export let version: string;
	export let initial_height: string = "300px";

	export let space: string | null;
	export let display: boolean = true;

	$: console.log({ display });
</script>

<div
	bind:this={wrapper}
	class:app={!display}
	class:embed-container={display}
	class="gradio-container gradio-container-{version}"
	style:min-height={initial_height}
	style:flex-grow={!display ? "1" : "auto"}
>
	<div class="main">
		<slot />
	</div>
	{#if display && space}
		<div class="info">
			<span>
				<a href="https://huggingface.co/spaces/{space}" class="title">{space}</a
				>
			</span>
			<span>
				built with
				<a class="gradio" href="https://gradio.app">Gradio</a>.
			</span>
			<span>
				Hosted on
				<a class="hf" href="https://huggingface.co/spaces"
					><span class="emoji">🤗</span> Spaces</a
				>
			</span>
		</div>
	{/if}
</div>

<style>
	.gradio-container {
		position: relative;

		background: var(--button-secondary-background-base);
		background: var(--color-background-primary);
		padding: 0;
		width: calc(100% - 40px);
		min-height: 1px;
		overflow: hidden;
		color: var(--button-secondary-text-color-base);
	}

	.embed-container {
		margin: var(--size-4) 20px;
		border: 1px solid var(--button-secondary-border-color-base);
		border-radius: var(--radius-lg);
		padding-bottom: var(--size-4);
	}

	.embed-container > .main {
		padding: var(--size-4);
	}

	.app {
		position: relative;
		margin: auto;
		padding: var(--size-4);
		height: 100%;
	}

	@media (--screen-sm) {
		.app {
			max-width: 640px;
		}
	}
	@media (--screen-md) {
		.app {
			max-width: 768px;
		}
	}
	@media (--screen-lg) {
		.app {
			max-width: 1024px;
		}
	}
	@media (--screen-xl) {
		.app {
			max-width: 1280px;
		}
	}
	@media (--screen-xxl) {
		.app {
			max-width: 1536px;
		}
	}

	.info {
		display: flex;
		position: absolute;
		bottom: 0;
		justify-content: flex-start;
		z-index: var(--layer-top);
		border-top: 1px solid var(--button-secondary-border-color-base);
		padding: var(--size-1) var(--size-5);
		width: 100%;
		color: var(--color-text-subdued);
		font-size: var(--scale-00);
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
		color: var(--color-text-body);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.info > span:nth-child(2) {
		margin-right: 3px;
	}

	.info > span:nth-child(2),
	.info > span:nth-child(3) {
		/* flex-shrink: 0; */
		width: max-content;

		/* width: 0; */
	}

	.info > span:nth-child(3) {
		align-self: flex-end;
		justify-self: flex-end;
		margin-left: auto;
		text-align: right;
	}

	.info > span:nth-child(1) {
		flex-shrink: 9;
		/* width: 0; */
	}

	/* span:n */

	.hidden-title {
		position: absolute;
		left: var(--size-5);
		opacity: 0;
		background: var(--button-secondary-background-base);
		padding-right: 4px;
	}

	.info a {
		color: var(--color-text-body);
	}

	.title {
		font-size: var(--scale-000);
		font-family: var(--font-mono);
	}

	.gradio {
		/* color: var(--color-accent-base); */
		/* font-weight: var(--weight-semibold); */
	}
	a img {
		display: inline;
		margin-left: 3px;
		width: 12px;
	}

	.hf {
		/* color: #fed703 !important; */
	}

	.emoji {
		margin-right: 1px;
		font-size: var(--scale-000);
	}

	a:hover {
		text-decoration: underline;
	}
</style>
