# API Page

You can use almost any Gradio app programmatically via the built-in an API! In the footer of any Gradio app, you'll see a "Use via API" link. Clicking on the link opens up a detailed documentation page for the API that Gradio generates based on the function signatures in your Gradio app.

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

As displayed in the API pageThis is a page that lists the endpoints that can be used to query the Gradio app, via our supported clients: either [the Python client](https://gradio.app/guides/getting-started-with-the-python-client/), or [the JavaScript client](https://gradio.app/guides/getting-started-with-the-js-client/). For each endpoint, Gradio automatically generates the parameters and their types, as well as example inputs, like this.


## The API Recorder

Instead o

[Insert video]

## MCP Server



(By the way, you can find the exact config to copy-paste by going to the "View API" link in the footer of your Gradio app, and then clicking on "MCP").

[Insert image]

