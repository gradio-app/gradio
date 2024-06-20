<script lang="ts">
	import Search_Worker from './search-worker?worker'
	import Search_Icon from "./search-icon.svelte"
	import { onNavigate } from '$app/navigation'
	import type { Result } from './search'

	let search: 'idle' | 'load' | 'ready' = 'idle';
	let search_term = '';
	let results: Result[] = [];
	let search_worker: Worker;

	function initialize() {
		open = true;
		if (search === 'ready') return
		search = 'load';
		search_worker = new Search_Worker();
		search_worker.addEventListener('message', (e) => {
			const { type, payload } = e.data;
			type === 'ready' && (search = 'ready');
			type === 'results' && (results = payload.results);
		})
		search_worker.postMessage({ type: 'load' });
	}

    let open: boolean = false;

	onNavigate(() => {
		open = false;
	})

	$: if (search === 'ready') {
		search_worker.postMessage({ type: 'search', payload: { search_term } });
	}

	$: if (search_term && !open) {
		search_term = '';
	}

	let content_elem: HTMLElement;
	let search_button_elem: HTMLElement;

	function focus_input(el){
    	el.focus()
  	}
	
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'k' || e.key === 'K') {
				e.preventDefault();
                initialize();
			}
		}
		if (e.key === 'Escape') {
			open = false;
		}
		if ((e.key === "ArrowUp" || e.key === "ArrowDown") && open) {
			e.preventDefault();
			const current = document.activeElement
			const items =  [...document.getElementsByClassName('res-block')]
			const current_index = items.indexOf(current)
			let new_index
			if (current_index === -1) {
            new_index = 0
			} else {
				if (e.key === "ArrowUp") {
					new_index = (current_index + items.length - 1) % items.length
				} else {
					new_index = (current_index + 1) % items.length
				}
			}
			current.blur()
			items[new_index].focus()
		}
		
	}}
	on:click={(e) => {
		if (content_elem) { 
			if (!content_elem.contains(e.target) && open) {
				open = false;
			}
		} else {
			if (search_button_elem.contains(e.target)) {
				initialize()
			}
		}
	}}
/>

<button class="search-button" bind:this={search_button_elem}>
	<Search_Icon />
	<span class="pl-1 pr-5">Search</span>
	<div class="shortcut">
		<div class="text-sm">
			⌘K
		</div>
	</div>
</button>

{#if open}
		<div class="overlay" />
		<div class="content" bind:this={content_elem}>
			<div class="search-bar">
				<Search_Icon />
				<input
					bind:value={search_term}
					placeholder="What are you searching for?"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off" 
					enterkeyhint="go" 
					maxlength="64"
					spellcheck="false"
					type="search"
					use:focus_input
				/>
				<button 
				on:click={()=>{
					open = false;
				}}
				class="text-xs font-semibold rounded-md p-1 border-gray-300 border ">
					ESC
				</button>
			</div>
			<div class="results">
				{#if search === 'load'}
					<p>Loading...</p>
				{/if}

				{#if results.length}
					<ul>
						{#each results as result}
							{#if result.content.length > 0}
								<li>
									
									<a 
									class="res-block"
									href="{result.slug}">
									<p 
									class:text-green-700={result.type == "DOCS"}
									class:bg-green-100={result.type == "DOCS"}
									class:text-orange-700={result.type == "GUIDE"}
									class:bg-orange-100={result.type == "GUIDE"}
									class="float-right text-xs font-semibold rounded-md p-1 px-2">{result.type}</p>
									<p>{@html result.title}</p>
									<ol>
										{#each result.content as content}
											<li class="res-content">{@html content}</li>
										{/each}
									</ol>
									
									</a>
								</li>
							{/if}
						{/each}
					</ul>
				{:else}
					{#if search_term}
						<p class="mx-auto w-fit text-gray-500">No results found. Try using a different term.</p>
					{/if}
					<ul>
							<p class="">Suggestions</p>
							<li>
								<a 
									class="res-block"
									href="/quickstart">
									<p class="float-right text-xs font-semibold text-orange-700 bg-orange-100 rounded-md p-1 px-2">GUIDE</p>
									<p>Quickstart</p>						
								</a>

							</li>
							<li>
								<a 
									class="res-block"
									href="/docs/gradio/interface">
									<p class="float-right text-xs font-semibold text-green-700 bg-green-100 rounded-md p-1 px-2">DOCS</p>
									<p>Interface</p>						
								</a>

							</li>
							<li>
								<a 
									class="res-block"
									href="/docs/gradio/blocks">
									<p class="float-right text-xs font-semibold text-green-700 bg-green-100 rounded-md p-1 px-2">DOCS</p>
									<p>Blocks</p>						
								</a>

							</li>
					</ul>
				{/if}
			</div>
		</div>
{/if}

<style>
	.overlay {
		@apply fixed inset-0 z-30 backdrop-blur-sm bg-black/20;
	}

	.search-bar {
		@apply font-sans text-lg;
		z-index: 1;
		padding: 0 1rem;
		position: relative;
		display: flex;
		flex: none;
		align-items: center;
		border-bottom-width: 1px;
		--tw-border-opacity: 1;
		border-color: rgb(241 245 249 / var(--tw-border-opacity));
		color: #475469;
	}

	.search-bar input {
		@apply text-lg;
		appearance: none;
		background: #0000;
		height: 3.5rem;
		color: #0f172a;
		margin-left: .25rem;
		margin-right: .25rem;
		flex: auto;
		min-width: 0;
		border: none;
		outline: none;
		box-shadow: none;
		cursor: text;
	} 


	.content {
		position: fixed;
		left: 50%;
		top: 20%;
		translate: -50% -0%;
		margin: 0 auto;
		width: 90vw;
		max-width: 47.375rem;
		display: flex;
		flex-direction: column;
		min-height: 0;
		border-radius: .5rem;
		box-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;
		background: #fff;
		z-index: 40;
	}

	.results {
		@apply p-5;
		max-height: 60vh;
		overflow-y: auto;
		scrollbar-width: thin;

		& ol {
			margin-block-start: 2px;
		}

		& li:not(:last-child) {
			margin-block-end: 4px;
			padding-block-end: 4px;
		}

		& a {
			display: block;
		}

	}

	.search-button {
		@apply flex flex-row rounded-full items-center cursor-pointer px-2 text-gray-400 border-gray-300 border text-lg outline-none font-sans;
	}

	:global(.res-content .mark) {
		color: #ff7c00;
		text-decoration: underline;
	}
	:global(.res-content) {
		@apply text-gray-500
	}
	:global(.res-block) {
		@apply m-2 p-2 border border-gray-100 rounded-md bg-gray-50 hover:bg-gray-100 hover:scale-[1.01] focus:bg-gray-100 focus:scale-[1.01] focus:outline-none
	}

</style>