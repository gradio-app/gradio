<script lang="ts">
	import { fade } from 'svelte/transition'
	import Search_worker from './search-worker?worker'
	import { onNavigate } from '$app/navigation'
	import type { Result } from './search'

	let search: 'idle' | 'load' | 'ready' = 'idle'
	let search_term = ''
	let results: Result[] = []
	let search_worker: Worker

	function initialize() {
		if (search === 'ready') return
		search = 'load'
		search_worker = new Search_worker()
		search_worker.addEventListener('message', (e) => {
			const { type, payload } = e.data
			type === 'ready' && (search = 'ready')
			type === 'results' && (results = payload.results)
		})
		search_worker.postMessage({ type: 'load' })
	}

    let open: boolean = false;

	onNavigate(() => {
		open = false
	})

	$: if (search === 'ready') {
		search_worker.postMessage({ type: 'search', payload: { search_term } })
	}

	$: if (search_term && !open) {
		search_term = ''
	}
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'k' || e.key === 'K') {
				e.preventDefault()
                initialize()
				open = !open
			}
		}
	}}
/>

<button on:click={initialize} class="open-search">
	<search_worker />
	<span>Search</span>
	<div class="shortcut">
		<kbd>⌘</kbd> + <kbd>K</kbd>
	</div>
</button>

<div>
	{#if open}
		<div in:fade={{ duration: 200 }} class="overlay" />
		<div class="content">
			<input
				bind:value={search_term}
				placeholder="Search"
				autocomplete="off"
				spellcheck="false"
				type="search"
			/>
			<div class="results">
				{#if search === 'load'}
					<p>Loading...</p>
				{/if}

				{#if results}
					<ul>
						{#each results as result}
							{#if result.content.length > 0}
								<li>
									<a href="/{result.slug}">{@html result.title}</a>
									<ol>
										{#each result.content as content}
											<li>{@html content}</li>
										{/each}
									</ol>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0px;
		background-color: hsl(0 0% 0% / 80%);
		backdrop-filter: blur(4px);
		z-index: 30;
	}

	.content {
		width: 90vw;
		max-width: 600px;
		position: fixed;
		left: 50%;
		top: 20%;
		translate: -50% -0%;
		border-radius: var(--rounded-4);
		box-shadow: 0px 0px 20px hsl(0 0% 0% / 40%);
		overflow: hidden;
		z-index: 40;

		& input {
			width: 100%;
			padding: var(--spacing-16);
			color: var(--clr-search-input-txt);
			background-color: var(--clr-search-input-bg);

			&:focus {
				box-shadow: none;
				border-radius: 0px;
			}
		}
	}

	.results {
		max-height: 60vh;
		padding: var(--spacing-16);
		background-color: var(--clr-search-results-bg);
		overflow-y: auto;
		scrollbar-width: thin;

		& ol {
			margin-block-start: var(--spacing-8);
		}

		& li:not(:last-child) {
			margin-block-end: var(--spacing-16);
			padding-block-end: var(--spacing-16);
			border-bottom: 1px solid var(--clr-results-border);
		}

		& a {
			display: block;
			font-size: var(--font-24);
		}

		& mark {
			background-color: var(--clr-primary);
		}
	}

	.open-search {
		display: flex;
		align-items: center;
		gap: var(--spacing-8);
		padding: var(--spacing-8) var(--spacing-16);
		color: var(--clr-search-txt);
		background-color: var(--clr-search-bg);
		border-top: 1px solid var(--clr-search-border);
		border-left: 1px solid var(--clr-search-border);
		border-radius: var(--rounded-20);
		transition: color 0.3s ease;

		& span,
		.shortcut {
			display: none;

			@media (width >= 600px) {
				display: block;
			}
		}

		& kbd {
			padding: 4px 8px;
			color: var(--clr-search-kbd-txt);
			background-color: var(--clr-search-kbd-bg);
			border: 1px solid var(--clr-search-kbd-border);
			border-radius: var(--rounded-4);
		}

		&:hover {
			color: var(--clr-primary);
		}
	}
</style>