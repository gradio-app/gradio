# Using the Gradio Docs MCP Server

Tags: MCP, TOOL, LLM, SERVER, DOCS

In this guide, we will describe how to use the official Gradio Docs MCP Server.

### Prerequisites

You will need an LLM application that supports tool calling using the MCP protocol, such as Claude Desktop, Cursor, or Cline (these are known as "MCP Clients").

## Why an MCP Server?

If you're using LLMs in your workflow, adding this server will augment them with just the right context on gradio - which makes your experience a lot faster and smoother. 

<video src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/mcp-docs.mp4" style="width:100%" controls preload> </video>

The server is running on Spaces and was launched entirely using Gradio, you can see all the code [here](https://huggingface.co/spaces/gradio/docs-mcp). For more on building an mcp server with gradio, see the [previous guide](./building-an-mcp-client-with-gradio). 

## Installing in the Clients 

For clients that support SSE (e.g. Cursor, Windsurf, Cline), simply add the following configuration to your MCP config:

```json
{
  "mcpServers": {
    "gradio": {
      "url": "https://gradio-docs-mcp.hf.space/gradio_api/mcp/sse"
    }
  }
}
```

We've included step-by-step instructions for Cursor below, but you can consult the docs for Windsurf [here](https://docs.windsurf.com/windsurf/mcp), and Cline [here](https://docs.cline.bot/mcp-servers/configuring-mcp-servers) which are similar to set up. 



### Cursor 

1. Make sure you're using the latest version of Cursor, and go to Cursor > Settings > Cursor Settings > MCP 
2. Click on '+ Add new global MCP server' 
3. Copy paste this json into the file that opens and then save it. 
```json
{
  "mcpServers": {
    "gradio": {
      "url": "https://gradio-docs-mcp.hf.space/gradio_api/mcp/sse"
    }
  }
}
```
4. That's it! You should see the tools load and the status go green in the settings page. You may have to click the refresh icon or wait a few seconds. 

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/cursor-mcp.png)

### Claude Desktop

1. Since Claude Desktop only supports stdio, you will need to [install Node.js](https://nodejs.org/en/download/) to get this to work. 
2. Make sure you're using the latest version of Claude Desktop, and go to Claude > Settings > Developer > Edit Config 
3. Open the file with your favorite editor and copy paste this json, then save the file. 
```json
{
  "mcpServers": {
    "gradio": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://gradio-docs-mcp.hf.space/gradio_api/mcp/sse",
        "--transport",
        "sse-only"
      ]
    }
  }
}
```
4. Quit and re-open Claude Desktop, and you should be good to go. You should see it loaded in the Search and Tools icon or on the developer settings page. 
 
![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/claude-desktop-mcp.gif)

## Tools 

There are currently only two tools in the server: `gradio_docs_mcp_load_gradio_docs` and `gradio_docs_mcp_search_gradio_docs`. 

1. `gradio_docs_mcp_load_gradio_docs`: This tool takes no arguments and will load an /llms.txt style summary of Gradio's latest, full documentation. Very useful context the LLM can parse before answering questions or generating code. 

2. `gradio_docs_mcp_search_gradio_docs`: This tool takes a query as an argument and will run embedding search on Gradio's docs, guides, and demos to return the most useful context for the LLM to parse.