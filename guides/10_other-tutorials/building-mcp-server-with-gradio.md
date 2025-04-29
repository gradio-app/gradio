# Building an MCP Server with Gradio

Tags: MCP, TOOL, LLM, SERVER

In this guide, we will describe how to launch your Gradio app so that it functions as an MCP Server.

Punchline: it's as simple as setting `mcp_server=True` in `.launch()`. 

## What is an MCP Server?

An MCP (Model Control Protocol) server is a standardized way to expose tools so that they can be used by Large Language Models (LLMs). A tool can provide an LLM functionality that it does not have natively, such as the ability to generate images or calculate the prime factors of a number. When you launch a Gradio app as an MCP server, each API endpoint in your app becomes an MCP tool that can be called by LLMs.

## Example: Counting Letters in a Word

LLMs are famously not great at counting the number of letters in a word (e.g. the number of "r"-s in "strawberry"). But what if we equip them with a tool to help? Let's write a simple Gradio app that counts the number of letters in a word or phrase:

$code_letter_counter

Notice that we have set `mcp_server=True` in `.launch()`. This is all that's needed for your Gradio app to serve as an MCP server! When you 

 There are two ways to enable the MCP server functionality:

1. **Using the `mcp_server` Parameter**:
   ```python
   demo.launch(mcp_server=True)
   ```

2. **Using Environment Variables**:
   ```bash
   export GRADIO_MCP_SERVER=True
   ```


## Key features of an MCP server:

1. **Tool Conversion**: Each API endpoint in your Gradio app is automatically converted into an MCP tool with a corresponding name, description, and input schema.

2. **SSE Protocol**: The MCP server uses Server-Sent Events (SSE) for communication, making it compatible with LLMs that support connecting to MCP servers.

3. **File Handling**: The server automatically handles file data conversions, including:
   - Converting base64-encoded strings to file data
   - Processing image files and returning them in the correct format
   - Managing temporary file storage

4. **Schema Generation**: The server automatically generates input schemas for each tool, making it easy for LLMs to understand how to use the tools.

5. **Integration**: MCP servers can be easily integrated with various LLM clients that support the SSE protocol, such as Cursor, Windsurf, and Cline.

The MCP server essentially acts as a bridge between your Gradio app and LLMs, allowing them to interact with your app's functionality in a standardized way. This makes it possible to use your Gradio app's capabilities as part of larger AI workflows and applications.


### Prerequisites

Before you can use the MCP server functionality, you need to install Gradio with the MCP extra:

```bash
pip install gradio[mcp]
```

This will install the necessary dependencies, including the `mcp` package.

### How It Works

When you enable the MCP server, Gradio automatically:

1. Creates an MCP server instance for your app
2. Converts each API endpoint into an MCP tool
3. Sets up the SSE (Server-Sent Events) transport for communication
4. Mounts the MCP server at the `/gradio_api/mcp` subpath

The MCP server will be accessible at:
```
http://your-server:port/gradio_api/mcp/sse
```

### Example

Here's a complete example of a Gradio app with MCP server enabled:


When you run this app, it will:
1. Start the regular Gradio web interface
2. Start the MCP server
3. Print the MCP server URL in the console

The MCP server will automatically convert the `greet` function into an MCP tool that can be used by LLMs.

## Launching a Custom MCP Server for your Gradio App

For a more fine-grained control, you might want to manually create an MCP Server that interfaces with hosted Gradio apps. This approach is useful when you want to:

- Combine multiple Gradio apps into a single MCP server
- Customize how your tools are presented to LLMs
- Add specialized logic around tool execution

Here's an example of creating a custom MCP server that connects to various Gradio apps hosted on [HuggingFace Spaces](https://huggingface.co/spaces):

```python
from mcp.server.fastmcp import FastMCP
from gradio_client import Client
import sys
import io
import json 

# Initialize FastMCP server
mcp = FastMCP("gradio-spaces")

# Dictionary to store Gradio clients
clients = {}

def get_client(space_id: str) -> Client:
    """Get or create a Gradio client for the specified space."""
    if space_id not in clients:
        clients[space_id] = Client(space_id)
    return clients[space_id]


@mcp.tool()
async def generate_image(prompt: str, space_id: str = "ysharma/SanaSprint") -> str:
    """Generate an image using Flux.
    
    Args:
        prompt: Text prompt describing the image to generate
        space_id: HuggingFace Space ID to use 
    """
    client = get_client(space_id)
    result = client.predict(
            prompt=prompt,
            model_size="1.6B",
            seed=0,
            randomize_seed=True,
            width=1024,
            height=1024,
            guidance_scale=4.5,
            num_inference_steps=2,
            api_name="/infer"
    )
    return result


@mcp.tool()
async def run_dia_tts(prompt: str, space_id: str = "ysharma/Dia-1.6B") -> str:
    """Text-to-Speech Synthesis.
    
    Args:
        prompt: Text prompt describing the conversation between speakers S1, S2
        space_id: HuggingFace Space ID to use 
    """
    client = get_client(space_id)
    result = client.predict(
            text_input=f"""{prompt}""",
            audio_prompt_input=None, 
            max_new_tokens=3072,
            cfg_scale=3,
            temperature=1.3,
            top_p=0.95,
            cfg_filter_top_k=30,
            speed_factor=0.94,
            api_name="/generate_audio"
    )
    return result


if __name__ == "__main__":
    # Ensure stdout uses UTF-8 encoding
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    # Initialize and run the server
    mcp.run(transport='stdio')

```

This server exposes two tools:
1. `run_dia_tts` - Generates a conversation for the given transcript in the form of `[S1]first-sentence. [S2]second-sentence. [S1]...`
2. `generate_image` - Generates images using a fast text-to-image model

To use this MCP Server with Claude Desktop (as MCP Client):

1. Save the code to a file (e.g., `gradio_mcp_server.py`)
2. Install the required dependencies: `pip install mcp gradio-client`
3. Configure Claude Desktop to use your server by editing the configuration file at `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
    "mcpServers": {
        "gradio-spaces": {
            "command": "python",
            "args": [
                "/absolute/path/to/gradio_mcp_server.py"
            ]
        }
    }
}
```

4. Restart Claude Desktop

Now, when you ask Claude about generating an image or transcribing audio, it can use your Gradio-powered tools to accomplish these tasks.


