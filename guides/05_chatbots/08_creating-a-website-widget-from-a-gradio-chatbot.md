# 🚀 Creating a Website Chat Widget with Gradio 🚀

Tags: CHAT, DEPLOY, WEB

You can make your Gradio Chatbot available as an embedded chat widget on your website, similar to popular customer service widgets like Intercom. This is particularly useful for:

- Adding AI assistance to your documentation pages
- Providing interactive help on your portfolio or product website
- Creating a custom chatbot interface for your Gradio app

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/Screen%20Recording%202024-12-19%20at%203.32.46%E2%80%AFPM.gif)

## How does it work?

The chat widget appears as a small button in the corner of your website. When clicked, it opens a chat interface that communicates with your Gradio app via the JavaScript Client API. Users can ask questions and receive responses directly within the widget.


## Prerequisites

* A running Gradio app (local or on Hugging Face Spaces). In this example, we'll use the [Gradio Playground Space](https://huggingface.co/spaces/abidlabs/gradio-playground-bot), which helps generate code for Gradio apps based on natural language descriptions.

### 1. Create and Style the Chat Widget

First, add this HTML and CSS to your website:

```html
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
```

### 2. Add the JavaScript

Then, add the following JavaScript code (which uses the Gradio JavaScript Client to connect to the Space) to your website by including this in the `<head>` section of your website:

```html
<script type="module">
    import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
    
    async function initChatWidget() {
        const client = await Client.connect("https://abidlabs-gradio-playground-bot.hf.space");
        
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
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;

            appendMessage(userMessage, 'user');
            chatInput.value = '';

            try {
                const result = await client.predict("/chat", {
                    message: {"text": userMessage, "files": []}
                });
                const message = result.data[0];
                console.log(result.data[0]);
                const botMessage = result.data[0].join('\n');
                appendMessage(botMessage, 'bot');
            } catch (error) {
                console.error('Error:', error);
                appendMessage('Sorry, there was an error processing your request.', 'bot');
            }
        }
    
        function appendMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            
            if (sender === 'bot') {
                messageDiv.innerHTML = marked.parse(text);
            } else {
                messageDiv.textContent = text;
            }
            
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

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/Screen%20Recording%202024-12-19%20at%203.32.46%E2%80%AFPM.gif)

If you build a website widget from a Gradio app, feel free to share it on X and tag [the Gradio account](https://x.com/Gradio), and we are happy to help you amplify!