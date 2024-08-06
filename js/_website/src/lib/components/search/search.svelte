<script lang="ts">
	import Search_Worker from "./search-worker?worker";
	import SearchIcon from "./SearchIcon.svelte";
	import { onNavigate } from "$app/navigation";
	import type { Result } from "./search";
	import { browser } from "$app/environment";

	let search: "idle" | "load" | "ready" = "idle";
	let search_term = "";
	let results: Result[] = [];
	let search_worker: Worker;

	function initialize() {
		open = true;
		if (search === "ready") return;
		search = "load";
		search_worker = new Search_Worker();
		search_worker.addEventListener("message", (e) => {
			const { type, payload } = e.data;
			type === "ready" && (search = "ready");
			type === "results" && (results = payload.results);
		});
		search_worker.postMessage({ type: "load" });
	}

	let open: boolean = false;

	onNavigate(() => {
		open = false;
	});

	$: if (search === "ready") {
		search_worker.postMessage({ type: "search", payload: { search_term } });
	}

	$: if (search_term && !open) {
		search_term = "";
	}

	let content_elem: HTMLElement;
	let search_button_elem: HTMLElement;

	function focus_input(el: HTMLInputElement) {
		el.focus();
	}

	function get_os(): string {
		// @ts-ignore - userAgentData is not yet in the TS types as it is currently experimental
		if (typeof navigator !== "undefined") {
			const userAgent = navigator.userAgent.toLowerCase();
			if (userAgent.indexOf("win") > -1) return "Windows";
			if (userAgent.indexOf("mac") > -1) return "MacOS";
			if (userAgent.indexOf("linux") > -1) return "Linux";
			if (userAgent.indexOf("android") > -1) return "Android";
			if (userAgent.indexOf("iphone") > -1 || userAgent.indexOf("ipad") > -1)
				return "iOS";
		}
		return "Unknown";
	}

	let meta_key = "⌘";

	$: if (browser && navigator) {
		let os = get_os();
		meta_key = os === "MacOS" || os === "iOS" ? "⌘" : "CTRL+";
	}

	function handle_key_down(e: KeyboardEvent): void {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === "k" || e.key === "K") {
				e.preventDefault();
				initialize();
			}
		}
		if (e.key === "Escape") {
			open = false;
		}
		if ((e.key === "ArrowUp" || e.key === "ArrowDown") && open) {
			e.preventDefault();
			const current = document.activeElement;
			const items = [...document.getElementsByClassName("res-block")];

			const current_index = current ? items.indexOf(current) : -1;
			let new_index;
			if (current_index === -1) {
				new_index = 1;
			} else {
				if (e.key === "ArrowUp") {
					new_index = (current_index + items.length - 1) % items.length;
				} else {
					new_index = (current_index + 1) % items.length;
				}
			}

			(current as HTMLElement).blur();

			const newElement = items[new_index] as HTMLElement;
			if (newElement) {
				newElement.focus();
				document
					.querySelectorAll(".res-block")
					.forEach((el) => el.classList.remove("first-res"));
			}
		}
		const search_input = document.getElementById(
			"search-input"
		) as HTMLInputElement;
		const first_result = document.querySelector(".res-block") as HTMLElement;
		if (e.key === "Enter" && document.activeElement === search_input) {
			first_result.click();
		}
	}

	function on_click(e: MouseEvent) {
		if (content_elem) {
			if (!content_elem.contains(e.target as Node) && open) {
				open = false;
			}
		} else {
			if (search_button_elem.contains(e.target as Node)) {
				initialize();
			}
		}
	}

	$: if (browser && document.querySelector(".res-block")) {
		document.querySelector(".res-block")?.classList.add("first-res");
	}
</script>

<svelte:window on:keydown={handle_key_down} on:click={on_click} />

<button class="search-button" bind:this={search_button_elem}>
	<SearchIcon />
	<span class="pl-1 pr-5">Search</span>
	<div class="shortcut">
		<div class="text-sm">
			{meta_key}K
		</div>
	</div>
</button>

{#if open}
	<div class="overlay" />
	<div class="content" bind:this={content_elem}>
		<div class="search-bar">
			{#if search === "load"}
				<div class="loader"></div>
			{:else}
				<SearchIcon />
			{/if}
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
				id="search-input"
			/>
			<button
				on:click={() => {
					open = false;
				}}
				class="text-xs font-semibold rounded-md p-1 border-gray-300 border"
			>
				ESC
			</button>
		</div>
		<div class="results">
			{#if results.length}
				<ul>
					{#each results as result, i}
						{#if result.content.length > 0}
							<li>
								<a
									class="res-block"
									class:first-res={i === 0}
									href={result.slug}
								>
									<p
										class:text-green-700={result.type == "DOCS"}
										class:bg-green-100={result.type == "DOCS"}
										class:text-orange-700={result.type == "GUIDE"}
										class:bg-orange-100={result.type == "GUIDE"}
										class="float-left text-xs font-semibold rounded-md p-1 px-2 mx-1 mt-[3px]"
									>
										{result.type}
									</p>
									<div class="float-right">
										<div class="enter">↵</div>
									</div>
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
					{#if search === "load"}
						<p class="mx-auto w-fit text-gray-500">Searching for results...</p>
					{:else}
						<p class="mx-auto w-fit text-gray-500">
							No results found. Try using a different term.
						</p>
					{/if}
				{/if}
				<ul>
					<p class="">Suggestions</p>
					<li>
						<a class="res-block first-res" href="/quickstart">
							<p
								class="float-left text-xs mx-1 font-semibold text-orange-700 bg-orange-100 rounded-md p-1 px-2 mt-[3px]"
							>
								GUIDE
							</p>
							<div class="float-right">
								<div class="enter">↵</div>
							</div>
							<p>Quickstart</p>
						</a>
					</li>
					<li>
						<a class="res-block" href="/docs/gradio/interface">
							<p
								class="float-left text-xs font-semibold text-green-700 bg-green-100 rounded-md p-1 px-2 mx-1 mt-[3px]"
							>
								DOCS
							</p>
							<div class="float-right">
								<div class="enter">↵</div>
							</div>
							<p>Interface</p>
						</a>
					</li>
					<li>
						<a class="res-block" href="/docs/gradio/blocks">
							<p
								class="float-left text-xs font-semibold text-green-700 bg-green-100 rounded-md p-1 px-2 mx-1 mt-[3px]"
							>
								DOCS
							</p>
							<div class="float-right">
								<div class="enter">↵</div>
							</div>
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
		@apply font-sans text-lg z-10 px-4 relative flex flex-none items-center border-b border-gray-100 text-gray-500;
	}

	.search-bar input {
		@apply text-lg appearance-none h-14 text-black mx-1	flex-auto min-w-0 border-none cursor-text;
		outline: none;
		box-shadow: none;
	}

	.content {
		@apply fixed left-1/2 top-[7%] -translate-x-1/2 mx-auto w-[95vw] max-w-3xl flex flex-col min-h-0 rounded-lg shadow-2xl bg-white z-40;
	}

	.results {
		@apply p-5 overflow-y-auto;
		max-height: 60vh;
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
		@apply text-gray-500;
	}
	:global(.res-block) {
		@apply m-2 p-2 border border-gray-100 rounded-md bg-gray-50 hover:bg-gray-100 hover:scale-[1.01] focus:bg-gray-100 focus:scale-[1.01] focus:outline-none;
	}
	:global(.first-res) {
		@apply bg-gray-100 scale-[1.01];
	}

	:global(.res-block:focus .enter) {
		display: block !important;
	}
	:global(.first-res .enter) {
		display: block !important;
	}

	.enter {
		display: none;
	}

	.enter {
		@apply text-xs font-semibold rounded-md p-1 border-gray-300 border text-gray-500 font-sans bg-white;
	}

	.loader {
		border: 1px solid #d0cfcf;
		border-top: 2px solid #475469;
		border-radius: 50%;
		width: 15px;
		height: 15px;
		animation: spin 1.2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
