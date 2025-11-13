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

Gradio automatically converts the `letter_counter` function into an MCP tool that can be used by LLMs. The docstring of the function and the type hints of arguments will be used to generate the description of the tool and its parameters. The name of the function will be used as the name of your tool. Any initial values you provide to your input components (e.g. "strawberry" and "r" in the `gr.Textbox` components above) will be used as the default values if your LLM doesn't specify a value for that particular input parameter.

Now, all you need to do is add this URL endpoint to your MCP Client (e.g. Claude Desktop, Cursor, or Cline), which typically means pasting this config in the settings:

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

3. **File Handling**: The Gradio MCP server automatically handles file data conversions, including:
   - Processing image files and returning them in the correct format
   - Managing temporary file storage

    By default, the Gradio MCP server accepts input images and files as full URLs ("http://..." or "https:/..."). For convenience, an additional STDIO-based MCP server is also generated, which can be used to upload files to any remote Gradio app and which returns a URL that can be used for subsequent tool calls.

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

## Authentication and Credentials

You may wish to authenticate users more precisely or let them provide other kinds of credentials or tokens in order to provide a custom experience for different users. 

Gradio allows you to access the underlying `starlette.Request` that has made the tool call, which means that you can access headers, originating IP address, or any other information that is part of the network request. To do this, simply add a parameter in your function of the type `gr.Request`, and Gradio will automatically inject the request object as the parameter.

Here's an example:

```py
import gradio as gr

def echo_headers(x, request: gr.Request):
    return str(dict(request.headers))

gr.Interface(echo_headers, "textbox", "textbox").launch(mcp_server=True)
```

This MCP server will simply ignore the user's input and echo back all of the headers from a user's request. One can build more complex apps using the same idea. See the [docs on `gr.Request`](https://www.gradio.app/main/docs/gradio/request) for more information (note that only the core Starlette attributes of the `gr.Request` object will be present, attributes such as Gradio's `.session_hash` will not be present).

### Using the gr.Header class

A common pattern in MCP server development is to use authentication headers to call services on behalf of your users. Instead of using a `gr.Request` object like in the example above, you can use a `gr.Header` argument. Gradio will automatically extract that header from the incoming request (if it exists) and pass it to your function.

In the example below, the `X-API-Token` header is extracted from the incoming request and passed in as the `x_api_token` argument to `make_api_request_on_behalf_of_user`.

The benefit of using `gr.Header` is that the MCP connection docs will automatically display the headers you need to supply when connecting to the server! See the image below:

```python
import gradio as gr

def make_api_request_on_behalf_of_user(prompt: str, x_api_token: gr.Header):
    """Make a request to everyone's favorite API.
    Args:
        prompt: The prompt to send to the API.
    Returns:
        The response from the API.
    Raises:
        AssertionError: If the API token is not valid.
    """
    return "Hello from the API" if not x_api_token else "Hello from the API with token!"


demo = gr.Interface(
    make_api_request_on_behalf_of_user,
    [
        gr.Textbox(label="Prompt"),
    ],
    gr.Textbox(label="Response"),
)

demo.launch(mcp_server=True)
```

![MCP Header Connection Page](https://github.com/user-attachments/assets/e264eedf-a91a-476b-880d-5be0d5934134)

### Sending Progress Updates

The Gradio MCP server automatically sends progress updates to your MCP Client based on the queue in the Gradio application. If you'd like to send custom progress updates, you can do so using the same mechanism as you would use to display progress updates in the UI of your Gradio app: by using the `gr.Progress` class!

Here's an example of how to do this:

$code_mcp_progress

[Here are the docs](https://www.gradio.app/docs/gradio/progress) for the `gr.Progress` class, which can also automatically track `tqdm` calls.

Note: by default, progress notifications are enabled for all MCP tools, even if the corresponding Gradio functions do not include a `gr.Progress`. However, this can add some overhead to the MCP tool (typically ~500ms). To disable progress notification, you can set `queue=False` in your Gradio event handler to skip the overhead related to subscribing to the queue's progress updates.


## Modifying Tool Descriptions

Gradio automatically sets the tool name based on the name of your function, and the description from the docstring of your function. But you may want to change how the description appears to your LLM. You can do this by using the `api_description` parameter in `Interface`, `ChatInterface`, or any event listener. This parameter takes three different kinds of values:

* `None` (default): the tool description is automatically created from the docstring of the function (or its parent's docstring if it does not have a docstring but inherits from a method that does.)
* `False`: no tool description appears to the LLM.
* `str`: an arbitrary string to use as the tool description.

In addition to modifying the tool descriptions, you can also toggle which tools appear to the LLM. You can do this by setting the `show_api` parameter, which is by default `True`. Setting it to `False` hides the endpoint from the API docs and from the MCP server. If you expose multiple tools, users of your app will also be able to toggle which tools they'd like to add to their MCP server by checking boxes in the "view MCP or API" panel.

Here's an example that shows the `api_description` and `show_api` parameters in actions:

$code_mcp_tools



## MCP Resources and Prompts

In addition to tools (which execute functions generally and are the default for any function exposed through the Gradio MCP integration), MCP supports two other important primitives: **resources** (for exposing data) and **prompts** (for defining reusable templates). Gradio provides decorators to easily create MCP servers with all three capabilities.


### Creating MCP Resources

Use the `@gr.mcp.resource` decorator on any function to expose data through your Gradio app. Resources can be static (always available at a fixed URI) or templated (with parameters in the URI).

$code_mcp_resources_and_prompts

In this example:
- The `get_greeting` function is exposed as a resource with a URI template `greeting://{name}`
- When an MCP client requests `greeting://Alice`, it receives "Hello, Alice!"
- Resources can also return images and other types of files or binary data. In order to return non-text data, you should specify the `mime_type` parameter in `@gr.mcp.resource()` and return a Base64 string from your function.

### Creating MCP Prompts  

Prompts help standardize how users interact with your tools. They're especially useful for complex workflows that require specific formatting or multiple steps.

The `greet_user` function in the example above is decorated with `@gr.mcp.prompt()`, which:
- Makes it available as a prompt template in MCP clients
- Accepts parameters (`name` and `style`) to customize the output
- Returns a structured prompt that guides the LLM's behavior


## Adding MCP-Only Functions

So far, all of our MCP tools, resources, or prompts have corresponded to event listeners in the UI. This works well for functions that directly update the UI, but may not work if you wish to expose a "pure logic" function that should return raw data (e.g. a JSON object) without directly causing a UI update.

In order to expose such an MCP tool, you can create a pure Gradio API endpoint using `gr.api` (see [full docs here](https://www.gradio.app/main/docs/gradio/api)). Here's an example of creating an MCP tool that slices a list:

$code_mcp_tool_only

Note that if you use this approach, your function signature must be fully typed, including the return value, as these signature are used to determine the typing information for the MCP tool.

## Gradio with FastMCP

In some cases, you may decide not to use Gradio's built-in integration and instead manually create an FastMCP Server that calls a Gradio app. This approach is useful when you want to:

- Store state / identify users between calls instead of treating every tool call completely independently
- Start the Gradio app MCP server when a tool is called (if you are running multiple Gradio apps locally and want to save memory / GPU)

This is very doable thanks to the [Gradio Python Client](https://www.gradio.app/guides/getting-started-with-the-python-client) and the [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)'s `FastMCP` class. Here's an example of creating a custom MCP server that connects to various Gradio apps hosted on [HuggingFace Spaces](https://huggingface.co/spaces) using the `stdio` protocol:

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

