# Client Side Functions

Gradio allows you to run certain "simple" functions directly in the browser by setting `js=True` in your event listeners. This will **automatically convert your Python code into JavaSCript**, which significantly improves the responsiveness of your app by avoiding a round trip to the server for simple UI updates.

The difference in responsiveness is most noticeable on hosted applications (like Hugging Face Spaces), when the server is under heavy load, with high-latency connections, or when many users are accessing the app simultaneously.

## When to Use Client Side Functions

Client side functions are ideal for updating component properties (like visibility, placeholders, interactive state, or styling). 

Here's a basic example:

```py
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row() as row:
        btn = gr.Button("Hide this row")
    
    # This function runs in the browser without a server roundtrip
    btn.click(
        lambda: gr.Row(visible=False), 
        None, 
        row, 
        js=True
    )

demo.launch()
```


## Limitations

Client side functions have some important restrictions:
* They can only update component properties (not values)
* They cannot take any inputs

Here are some functions that will work with `js=True`:

```py
# Simple property updates
lambda: gr.Textbox(lines=4)

# Multiple component updates
lambda: [gr.Textbox(lines=4), gr.Button(interactive=False)]

# Using gr.update() for property changes
lambda: gr.update(visible=True, interactive=False)
```

We are working to increase the space of functions that can be transpiled to JavaScript so that they can be run in the browser. [Follow the Groovy library for more info](https://github.com/abidlabs/groovy-transpiler).


## Complete Example

Here's a more complete example showing how client side functions can improve the user experience:

$code_todo_list_js


## Behind the Scenes

When you set `js=True`, Gradio:

1. Transpiles your Python function to JavaScript

2. Runs the function directly in the browser

3. Still sends the request to the server (for consistency and to handle any side effects)

This provides immediate visual feedback while ensuring your application state remains consistent.
