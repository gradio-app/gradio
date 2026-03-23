<script lang="ts">
	import IconCopy from "./icons/IconCopy.svelte";
	import IconCheck from "./icons/IconCheck.svelte";
	import IconArrowUpRight from "./icons/IconArrowUpRight.svelte";
	import IconCaret from "./icons/IconCaret.svelte";
	import IconHuggingChat from "./icons/IconHuggingChat.svelte";
	import { tick } from "svelte";

	export let doc_name: string;

	let copied = false;
	let loading = false;
	let open = false;
	let triggerEl: HTMLDivElement | null = null;
	let menuEl: HTMLDivElement | null = null;
	let menuStyle = "";

	const isClient = typeof window !== "undefined";

	function openMenu(): void {
		open = true;
		if (isClient && triggerEl) {
			void tick().then(() => {
				if (!triggerEl) return;
				const rect = triggerEl.getBoundingClientRect();
				const gutter = 6;
				const minWidth = Math.max(rect.width + 80, 220);
				const right = Math.max(window.innerWidth - rect.right, gutter);
				menuStyle = `top:${rect.bottom + gutter}px;right:${right}px;min-width:${minWidth}px;`;
			});
		}
	}

	function closeMenu(): void {
		open = false;
	}

	function toggleMenu(): void {
		open ? closeMenu() : openMenu();
	}

	async function fetchMarkdown(): Promise<string> {
		try {
			const response = await fetch(`/api/markdown/${doc_name}`);
			if (response.ok) {
				const data = await response.json();
				return data.markdown || "";
			}
		} catch (error) {
			console.error("Error fetching markdown:", error);
		}
		return "";
	}

	async function copyMarkdown(): Promise<void> {
		if (loading) return;
		loading = true;

		try {
			const markdown_content = await fetchMarkdown();
			if (!markdown_content) {
				console.warn("Nothing to copy");
				loading = false;
				return;
			}

			const hasNavigatorClipboard =
				typeof navigator !== "undefined" &&
				!!navigator.clipboard &&
				typeof navigator.clipboard.writeText === "function";

			if (hasNavigatorClipboard) {
				await navigator.clipboard.writeText(markdown_content);
			} else {
				console.warn("Clipboard API unavailable");
				loading = false;
				return;
			}

			copied = true;
			setTimeout(() => {
				copied = false;
			}, 1500);
		} catch (error) {
			console.error("Failed to copy:", error);
		} finally {
			loading = false;
		}
	}

	// Maximum URL length to avoid server errors
	// HuggingChat has an ~8KB limit
	const MAX_URL_LENGTH = 8000;

	async function openHuggingChat(): Promise<void> {
		if (loading) return;
		loading = true;

		try {
			const markdown_content = await fetchMarkdown();

			let prompt = `--------------------------------
${markdown_content}
--------------------------------

Read the documentation above so I can ask questions about it.`;

			let encodedPromptText = encodeURIComponent(prompt);
			let url = `https://huggingface.co/chat/?prompt=${encodedPromptText}`;

			if (url.length > MAX_URL_LENGTH) {
				const baseUrl = "https://huggingface.co/chat/?prompt=";
				const wrapperText = `--------------------------------\n\n--------------------------------\n\n[Content truncated due to length. Copy the full page using "Copy Page" and paste into chat.]\n\nRead the documentation above so I can ask questions about it.`;
				const availableChars =
					MAX_URL_LENGTH -
					baseUrl.length -
					encodeURIComponent(wrapperText).length;

				const truncatedContent = markdown_content.substring(
					0,
					Math.floor(availableChars / 1.5)
				);

				prompt = `--------------------------------
${truncatedContent}

[Content truncated due to length. Copy the full page using "Copy Page" and paste into chat.]
--------------------------------

Read the documentation above so I can ask questions about it.`;

				encodedPromptText = encodeURIComponent(prompt);
				url = `https://huggingface.co/chat/?prompt=${encodedPromptText}`;
			}

			if (isClient) {
				window.open(url, "_blank", "noopener,noreferrer");
			}
		} catch (error) {
			console.error("Failed to open HuggingChat:", error);
		} finally {
			loading = false;
			closeMenu();
		}
	}

	function handleWindowPointer(event: MouseEvent): void {
		if (!open || !isClient) return;
		const targetNode = event.target as Node;
		if (menuEl?.contains(targetNode) || triggerEl?.contains(targetNode)) {
			return;
		}
		closeMenu();
	}

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape" && open) {
			closeMenu();
		}
	}

	function handleWindowResize(): void {
		if (open) closeMenu();
	}

	function handleWindowScroll(): void {
		if (open) closeMenu();
	}
</script>

<svelte:window
	on:mousedown={handleWindowPointer}
	on:keydown={handleWindowKeydown}
	on:resize={handleWindowResize}
	on:scroll={handleWindowScroll}
/>

<div class="container-wrapper">
	<div bind:this={triggerEl} class="trigger-wrapper">
		<button
			on:click={() => copyMarkdown()}
			class="copy-button"
			aria-live="polite"
			disabled={loading}
		>
			<span class="icon-wrapper">
				{#if copied}
					<IconCheck />
				{:else}
					<IconCopy />
				{/if}
			</span>
			<span>{copied ? "Copied!" : loading ? "Loading..." : "Copy Page"}</span>
		</button>
		<button
			on:click={toggleMenu}
			class="menu-toggle-button"
			aria-haspopup="menu"
			aria-expanded={open}
			aria-label={open ? "Close copy menu" : "Open copy menu"}
		>
			<IconCaret
				classNames={`caret-icon ${open ? "rotate-180" : "rotate-0"}`}
			/>
		</button>
	</div>

	{#if open}
		<div
			class="backdrop-overlay"
			aria-hidden="true"
			style="background: transparent;"
			on:click={closeMenu}
		></div>
		<div
			bind:this={menuEl}
			role="menu"
			class="menu-dropdown"
			style={menuStyle}
			aria-label="Copy menu"
		>
			<button
				role="menuitem"
				on:click={() => {
					copyMarkdown();
					closeMenu();
				}}
				class="base-menu-item"
			>
				<div class="menu-icon-container">
					<IconCopy classNames="menu-icon" />
				</div>
				<div class="menu-text-container">
					<div class="menu-text-primary">Copy Page</div>
					<div class="menu-text-secondary">Copy Page as Markdown for LLMs</div>
				</div>
			</button>

			<button
				role="menuitem"
				on:click={() => openHuggingChat()}
				class="base-menu-item"
			>
				<div class="menu-icon-container">
					<IconHuggingChat classNames="menu-icon" />
				</div>
				<div class="menu-text-container">
					<div class="menu-text-primary">
						Open in HuggingChat
						<IconArrowUpRight classNames="menu-icon-arrow" />
					</div>
					<div class="menu-text-secondary">Ask Questions About This Page</div>
				</div>
			</button>
		</div>
	{/if}
</div>

<style>
	.container-wrapper {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		min-width: 100px;
		justify-content: flex-end;
		margin-left: auto;
	}

	@media (max-width: 640px) {
		.container-wrapper {
			min-width: 50px;
		}
	}

	.trigger-wrapper {
		display: inline-flex;
		border-radius: 0.375rem;
	}

	@media (max-width: 640px) {
		.trigger-wrapper {
			border-radius: 0.125rem;
		}
	}

	.icon-wrapper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		padding: 0.125rem;
	}

	@media (max-width: 640px) {
		.icon-wrapper {
			padding: 0;
		}
	}

	.menu-toggle-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		font-size: 0.875rem;
		color: rgb(107, 114, 128);
		border-radius: 0;
		border-top-right-radius: 0.375rem;
		border-bottom-right-radius: 0.375rem;
		border: 1px solid rgb(229, 231, 235);
		border-left: none;
		background-color: white;
		transition: all 0.2s ease-in-out;
	}

	.menu-toggle-button:disabled {
		pointer-events: none;
	}

	.menu-toggle-button:hover {
		color: rgb(55, 65, 81);
		box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
	}

	@media (max-width: 640px) {
		.menu-toggle-button {
			width: 1.25rem;
			height: 1.25rem;
			border-top-right-radius: 0.125rem;
			border-bottom-right-radius: 0.125rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		.menu-toggle-button {
			border-color: rgb(38, 38, 38);
			background-color: rgb(10, 10, 10);
			color: rgb(229, 231, 235);
		}

		.menu-toggle-button:hover {
			color: white;
			background-color: rgb(31, 41, 55);
		}
	}

	.backdrop-overlay {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 40;
	}

	.menu-dropdown {
		position: fixed;
		z-index: 50;
		backdrop-filter: blur(24px);
		border-radius: 0.75rem;
		max-height: 420px;
		overflow-y: auto;
		padding: 0.25rem;
		border: 1px solid rgb(229, 231, 235);
		display: flex;
		flex-direction: column;
		background-color: white;
		color: rgb(31, 41, 55);
	}

	@media (prefers-color-scheme: dark) {
		.menu-dropdown {
			border-color: rgb(38, 38, 38);
			background-color: rgb(10, 10, 10);
			color: rgb(229, 231, 235);
		}
	}

	.menu-icon-container {
		border: 1px solid rgb(229, 231, 235);
		border-radius: 0.5rem;
		padding: 0.375rem;
	}

	@media (prefers-color-scheme: dark) {
		.menu-icon-container {
			border-color: rgb(38, 38, 38);
		}
	}

	.menu-text-container {
		display: flex;
		flex-direction: column;
		padding-left: 0.25rem;
		padding-right: 0.25rem;
	}

	.menu-text-primary {
		font-size: 14px;
		color: rgb(31, 41, 55);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: -5px;
	}

	@media (prefers-color-scheme: dark) {
		.menu-text-primary {
			color: rgb(209, 213, 219);
		}
	}

	.menu-text-secondary {
		font-size: 0.75rem;
		color: rgb(75, 85, 99);
	}

	@media (prefers-color-scheme: dark) {
		.menu-text-secondary {
			color: rgb(156, 163, 175);
		}
	}

	.copy-button {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 24px;
		padding-left: 8px;
		padding-right: 6px;
		font-size: 11px;
		font-weight: 500;
		color: rgb(31, 41, 55);
		border: 1px solid rgb(229, 231, 235);
		border-radius: 6px;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		background-color: white;
	}

	.copy-button:disabled {
		opacity: 0.7;
	}

	@media (max-width: 640px) {
		.copy-button {
			gap: 2px;
			height: 20px;
			padding-left: 6px;
			padding-right: 6px;
			font-size: 9px;
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
		}
	}

	.copy-button:hover:not(:disabled) {
		box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.copy-button {
			border-color: rgb(38, 38, 38);
			background-color: rgb(10, 10, 10);
			color: rgb(229, 231, 235);
		}

		.copy-button:hover:not(:disabled) {
			background-color: rgb(38, 38, 38);
		}
	}

	.base-menu-item {
		cursor: pointer;
		font-size: 11px;
		position: relative;
		width: 100%;
		user-select: none;
		outline: none;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding-left: 0.375rem;
		padding-right: 0.375rem;
		padding-top: 0.375rem;
		padding-bottom: 0.375rem;
		border-radius: 0.75rem;
		text-align: left;
		transition: all 0.2s ease-in-out;
		border-color: #e5e7eb;
		background-color: #ffffff;
	}

	.base-menu-item:hover {
		box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.base-menu-item {
			border-color: #1f2937;
			background-color: #0f1117;
			color: #e5e7eb;
		}

		.base-menu-item:hover {
			background-color: #1f2937;
		}
	}
</style>
