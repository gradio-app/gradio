# Creating a Gradio app from an OpenAPI Spec

Tags: OPENAPI, SPEC

## Introduction

**[OpenAPI](https://www.openapis.org/)** is a widely adopted standard for describing RESTful APIs in a machine-readable format, typically as a JSON file.

You can create a Gradio UI from an OpenAPI Spec **in 1 line of Python**, instantly generating an interactive web interface for any API, making it accessible for demos, testing, or sharing with non-developers, without writing custom frontend code.

## How it works

Gradio now provides a convenient function, `gr.load_openapi`, that can automatically generate a Gradio app from an OpenAPI v3 specification. This function parses the spec, creates UI components for each endpoint and parameter, and lets you interact with the API directly from your browser.

Here's a minimal example:

```python
import gradio as gr

demo = gr.load_openapi(
    openapi_spec="https://petstore3.swagger.io/api/v3/openapi.json",
    base_url="https://petstore3.swagger.io/api/v3",
    paths=["/pet.*"],
    methods=["get", "post"],
)

demo.launch()
```

**Parameters:**

- **openapi_spec**: URL, file path, or Python dictionary containing the OpenAPI v3 spec (JSON format only).
- **base_url**: The base URL for the API endpoints (e.g., `https://api.example.com/v1`).
- **paths** (optional): List of endpoint path patterns (supports regex) to include. If not set, all paths are included.
- **methods** (optional): List of HTTP methods (e.g., `["get", "post"]`) to include. If not set, all methods are included.

The generated app will display a sidebar with available endpoints and create interactive forms for each operation, letting you make API calls and view responses in real time.

## Next steps

Once your Gradio app is running, you can share the URL with others so they can try out the API through a friendly web interface—no code required. For even more power, you can launch the app as an MCP (Model Control Protocol) server using [Gradio's MCP integration](https://www.gradio.app/guides/building-mcp-server-with-gradio), enabling programmatic access and orchestration of your API via the MCP ecosystem. This makes it easy to build, share, and automate API workflows with minimal effort.
