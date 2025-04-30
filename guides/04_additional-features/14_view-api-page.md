# View API Page

You can use almost any Gradio app programmatically via the built-in an API! In the footer of any Gradio app, you'll see a "Use via API" link. Clicking on the link opens up a detailed documentation page for the API that Gradio generates based on the function signatures in your Gradio app.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/view-api-animated.gif)

## Configuring the API

**API endpoint names**

When you create a Gradio application, the API endpoint names are automatically generated based on the function names. You can change this by using the `api_name` parameter in `gr.Interface` or `gr.ChatInterface`. If you are using Gradio `Blocks`, you can name each event listener, like this:

```python
btn.click(add, [num1, num2], output, api_name="addition")
```

**Hiding the API endpoints**

When building a complex Gradio app, you might want to hide certain  `show_api` parameter

**Disabling the API endpoints**

set `api_name=False` parameter


## The Clients

This is a page that lists the endpoints that can be used to query the Gradio app, via our supported clients: either [the Python client](https://gradio.app/guides/getting-started-with-the-python-client/), or [the JavaScript client](https://gradio.app/guides/getting-started-with-the-js-client/). For each endpoint, Gradio automatically generates the parameters and their types, as well as example inputs, like this.


[Insert image]

## The API Recorder

Instead o

[Insert video]

## MCP Server



(By the way, you can find the exact config to copy-paste by going to the "View API" link in the footer of your Gradio app, and then clicking on "MCP").

[Insert image]

