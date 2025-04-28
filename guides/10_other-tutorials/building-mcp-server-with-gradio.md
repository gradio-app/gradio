# Building an MCP Server with Gradio

Tags: MCP, TOOL, LLM, SERVER

In this guide, we will describe how to launch your Gradio app so that it can be used as an MCP Server.

Punchline: it's as simple as setting `mcp_server=True` in `.launch()`. 

## What is an MCP Server

An MCP (Model Control Protocol) server is a standardized way to expose Gradio app functionality as tools that can be used by Large Language Models (LLMs). When you launch a Gradio app as an MCP server, each API endpoint in your app becomes an MCP tool that can be called by LLMs.

Key features of an MCP server:

1. **Tool Conversion**: Each API endpoint in your Gradio app is automatically converted into an MCP tool with a corresponding name, description, and input schema.

2. **SSE Protocol**: The MCP server uses Server-Sent Events (SSE) for communication, making it compatible with LLMs that support connecting to MCP servers.

3. **File Handling**: The server automatically handles file data conversions, including:
   - Converting base64-encoded strings to file data
   - Processing image files and returning them in the correct format
   - Managing temporary file storage

4. **Schema Generation**: The server automatically generates input schemas for each tool, making it easy for LLMs to understand how to use the tools.

5. **Integration**: MCP servers can be easily integrated with various LLM clients that support the SSE protocol, such as Cursor, Windsurf, and Cline.

The MCP server essentially acts as a bridge between your Gradio app and LLMs, allowing them to interact with your app's functionality in a standardized way. This makes it possible to use your Gradio app's capabilities as part of larger AI workflows and applications.

## Automatically Creating an MCP Server with Gradio

Creating an MCP server with Gradio is incredibly simple. There are two ways to enable the MCP server functionality:

1. **Using the `mcp_server` Parameter**:
   ```python
   demo.launch(mcp_server=True)
   ```

2. **Using Environment Variables**:
   ```bash
   export GRADIO_MCP_SERVER=True
   ```

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

```python
import gradio as gr

def greet(name):
    return f"Hello, {name}!"

demo = gr.Interface(
    fn=greet,
    inputs="text",
    outputs="text",
    title="Greeting App",
    description="Enter your name to get a greeting."
)

if __name__ == "__main__":
    demo.launch(mcp_server=True)
```

When you run this app, it will:
1. Start the regular Gradio web interface
2. Start the MCP server
3. Print the MCP server URL in the console

The MCP server will automatically convert the `greet` function into an MCP tool that can be used by LLMs.

## Launching an MCP Server Manually with the Gradio Clients




