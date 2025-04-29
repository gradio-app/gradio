# Using the Gradio Chatbot as an MCP Client

This guide will walk you through a Model Context Protocol (MCP) Client and Server implementation with Gradio. You'll build a Gradio chatbot that can respond as an LLM (using Anthropic's Claude API) as well as generate images (thanks to a separate Gradio MCP Server).

<video src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/mcp-guides.mp4" style="width:100%" controls preload> </video>

## What is MCP?

The Model Context Protocol (MCP) standardizes how applications provide context to LLMs. It allows Claude to interact with external tools, like image generators, file systems, or APIs, etc.

## Prerequisites

- Python 3.10+
- An Anthropic API key
- Basic understanding of Python programming

## Setup

First, install the required packages:

```bash
pip install gradio anthropic mcp
```

Create a `.env` file in your project directory and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

## Part 1: Building the MCP Server

The server provides tools that Claude can use. In this example, we'll create a server that generates images through [a HuggingFace space](https://huggingface.co/spaces/ysharma/SanaSprint).

Create a file named `gradio_mcp_server.py`:

```python
from mcp.server.fastmcp import FastMCP
import requests
import json
import sys
import io
import time

# Set UTF-8 encoding for stdout/stderr
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Initialize FastMCP server
mcp = FastMCP("huggingface_spaces_image_display")

@mcp.tool()
async def generate_image(prompt: str, width: int = 512, height: int = 512) -> str:
    """Generate an image using SanaSprint model.
    
    Args:
        prompt: Text prompt describing the image to generate
        width: Image width (default: 512)
        height: Image height (default: 512)
    """
    # API endpoint
    base_url = "https://ysharma-sanasprint.hf.space/gradio_api/call/infer"
    
    # Parameters
    payload = {
        "data": [
            prompt,               # User prompt
            "0.6B",               # Smallest model
            0,                    # Seed
            True,                 # Randomize seed
            width,                # Width
            height,               # Height
            4.0,                  # Guidance scale
            2                     # Minimum steps
        ]
    }
    
    headers = {"Content-Type": "application/json"}
    session = requests.Session()
    
    # Step 1: Make the POST request to get event ID
    response = session.post(
        base_url, 
        headers=headers, 
        json=payload, 
        timeout=60
    )
    response_data = response.json()
    
    if "event_id" not in response_data:
        return json.dumps({
            "type": "error",
            "message": "Failed to get event ID from service"
        })
    
    event_id = response_data["event_id"]
    
    # Step 2: Poll for results
    result_url = f"{base_url}/{event_id}"
    
    # Poll with timeout
    start_time = time.time()
    timeout = 60
    
    while (time.time() - start_time) < timeout:
        response = session.get(result_url, timeout=15, stream=True)
        
        # Process the streaming response
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data:"):
                try:
                    data_json = line[5:].strip()
                    data = json.loads(data_json)
                    
                    if isinstance(data, list) and len(data) >= 1:
                        image_data = data[0]
                        if isinstance(image_data, dict) and "url" in image_data:
                            image_url = image_data["url"]
                            
                            # Return image info
                            return json.dumps({
                                "type": "image",
                                "url": image_url,
                                "message": f"Generated image for prompt: {prompt}"
                            })
                except:
                    continue
        
        # Wait before polling again
        time.sleep(2)
    
    return json.dumps({
        "type": "error",
        "message": "Timeout reached waiting for image generation."
    })

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
```

### What this server does:

1. It creates an MCP server that exposes a `generate_image` tool
2. The tool connects to the SanaSprint model hosted on HuggingFace Spaces
3. It handles the asynchronous nature of image generation by polling for results
4. When an image is ready, it returns the URL in a structured JSON format

## Part 2: Building the MCP Client with Gradio

Now let's create a Gradio chat interface as MCP Client that connects Claude to our MCP server.

Create a file named `app.py`:

```python
import asyncio
import os
import json
from typing import List, Dict, Any, Union
from contextlib import AsyncExitStack

import gradio as gr
from gradio.components.chatbot import ChatMessage
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

# Create event loop for async operations
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

class MCPClientWrapper:
    """Minimal MCP client wrapper for Gradio"""
    
    def __init__(self):
        self.session = None
        self.exit_stack = None
        self.anthropic = Anthropic()
        self.tools = []
    
    def connect(self, server_path: str) -> str:
        """Connect to the MCP server"""
        return loop.run_until_complete(self._connect(server_path))
    
    async def _connect(self, server_path: str) -> str:
        """Internal async method to connect to server"""
        if self.exit_stack:
            await self.exit_stack.aclose()
        
        self.exit_stack = AsyncExitStack()
        
        is_python = server_path.endswith('.py')
        command = "python" if is_python else "node"
        
        server_params = StdioServerParameters(
            command=command,
            args=[server_path],
            env={"PYTHONIOENCODING": "utf-8", "PYTHONUNBUFFERED": "1"}
        )
        
        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        self.stdio, self.write = stdio_transport
        
        self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))
        await self.session.initialize()
        
        response = await self.session.list_tools()
        self.tools = [{ 
            "name": tool.name,
            "description": tool.description,
            "input_schema": tool.inputSchema
        } for tool in response.tools]
        
        tool_names = [tool["name"] for tool in self.tools]
        return f"Connected to MCP server. Available tools: {', '.join(tool_names)}"
    
    def process_message(self, message: str, history: List[Union[Dict[str, Any], ChatMessage]]) -> tuple:
        """Process a message using Claude and MCP tools"""
        if not self.session:
            return history + [
                {"role": "user", "content": message}, 
                {"role": "assistant", "content": "Please connect to an MCP server first."}
            ], gr.Textbox(value="")
        
        new_messages = loop.run_until_complete(self._process_query(message, history))
        return history + [{"role": "user", "content": message}] + new_messages, gr.Textbox(value="")
    
    async def _process_query(self, message: str, history: List[Union[Dict[str, Any], ChatMessage]]):
        """Internal async method to process queries"""
        # Format conversation history for Claude
        claude_messages = []
        for msg in history:
            if isinstance(msg, ChatMessage):
                role, content = msg.role, msg.content
            else:  # Dictionary
                role, content = msg.get("role"), msg.get("content")
            
            if role in ["user", "assistant", "system"]:
                claude_messages.append({"role": role, "content": content})
        
        # Add current query
        claude_messages.append({"role": "user", "content": message})
        
        # Initial Claude API call
        response = self.anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            messages=claude_messages,
            tools=self.tools
        )

        # Process response and handle tool calls
        result_messages = []
        
        for content in response.content:
            if content.type == 'text':
                # Add text response
                result_messages.append({
                    "role": "assistant", 
                    "content": content.text
                })
                
            elif content.type == 'tool_use':
                tool_name = content.name
                tool_args = content.input
                
                # Create a message for the tool call
                result_messages.append({
                    "role": "assistant",
                    "content": f"I'll use the {tool_name} tool to help answer your question.",
                    "metadata": {
                        "title": f"Using tool: {tool_name}",
                        "log": f"Parameters: {json.dumps(tool_args, ensure_ascii=True)}",
                        "status": "pending",
                        "id": f"tool_call_{tool_name}"
                    }
                })
                
                # Add formatted tool parameters
                result_messages.append({
                    "role": "assistant",
                    "content": "```json\n" + json.dumps(tool_args, indent=2, ensure_ascii=True) + "\n```",
                    "metadata": {
                        "parent_id": f"tool_call_{tool_name}",
                        "id": f"params_{tool_name}",
                        "title": "Tool Parameters"
                    }
                })
                
                # Execute tool call
                result = await self.session.call_tool(tool_name, tool_args)
                
                # Update the tool call status
                if result_messages and "metadata" in result_messages[-2]:
                    result_messages[-2]["metadata"]["status"] = "done"
                
                # Add tool results message
                result_messages.append({
                    "role": "assistant",
                    "content": "Here are the results from the tool:",
                    "metadata": {
                        "title": f"Tool Result for {tool_name}",
                        "status": "done",
                        "id": f"result_{tool_name}"
                    }
                })
                
                # Handle the result content
                result_content = result.content
                if isinstance(result_content, list):
                    result_content = "\n".join(str(item) for item in result_content)
                
                # Process result
                try:
                    result_json = json.loads(result_content)
                    if isinstance(result_json, dict) and "type" in result_json:
                        if result_json["type"] == "image" and "url" in result_json:
                            # Add image
                            result_messages.append({
                                "role": "assistant",
                                "content": {"path": result_json["url"], "alt_text": result_json.get("message", "Generated image")},
                                "metadata": {
                                    "parent_id": f"result_{tool_name}",
                                    "id": f"image_{tool_name}",
                                    "title": "Generated Image"
                                }
                            })
                        else:
                            # Regular formatted content
                            result_messages.append({
                                "role": "assistant",
                                "content": "```\n" + result_content + "\n```",
                                "metadata": {
                                    "parent_id": f"result_{tool_name}",
                                    "id": f"raw_result_{tool_name}",
                                    "title": "Raw Output"
                                }
                            })
                except:
                    # Not JSON, use as plain text
                    result_messages.append({
                        "role": "assistant",
                        "content": "```\n" + result_content + "\n```",
                        "metadata": {
                            "parent_id": f"result_{tool_name}",
                            "id": f"raw_result_{tool_name}",
                            "title": "Raw Output"
                        }
                    })
                
                # Get Claude's interpretation of the results
                claude_messages.append({"role": "user", "content": f"Tool result for {tool_name}: {result_content}"})
                next_response = self.anthropic.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1000,
                    messages=claude_messages,
                )
                
                if next_response.content and next_response.content[0].type == 'text':
                    result_messages.append({
                        "role": "assistant",
                        "content": next_response.content[0].text
                    })

        return result_messages

# Create global client instance
client = MCPClientWrapper()

# Define Gradio interface
def gradio_interface():
    with gr.Blocks(title="MCP Weather Client") as demo:
        gr.Markdown("# MCP Weather Assistant")
        gr.Markdown("Connect to your MCP weather server and chat with the assistant")
        
        with gr.Row(equal_height=True):
            with gr.Column(scale=4):
                server_path = gr.Textbox(
                    label="Server Script Path",
                    placeholder="Enter path to server script (e.g., weather.py)",
                    value="gradio_mcp_server.py"
                )
            with gr.Column(scale=1):
                connect_btn = gr.Button("Connect")
        
        status = gr.Textbox(label="Connection Status", interactive=False)
        
        # Use type="messages" for the enhanced chatbot
        chatbot = gr.Chatbot(
            value=[], 
            height=500,
            type="messages",
            show_copy_button=True,
            avatar_images=("👤", "🤖")
        )
        
        with gr.Row(equal_height=True):
            msg = gr.Textbox(
                label="Your Question",
                placeholder="Ask about weather or alerts (e.g., What's the weather in New York?)",
                scale=4
            )
            clear_btn = gr.Button("Clear Chat", scale=1)
        
        # Set up event handlers
        connect_btn.click(client.connect, inputs=server_path, outputs=status)
        msg.submit(client.process_message, [msg, chatbot], [chatbot, msg])
        clear_btn.click(lambda: [], None, chatbot)
        
    return demo

if __name__ == "__main__":
    # Check for API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Warning: ANTHROPIC_API_KEY not found in environment. Please set it in your .env file.")
    
    # Launch the Gradio interface
    interface = gradio_interface()
    interface.launch(debug=True)
```

### What this MCP Client does:

- Creates a friendly Gradio chat interface for user interaction
- Connects to the MCP server you specify
- Handles conversation history and message formatting
- Makes call to Claude API with tool definitions
- Processes tool usage requests from Claude
- Displays images and other tool outputs in the chat
- Sends tool results back to Claude for interpretation

## Running the Application

To run your MCP application:

- Start a terminal window and run the MCP Client:
   ```bash
   python app.py
   ```
- Open the Gradio interface at the URL shown (typically http://127.0.0.1:7860)
- In the Gradio interface, you'll see a field for the MCP Server path. It should default to `gradio_mcp_server.py`.
- Click "Connect" to establish the connection to the MCP server.
- You should see a message indicating the server connection was successful.

## Example Usage

Now you can chat with Claude and it will be able to generate images based on your descriptions.

Try prompts like:
- "Can you generate an image of a mountain landscape at sunset?"
- "Create an image of a cool tabby cat"
- "Generate a picture of a panda wearing sunglasses"

Claude will recognize these as image generation requests and automatically use the `generate_image` tool from your MCP server.


## How it Works

Here's the high-level flow of what happens during a chat session:

1. Your prompt enters the Gradio interface
2. The client forwards your prompt to Claude
3. Claude analyzes the prompt and decides to use the `generate_image` tool
4. The client sends the tool call to the MCP server
5. The server calls the external image generation API
6. The image URL is returned to the client
7. The client sends the image URL back to Claude
8. Claude provides a response that references the generated image
9. The Gradio chat interface displays both Claude's response and the image


## Next Steps

Now that you have a working MCP system, here are some ideas to extend it:

- Add more tools to your server
- Improve error handling 
- Add private Huggingface Spaces with authentication for secure tool access
- Create custom tools that connect to your own APIs or services
- Implement streaming responses for better user experience

## Conclusion

Congratulations! You've successfully built an MCP Client and Server that allows Claude to generate images based on text prompts. This is just the beginning of what you can do with Gradio and MCP. This guide enables you to build complex AI applications that can use Claude or any other powerful LLM to interact with virtually any external tool or service.

Read our other Guide on using [Gradio apps as MCP Servers](insert-link-to-the-other-mcp-guide-here).
