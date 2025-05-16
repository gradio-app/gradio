# Building an MCP Server with Gradio

Tags: MCP, TOOL, LLM, SERVER

In this guide, we will describe how to launch your Gradio app so that it functions as an MCP Server.

Punchline: it's as simple as setting `mcp_server=True` in `.launch()`. 

### Prerequisites

If not already installed, please install Gradio with the MCP extra:

```bash
pip install "gradio[mcp]"
```

This will install the necessary dependencies, including the `mcp` package. Also, you will need an LLM application that supports tool calling using the MCP protocol, such as Claude Desktop, Cursor, or Cline (these are known as "MCP Clients").

## What is an MCP Server?

An MCP (Model Control Protocol) server is a standardized way to expose tools so that they can be used by  LLMs. A tool can provide an LLM functionality that it does not have natively, such as the ability to generate images or calculate the prime factors of a number. 

## Example: Counting Letters in a Word

LLMs are famously not great at counting the number of letters in a word (e.g. the number of "r"-s in "strawberry"). But what if we equip them with a tool to help? Let's start by writing a simple Gradio app that counts the number of letters in a word or phrase:

$code_letter_counter

Notice that we have: (1) included a detailed docstring for our function, and (2) set `mcp_server=True` in `.launch()`. This is all that's needed for your Gradio app to serve as an MCP server! Now, when you run this app, it will:

1. Start the regular Gradio web interface
2. Start the MCP server
3. Print the MCP server URL in the console

The MCP server will be accessible at:
```
http://your-server:port/gradio_api/mcp/sse
```

Gradio automatically converts the `letter_counter` function into an MCP tool that can be used by LLMs. The docstring of the function and the type hints of arguments will be used to generate the description of the tool and its parameters. 

All you need to do is add this URL endpoint to your MCP Client (e.g. Claude Desktop, Cursor, or Cline), which typically means pasting this config in the settings:

```
{
  "mcpServers": {
    "gradio": {
      "url": "http://your-server:port/gradio_api/mcp/sse"
    }
  }
}
```

(By the way, you can find the exact config to copy-paste by going to the "View API" link in the footer of your Gradio app, and then clicking on "MCP").

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/view-api-mcp.png)

## Key features of the Gradio <> MCP Integration

1. **Tool Conversion**: Each API endpoint in your Gradio app is automatically converted into an MCP tool with a corresponding name, description, and input schema. To view the tools and schemas, visit http://your-server:port/gradio_api/mcp/schema or go to the "View API" link in the footer of your Gradio app, and then click on "MCP".


2. **Environment variable support**. There are two ways to enable the MCP server functionality:

*  Using the `mcp_server` parameter, as shown above:
   ```python
   demo.launch(mcp_server=True)
   ```

* Using environment variables:
   ```bash
   export GRADIO_MCP_SERVER=True
   ```

3. **File Handling**: The server automatically handles file data conversions, including:
   - Converting base64-encoded strings to file data
   - Processing image files and returning them in the correct format
   - Managing temporary file storage

    It is **strongly** recommended that input images and files be passed as full URLs ("http://..." or "https:/...") as MCP Clients do not always handle local files correctly.


4. **Hosted MCP Servers on 󠀠🤗 Spaces**: You can publish your Gradio application for free on Hugging Face Spaces, which will allow you to have a free hosted MCP server. Here's an example of such a Space: https://huggingface.co/spaces/abidlabs/mcp-tools. Notice that you can add this config to your MCP Client to start using the tools from this Space immediately:

```
{
  "mcpServers": {
    "gradio": {
      "url": "https://abidlabs-mcp-tools.hf.space/gradio_api/mcp/sse"
    }
  }
}
```

<video src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/mcp_guide1.mp4" style="width:100%" controls preload> </video>


## Converting an Existing Space

If there's an existing Space that you'd like to use an MCP server, you'll need to do three things:

1. First, [duplicate the Space](https://huggingface.co/docs/hub/en/spaces-more-ways-to-create#duplicating-a-space) if it is not your own Space. This will allow you to make changes to the app. If the Space requires a GPU, set the hardware of the duplicated Space to be same as the original Space. You can make it either a public Space or a private Space, since it is possible to use either as an MCP server, as described below.
2. Then, add docstrings to the functions that you'd like the LLM to be able to call as a tool. The docstring should be in the same format as the example code above.
3. Finally, add `mcp_server=True` in `.launch()`.

That's it!

## Private Spaces

You can use either a public Space or a private Space as an MCP server. If you'd like to use a private Space as an MCP server (or a ZeroGPU Space with your own quota), then you will need to provide your [Hugging Face token](https://huggingface.co/settings/token) when you make your request. To do this, simply add it as a header in your config like this:

```
{
  "mcpServers": {
    "gradio": {
      "url": "https://abidlabs-mcp-tools.hf.space/gradio_api/mcp/sse",
      "headers": {
        "Authorization": "Bearer <YOUR-HUGGING-FACE-TOKEN>"
      }
    }
  }
}
```


## Custom MCP Servers

For a more fine-grained control, you might want to manually create an MCP Server that interfaces with hosted Gradio apps. This approach is useful when you want to:

- Choose specific endpoints within a larger Gradio app to serve as tools
- Customize how your tools are presented to LLMs (e.g. change the schema or description)
- Start the Gradio app MCP server when a tool is called (if you are running multiple Gradio apps locally and want to save memory / GPU)
- Use a different MCP protocol than SSE

This is very doable thanks to the [Gradio Python Client](https://www.gradio.app/guides/getting-started-with-the-python-client) and the [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk). Here's an example of creating a custom MCP server that connects to various Gradio apps hosted on [HuggingFace Spaces](https://huggingface.co/spaces) using the `stdio` protocol:

```python
from mcp.server.fastmcp import FastMCP
from gradio_client import Client
import sys
import io
import json 

mcp = FastMCP("gradio-spaces")

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
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
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


## Troubleshooting your MCP Servers

The MCP protocol is still in its infancy and you might see issues connecting to an MCP Server that you've built. We generally recommend using the [MCP Inspector Tool](https://github.com/modelcontextprotocol/inspector) to try connecting and debugging your MCP Server.

Here are some things that may help:

**1. Ensure that you've provided type hints and valid docstrings for your functions**

As mentioned earlier, Gradio reads the docstrings for your functions and the type hints of input arguments to generate the description of the tool and parameters. A valid function and docstring looks like this (note the "Args:" block with indented parameter names underneath):

```py
def image_orientation(image: Image.Image) -> str:
    """
    Returns whether image is portrait or landscape.

    Args:
        image (Image.Image): The image to check.
    """
    return "Portrait" if image.height > image.width else "Landscape"
```

Note: You can preview the schema that is created for your MCP server by visiting the `http://your-server:port/gradio_api/mcp/schema` URL.

**2. Try accepting input arguments as `str`**

Some MCP Clients do not recognize parameters that are numeric or other complex types, but all of the MCP Clients that we've tested accept `str` input parameters. When in doubt, change your input parameter to be a `str` and then cast to a specific type in the function, as in this example:

```py
def prime_factors(n: str):
    """
    Compute the prime factorization of a positive integer.

    Args:
        n (str): The integer to factorize. Must be greater than 1.
    """
    n_int = int(n)
    if n_int <= 1:
        raise ValueError("Input must be an integer greater than 1.")

    factors = []
    while n_int % 2 == 0:
        factors.append(2)
        n_int //= 2

    divisor = 3
    while divisor * divisor <= n_int:
        while n_int % divisor == 0:
            factors.append(divisor)
            n_int //= divisor
        divisor += 2

    if n_int > 1:
        factors.append(n_int)

    return factors
```

**3. Ensure that your MCP Client Supports SSE**

Some MCP Clients, notably [Claude Desktop](https://claude.ai/download), do not yet support SSE-based MCP Servers. In those cases, you can use a tool such as [mcp-remote](https://github.com/geelen/mcp-remote). First install [Node.js](https://nodejs.org/en/download/). Then, add the following to your own MCP Client config:

```
{
  "mcpServers": {
    "gradio": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://your-server:port/gradio_api/mcp/sse"
      ]
    }
  }
}
```

**4. Restart your MCP Client and MCP Server**

Some MCP Clients require you to restart them every time you update the MCP configuration. Other times, if the connection between the MCP Client and servers breaks, you might need to restart the MCP server. If all else fails, try restarting both your MCP Client and MCP Servers!

