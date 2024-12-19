# 🚀 Creating a Website Chat Widget with Gradio 🚀

Tags: CHAT, DEPLOY, WEB

You can make your Gradio app available as an embedded chat widget on your website, similar to popular customer service widgets like Intercom. This is particularly useful for:

- Adding AI assistance to your documentation pages
- Providing interactive help on your portfolio or product website
- Creating a custom chatbot interface for your Gradio app

## How does it work?

The chat widget appears as a small button in the corner of your website. When clicked, it opens a chat interface that communicates with your Gradio app via the JavaScript Client API. Users can ask questions and receive responses directly within the widget.

![Widget Demo GIF placeholder]

## Prerequisites

* A running Gradio app (local or on Hugging Face Spaces). In this example, we'll use the [Gradio Studio Space](https://huggingface.co/spaces/abidlabs/gradio-playground-bot), which helps generate code for Gradio apps based on natural language descriptions.

### 1. Add the Gradio Client Library

First, add the Gradio JavaScript client to your website by including this script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@gradio/client"></script>
```

### 2. Create the Chat Widget

Add this HTML and JavaScript to your website:

```html
<!-- Chat Widget HTML -->
<div id="chat-widget" class="chat-widget">
    <button id="chat-toggle" class="chat-toggle">💬</button>
    <div id="chat-container" class="chat-container hidden">
        <div id="chat-header">
            <h3>Gradio Assistant</h3>
            <button id="close-chat">×</button>
        </div>
        <div id="chat-messages"></div>
        <div id="chat-input-area">
            <input type="text" id="chat-input" placeholder="Ask a question...">
            <button id="send-message">Send</button>
        </div>
    </div>
</div>

<style>
.chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.chat-toggle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #007bff;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.chat-container {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
}

.chat-container.hidden {
    display: none;
}

#chat-header {
    padding: 10px;
    background: #007bff;
    color: white;
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
}

#chat-input-area {
    padding: 10px;
    border-top: 1px solid #eee;
    display: flex;
}

#chat-input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 8px;
}

.message {
    margin: 8px 0;
    padding: 8px;
    border-radius: 4px;
}

.user-message {
    background: #e9ecef;
    margin-left: 20px;
}

.bot-message {
    background: #f8f9fa;
    margin-right: 20px;
}
</style>

<script>
async function initChatWidget() {
    const client = new GradioClient("https://abidlabs-gradio-playground-bot.hf.space");
    
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const messagesContainer = document.getElementById('chat-messages');

    chatToggle.addEventListener('click', () => {
        chatContainer.classList.remove('hidden');
    });

    closeChat.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        appendMessage(message, 'user');
        chatInput.value = '';

        try {
            // Send to Gradio app
            const result = await client.submit("/chat", [message]);
            
            // Add bot response to chat
            appendMessage(result.data[0], 'bot');
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Sorry, there was an error processing your request.', 'bot');
        }
    }

    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

initChatWidget();
</script>
```

### 3. That's it!

Your website now has a chat widget that connects to your Gradio app! Users can click the chat button to open the widget and start interacting with your app.

### Customization

You can customize the appearance of the widget by modifying the CSS. Some ideas:
- Change the colors to match your website's theme
- Adjust the size and position of the widget
- Add animations for opening/closing
- Modify the message styling

You can also enhance the functionality by:
- Adding typing indicators
- Supporting markdown formatting in responses
- Implementing message history
- Adding user authentication
