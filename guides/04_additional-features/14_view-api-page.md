# API Page

You can use almost any Gradio app programmatically via the built-in API! In the footer of any Gradio app, you'll see a "Use via API" link. Clicking on the link opens up a detailed documentation page for the API that Gradio generates based on the function signatures in your Gradio app.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/view-api-animated.gif)

## Configuring the API Page

**API endpoint names**

When you create a Gradio application, the API endpoint names are automatically generated based on the function names. You can change this by using the `api_name` parameter in `gr.Interface` or `gr.ChatInterface`. If you are using Gradio `Blocks`, you can name each event listener, like this:

```python
btn.click(add, [num1, num2], output, api_name="addition")
```

**Hiding API endpoints**

When building a complex Gradio app, you might want to hide certain API endpoints from appearing on the view API page, e.g. if they correspond to functions that simply update the UI. You can set the  `show_api` parameter to `False` in any `Blocks` event listener to achieve this, e.g. 

```python
btn.click(add, [num1, num2], output, show_api=False)
```

**Disabling API endpoints**

Hiding the API endpoint doesn't disable it. A user can still programmatically call the API endpoint if they know the name. If you want to disable an API endpoint altogether, set `api_name=False`, e.g. 

```python
btn.click(add, [num1, num2], output, api_name=False)
```

Note: setting an `api_name=False` also means that downstream apps will not be able to load your Gradio app using `gr.load()` as this function uses the Gradio API under the hood.


## The Clients

This API page not only lists all of the endpoints that can be used to query the Gradio app, but also shows the usage of both [the Gradio Python client](https://gradio.app/guides/getting-started-with-the-python-client/), and [the Gradio JavaScript client](https://gradio.app/guides/getting-started-with-the-js-client/). 

For each endpoint, Gradio automatically generates a complete code snippet with the parameters and their types, as well as example inputs, allowing you to immediately test an endpoint. Here's an example showing an image file input and `str` output:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/view-api-snippet.png)


## The API Recorder 🪄

Instead of reading through the view API page, you can also use Gradio's built-in API recorder to generate the relevant code snippet. Simply click on the "API Recorder" button, use your Gradio app via the UI as you would normally, and then the API Recorder will generate the code using the Clients to recreate your all of your interactions programmatically.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/api-recorder.gif)

## MCP Server

The API page also includes instructions on how to use the Gradio app as an Model Context Protocol (MCP) server, which is a standardized way to expose functions as tools so that they can be used by LLMs. 

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/view-api-mcp.png)

For the MCP sever, each tool, its description, and its parameters are listed, along with instructions on how to integrate with popular MCP Clients. Read more about Gradio's [MCP integration here](https://www.gradio.app/guides/building-mcp-server-with-gradio).

## OpenAPI Specification

You can access the complete OpenAPI (formerly Swagger) specification of your Gradio app's API at the endpoint `<your-gradio-app-url>/gradio_api/openapi.json`. The OpenAPI specification is a standardized, language-agnostic interface description for REST APIs that enables both humans and computers to discover and understand the capabilities of your service.
