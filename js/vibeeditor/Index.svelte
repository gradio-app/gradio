<script lang="ts">
	import { Client } from "@gradio/client";
	import { onMount, tick } from "svelte";
	import { BaseCode } from "@gradio/code";
	import { BaseMarkdown } from "@gradio/markdown";

	export let app: Client;
	export let root: string;
	let prompt = "";
	let editorWidth = 350;
	let isResizing = false;
	let editorElement: HTMLDivElement;
	let activeTab: "chat" | "code" = "chat";

	let codeValue = "";
	let diffStats: { lines_added: number; lines_removed: number } | null = null;

	interface Message {
		text: string;
		isBot: boolean;
		isPending?: boolean;
		hash?: string;
	}

	let message_history: Message[] = [];

	let history_elem: HTMLDivElement;

	const scroll_to_bottom = (behavior: "smooth" | "auto" = "smooth"): void => {
		if (!history_elem) return;
		history_elem.scrollTo({
			top: history_elem.scrollHeight,
			behavior: behavior
		});
	};

	let starterQueries: string[] = [];

	const fetchStarterQueries = async (): Promise<void> => {
		const post = app.post_data(`${root}/gradio_api/vibe-starter-queries/`, {});
		post
			.then(async ([response, status_code]) => {
				if (status_code !== 200) {
					throw new Error(`Error: ${status_code}`);
				}
				const responseData = response as {
					starter_queries: string[];
				};
				starterQueries = responseData.starter_queries;
			})
			.catch(async (error) => {
				console.error("Failed to fetch starter queries:", error);
			});
	};

	fetchStarterQueries();

	const submit = async (queryText?: string): Promise<void> => {
		const textToSubmit = queryText || prompt;
		if (textToSubmit.trim() === "") return;

		// Clear diff stats when submitting new prompt
		diffStats = null;

		const userMessageIndex = message_history.length;
		message_history = [
			...message_history,
			{ text: textToSubmit, isBot: false }
		];

		const botMessageIndex = message_history.length;
		message_history = [
			...message_history,
			{ text: "Working...", isBot: true, isPending: true }
		];

		await tick();
		scroll_to_bottom();

		const userPrompt = textToSubmit;
		if (!queryText) {
			prompt = "";
		}

		const post = app.post_data(`${root}/gradio_api/vibe-edit/`, {
			prompt: userPrompt
		});
		post
			.then(async ([response, status_code]) => {
				if (status_code !== 200) {
					throw new Error(`Error: ${status_code}`);
				}

				const responseData = response as {
					hash: string;
					diff_stats: { lines_added: number; lines_removed: number };
					reasoning: string;
				};

				// Update diff stats from response
				diffStats = responseData.diff_stats;

				message_history = message_history.map((msg, index) => {
					console.log(index, userMessageIndex, responseData.hash);
					return index === userMessageIndex
						? { ...msg, hash: responseData.hash }
						: msg;
				});

				message_history = message_history.map((msg, index) =>
					index === botMessageIndex
						? {
								text: responseData.reasoning ? responseData.reasoning : "Done.",
								isBot: true,
								isPending: false
							}
						: msg
				);
				await tick();
				scroll_to_bottom();
			})
			.catch(async (error) => {
				message_history = message_history.map((msg, index) =>
					index === botMessageIndex
						? { text: "Error occurred.", isBot: true, isPending: false }
						: msg
				);
				await tick();
				scroll_to_bottom();
			});
	};

	const handleStarterQuery = async (query: string): Promise<void> => {
		await submit(query);
	};

	const undoMessage = async (
		hash: string,
		messageIndex: number
	): Promise<void> => {
		try {
			await app.post_data(`${root}/gradio_api/undo-vibe-edit/`, { hash });

			// Clear diff stats when undoing
			diffStats = null;

			const messageToUndo = message_history[messageIndex];
			prompt = messageToUndo.text;

			message_history = message_history.slice(0, messageIndex);
		} catch (error) {
			console.error("Failed to undo:", error);
		}
	};

	const handleResizeStart = (e: MouseEvent): void => {
		e.preventDefault();
		isResizing = true;
		document.addEventListener("mousemove", handleResizeMove);
		document.addEventListener("mouseup", handleResizeEnd);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	};

	const handleResizeMove = (e: MouseEvent): void => {
		if (!isResizing) return;

		const minWidth = 250;
		const maxWidth = Math.min(800, window.innerWidth * 0.5);
		const newWidth = window.innerWidth - e.clientX;

		editorWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

		// Dispatch custom event to update the main content margin
		window.dispatchEvent(
			new CustomEvent("vibeEditorResize", {
				detail: { width: editorWidth }
			})
		);
	};

	const handleResizeEnd = (): void => {
		isResizing = false;
		document.removeEventListener("mousemove", handleResizeMove);
		document.removeEventListener("mouseup", handleResizeEnd);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	};

	const fetchCode = async (): Promise<void> => {
		try {
			const response = await fetch(`${root}/gradio_api/vibe-code/`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			});
			if (response.ok) {
				const data = await response.json();
				codeValue = data.code;
			}
		} catch (error) {
			console.error("Failed to fetch code:", error);
		}
	};

	let code_updated = false;

	const updateCode = async (): Promise<void> => {
		try {
			await app.post_data(`${root}/gradio_api/vibe-code/`, {
				code: codeValue
			});
			code_updated = true;
			setTimeout(() => {
				code_updated = false;
			}, 1000);
		} catch (error) {
			console.error("Failed to update code:", error);
		}
	};

	$: app, fetchCode();

	$: if (activeTab === "chat") {
		tick().then(() => scroll_to_bottom("auto"));
	}

	$: code_updated;

	function create_spaces_url(): void {
		const base_URL = "https://huggingface.co/new-space";
		const params = new URLSearchParams({
			name: "new-space",
			sdk: "gradio"
		});
		const encoded_content = codeValue.trimStart();
		params.append("files[0][path]", "app.py");
		params.append("files[0][content]", encoded_content);
		window.open(`${base_URL}?${params.toString()}`, "_blank")?.focus();
	}

	onMount(() => {
		return () => {
			document.removeEventListener("mousemove", handleResizeMove);
			document.removeEventListener("mouseup", handleResizeEnd);
		};
	});

	$: starterQueries;
</script>

<div
	class="vibe-editor"
	bind:this={editorElement}
	style="width: {editorWidth}px;"
>
	<button
		class="resize-handle"
		aria-label="Resize sidebar"
		on:mousedown={handleResizeStart}
	></button>
	<div class="tab-header">
		<button
			class="tab-button"
			class:active={activeTab === "chat"}
			on:click={() => (activeTab = "chat")}
		>
			Chat
		</button>
		<button
			class="tab-button"
			class:active={activeTab === "code"}
			on:click={() => (activeTab = "code")}
		>
			Code
			{#if diffStats && (diffStats.lines_added > 0 || diffStats.lines_removed > 0)}
				<span class="diff-stats">
					{#if diffStats.lines_added > 0}
						<span class="added">+{diffStats.lines_added}</span>
					{/if}
					{#if diffStats.lines_removed > 0}
						<span class="removed">-{diffStats.lines_removed}</span>
					{/if}
				</span>
			{/if}
		</button>
	</div>

	<div class="tab-content">
		{#if activeTab === "chat"}
			<div class="message-history" bind:this={history_elem}>
				{#each message_history as message, index}
					<div
						class="message-item"
						class:bot-message={message.isBot}
						class:user-message={!message.isBot}
					>
						<div class="message-content">
							<span class="message-text">
								<BaseMarkdown
									value={message.text}
									latex_delimiters={[]}
									theme_mode="system"
								/>
							</span>
							{#if !message.isBot && message.hash && !message.isPending}
								<button
									class="undo-button"
									on:click={() => undoMessage(message.hash || "", index)}
									title="Undo this change"
								>
									Undo
								</button>
							{/if}
						</div>
					</div>
				{/each}

				{#if message_history.length === 0}
					<div class="no-messages">No messages yet</div>
				{/if}

				{#if message_history.length === 0}
					<div class="starter-queries-container">
						<div class="starter-queries">
							{#each starterQueries as query}
								<button
									class="starter-query-button"
									on:click={() => handleStarterQuery(query)}
								>
									{query}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else if activeTab === "code"}
			<div class="code-content">
				<div class="code-editor-container">
					<BaseCode
						bind:value={codeValue}
						language="python"
						lines={10}
						dark_mode={false}
						basic={true}
						readonly={false}
						placeholder="Enter your code here..."
						wrap_lines={true}
					/>
				</div>
				<button
					class:updating={code_updated}
					class="update-code-button"
					on:click={updateCode}
				>
					{#if code_updated}
						Updated!
					{:else}
						Update Code
					{/if}
				</button>
				<button
					class="deploy-to-spaces-button"
					on:click={() => create_spaces_url()}
				>
					<span class="button-content">
						Deploy to
						<svg
							class="spaces-logo"
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							aria-hidden="true"
							focusable="false"
							role="img"
							preserveAspectRatio="xMidYMid meet"
							viewBox="0 0 39 40"
							><path
								d="M6.3712 2.04427C3.7183 2.04427 1.56771 4.19486 1.56771 6.84776V18.3546V18.6544V32.7341C1.56771 35.3868 3.71818 37.5377 6.3712 37.5377H17.878H20.7507H32.2575C34.9104 37.5377 37.0612 35.387 37.0612 32.7341V21.6204C37.0612 20.177 36.4252 18.8839 35.4189 18.004C36.4576 16.3895 37.0612 14.4666 37.0612 12.4046C37.0612 6.68274 32.4225 2.04427 26.7007 2.04427C24.6388 2.04427 22.7159 2.64776 21.1014 3.68647C20.2214 2.6802 18.9282 2.04427 17.4849 2.04427H6.3712Z"
								fill="black"
								class="stroke-white dark:stroke-white/10"
								stroke-width="3.07552"
							></path><path
								d="M9.56855 23.5001C8.8406 23.5001 8.25047 24.0902 8.25047 24.8182V29.5361C8.25047 30.2641 8.8406 30.8542 9.56855 30.8542H14.2864C15.0144 30.8542 15.6045 30.2641 15.6045 29.5361V24.8182C15.6045 24.0902 15.0143 23.5001 14.2864 23.5001H9.56855Z"
								fill="#FF3270"
							></path><path
								d="M24.3409 23.5001C23.613 23.5001 23.0228 24.0902 23.0228 24.8182V29.5361C23.0228 30.2641 23.613 30.8542 24.3409 30.8542H29.0588C29.7868 30.8542 30.3769 30.2641 30.3769 29.5361V24.8182C30.3769 24.0902 29.7868 23.5001 29.0588 23.5001H24.3409Z"
								fill="#861FFF"
							></path><path
								d="M9.56855 8.72815C8.8406 8.72815 8.25047 9.31827 8.25047 10.0462V14.7641C8.25047 15.4921 8.8406 16.0822 9.56855 16.0822H14.2864C15.0144 16.0822 15.6045 15.4921 15.6045 14.7641V10.0462C15.6045 9.31827 15.0143 8.72815 14.2864 8.72815H9.56855Z"
								fill="#097EFF"
							></path><path
								d="M26.6999 8.72815C24.6692 8.72815 23.0228 10.3744 23.0228 12.4052C23.0228 14.4359 24.6692 16.0822 26.6999 16.0822C28.7306 16.0822 30.3769 14.4359 30.3769 12.4052C30.3769 10.3744 28.7306 8.72815 26.6999 8.72815Z"
								fill="#FFD702"
							></path></svg
						>
						<span style="font-weight: 600;">Spaces</span>
					</span>
				</button>
			</div>
		{/if}
	</div>

	<div class="input-section">
		<div class="powered-by">Powered by: <code>gpt-oss</code></div>
		<textarea
			on:keydown={(e) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					submit();
				}
			}}
			bind:value={prompt}
			placeholder="What can I add or change?"
			class="prompt-input"
		/>
		<button
			on:click={() => submit()}
			class="submit-button"
			disabled={prompt.trim() === ""}
		>
			Send
		</button>
	</div>
</div>

<style>
	.vibe-editor {
		position: fixed;
		top: 0;
		right: 0;
		height: 100vh;
		background: var(--background-fill-primary);
		border-left: 1px solid var(--border-color-primary);
		display: flex;
		flex-direction: column;
		z-index: 100;
		box-shadow: var(--shadow-drop-lg);
		overflow: hidden;
	}

	.resize-handle {
		position: absolute;
		left: 0;
		top: 0;
		width: 4px;
		height: 100%;
		cursor: col-resize;
		background: transparent;
		border: none;
		border-left: 2px solid transparent;
		transition: border-color 0.2s ease;
		z-index: 101;
		padding: 0;
	}

	.resize-handle:hover {
		border-left-color: var(--color-accent);
	}

	.resize-handle:active {
		border-left-color: var(--color-accent);
		background: rgba(var(--color-accent-soft), 0.1);
	}

	.tab-header {
		display: flex;
		border-bottom: 1px solid var(--border-color-primary);
		background: var(--background-fill-secondary);
	}

	.tab-button {
		flex: 1;
		padding: 12px 16px;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		font-size: 14px;
		font-weight: 500;
		color: var(--body-text-color-subdued);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tab-button:hover {
		color: var(--body-text-color);
		background: var(--background-fill-primary);
	}

	.tab-button.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
		background: var(--background-fill-primary);
	}

	.tab-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.code-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 16px;
		gap: 12px;
		overflow: hidden;
	}

	.code-editor-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		min-height: 0; /* Allow flex child to shrink below content size */
	}

	.update-code-button {
		background: var(--button-primary-background-fill);
		color: var(--button-primary-text-color);
		border: none;
		border-radius: var(--button-large-radius);
		padding: 8px 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		align-self: flex-start;
		width: 100%;
	}

	.update-code-button.updating {
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
	}

	.update-code-button:hover {
		background: var(--button-primary-background-fill-hover);
	}

	.update-code-button.updating:hover {
		background: var(--button-secondary-background-fill);
	}

	.deploy-to-spaces-button {
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		border: none;
		border-radius: var(--button-large-radius);
		padding: 8px 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		align-self: flex-start;
		width: 100%;
	}

	.deploy-to-spaces-button:hover {
		background: var(--button-secondary-background-fill-hover);
	}

	.button-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		font-weight: 200;
	}

	.spaces-logo {
		width: 1em;
		height: 1em;
		vertical-align: middle;
		display: inline-block;
		margin-right: -3px;
	}

	.message-history {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		position: relative;
	}

	.message-item {
		position: relative;
		padding: 12px;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-color-primary);
		word-wrap: break-word;
		line-height: 1.4;
		border-color: var(--border-color-primary);
	}

	.user-message {
		margin-left: 20px;
		padding: 12px 64px 12px 12px;
	}

	.bot-message {
		margin-right: 20px;
	}

	.message-content {
		display: block;
	}

	.message-text {
		color: var(--body-text-color);
		word-wrap: break-word;
		line-height: 1.4;
		flex: 1;
	}

	.undo-button {
		position: absolute;
		top: 8px;
		right: 8px;
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--button-small-padding);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.undo-button:active {
		transform: translateY(0);
	}

	.no-messages {
		text-align: center;
		color: var(--body-text-color-subdued);
		font-style: italic;
		padding: 24px;
	}

	.input-section {
		padding: 16px;
		border-top: 1px solid var(--border-color-primary);
		background: var(--background-fill-secondary);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.prompt-input {
		width: 100%;
		min-height: 80px;
		background: var(--input-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--input-radius);
		padding: 12px;
		resize: vertical;
		outline: none;
		font-family: inherit;
		font-size: 14px;
		color: var(--body-text-color);
	}

	.prompt-input:focus {
		border-color: var(--color-accent);
	}

	.submit-button {
		background: var(--button-primary-background-fill);
		color: var(--button-primary-text-color);
		border: none;
		border-radius: var(--button-large-radius);
		padding: 10px 20px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.submit-button:hover:not(:disabled) {
		background: var(--button-primary-background-fill-hover);
	}

	.submit-button:disabled {
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		cursor: not-allowed;
	}

	.powered-by {
		text-align: right;
		font-size: 12px;
		color: var(--body-text-color-subdued);
	}

	.diff-stats {
		margin-left: 8px;
		display: inline-flex;
		gap: 4px;
		font-size: 11px;
		font-weight: 600;
	}

	.diff-stats .added {
		color: #22c55e;
	}

	.diff-stats .removed {
		color: #ef4444;
	}

	.starter-queries-container {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16px;
		gap: 12px;
		width: calc(100% - 32px);
		max-width: 500px;
	}

	.starter-queries {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
		width: 100%;
	}

	.starter-query-button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--spacing-lg);
		border: none;
		border-radius: var(--radius-lg);
		background-color: var(--block-background-fill);
		cursor: pointer;
		transition: all 150ms ease-in-out;
		width: 100%;
		gap: var(--spacing-sm);
		border: var(--block-border-width) solid var(--block-border-color);
		transform: translateY(0px);
		text-align: left;
		line-height: 1.4;
		word-wrap: break-word;
		white-space: normal;
		font-size: var(--text-md);
	}

	.starter-query-button:hover {
		transform: translateY(-2px);
		background-color: var(--color-accent-soft);
	}

	.starter-query-button:active {
		transform: translateY(0);
	}
</style>
