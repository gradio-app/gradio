<script lang="ts">
	import { Client } from "@gradio/client";
	import { onMount } from "svelte";
	import { BaseCode } from "@gradio/code";

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

	const submit = (): void => {
		if (prompt.trim() === "") return;

		// Clear diff stats when submitting new prompt
		diffStats = null;

		const userMessageIndex = message_history.length;
		message_history = [...message_history, { text: prompt, isBot: false }];

		const botMessageIndex = message_history.length;
		message_history = [
			...message_history,
			{ text: "Working...", isBot: true, isPending: true }
		];

		const userPrompt = prompt;
		prompt = "";

		const post = app.post_data(`${root}/gradio_api/vibe-edit/`, {
			prompt: userPrompt
		});
		post
			.then(([response, status_code]) => {
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
			})
			.catch((error) => {
				message_history = message_history.map((msg, index) =>
					index === botMessageIndex
						? { text: "Error occurred.", isBot: true, isPending: false }
						: msg
				);
			});
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

	const updateCode = async (): Promise<void> => {
		try {
			await app.post_data(`${root}/gradio_api/vibe-code/`, {
				code: codeValue
			});
		} catch (error) {
			console.error("Failed to update code:", error);
		}
	};

	$: app, fetchCode();

	onMount(() => {
		return () => {
			document.removeEventListener("mousemove", handleResizeMove);
			document.removeEventListener("mouseup", handleResizeEnd);
		};
	});
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
			<div class="message-history">
				{#each message_history as message, index}
					<div
						class="message-item"
						class:bot-message={message.isBot}
						class:user-message={!message.isBot}
					>
						<div class="message-content">
							<span class="message-text">{message.text}</span>
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
						show_line_numbers={true}
						autocomplete={false}
					/>
				</div>
				<button class="update-code-button" on:click={updateCode}>
					Update Code
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
			on:click={submit}
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

	.update-code-button:hover {
		background: var(--button-primary-background-fill-hover);
	}

	.message-history {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.message-item {
		padding: 12px;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-color-primary);
		word-wrap: break-word;
		line-height: 1.4;
		border-color: var(--border-color-primary);
	}

	.user-message {
		margin-left: 20px;
	}

	.bot-message {
		margin-right: 20px;
	}

	.message-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
	}

	.message-text {
		color: var(--body-text-color);
		word-wrap: break-word;
		line-height: 1.4;
		flex: 1;
	}

	.undo-button {
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--button-small-padding);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
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
</style>
