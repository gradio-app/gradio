<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div class="gradio-chatbot-wrapper">
			<div class="gradio-chatbot-container">
				<div class="gradio-chat-message bot">
					<div class="gradio-chat-bubble bot-bubble">Hi! How can I help?</div>
				</div>
				<div class="gradio-chat-message user">
					<div class="gradio-chat-bubble user-bubble">Hello!</div>
				</div>
				<div class="gradio-chat-message bot">
					<div class="gradio-chat-bubble bot-bubble">👋</div>
				</div>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/chatbot"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Chatbot
	</a>
</div>

<style>
	.gradio-chatbot-wrapper {
		width: 100%;
		background: rgb(249 250 251);
		border-radius: 0.375rem;
		padding: 0.5rem;
		overflow: hidden;
	}

	.gradio-chatbot-container {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	.gradio-chat-message {
		display: flex;
		width: 100%;
	}

	.gradio-chat-message.user {
		justify-content: flex-end;
	}

	.gradio-chat-message.bot {
		justify-content: flex-start;
	}

	.gradio-chat-bubble {
		max-width: 80%;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		line-height: 1rem;
		border: 1px solid;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		text-align: left;
	}

	.user-bubble {
		background-color: rgb(254 243 237);
		border-color: rgba(249, 115, 22, 0.3);
		color: rgb(31 41 55);
		border-bottom-right-radius: 0;
		align-self: flex-end;
		text-align: right;
	}

	.bot-bubble {
		background-color: rgb(243 244 246);
		border-color: rgb(229 231 235);
		color: rgb(31 41 55);
		border-bottom-left-radius: 0;
		align-self: flex-start;
		text-align: left;
	}

	:global(.dark) .gradio-chatbot-wrapper {
		background: rgb(38 38 38);
	}

	:global(.dark) .user-bubble {
		background-color: rgba(249, 115, 22, 0.15);
		border-color: rgba(249, 115, 22, 0.3);
		color: rgb(229 231 235);
	}

	:global(.dark) .bot-bubble {
		background-color: rgb(38 38 38);
		border-color: rgb(64 64 64);
		color: rgb(229 231 235);
	}
</style>
