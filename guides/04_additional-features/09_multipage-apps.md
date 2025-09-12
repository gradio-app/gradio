# Multipage Apps

Your Gradio app can support multiple pages with the `Blocks.route()` method. Here's what a multipage Gradio app generally looks like:

```python
with gr.Blocks() as demo:  # Main page
    name = gr.Textbox(label="Name")
    ...
with demo.route("Second page", "/second"):
    num = gr.Number()
    ...

demo.launch()
```

This allows you to define links to separate pages, each with a separate URL, which are  linked to the top of the Gradio app in an automatically-generated navbar. 

Here's a complete example:

$code_multipage

All of these pages will share the same backend, including the same queue.

Note: multipage apps do not support interactions between pages, e.g. an event listener on one page cannot output to a component on another page. Use `gr.Tabs()` for this type of functionality instead of pages.

**Separate Files**

For maintainability, you may want to write the code for different pages in different files. Because any Gradio Blocks can be imported and rendered inside another Blocks using the `.render()` method, you can do this as follows.

Create one main file, say `app.py` and create separate Python files for each page:

```
- app.py
- main_page.py
- second_page.py
```

The Python file corresponding to each page should consist of a regular Gradio Blocks, Interface, or ChatInterface application, e.g.

`main_page.py`

```py
import gradio as gr

with gr.Blocks() as demo:
    gr.Image()

if __name__ == "__main__":
    demo.launch()
```

`second_page.py`

```py
import gradio as gr

with gr.Blocks() as demo:
    t = gr.Textbox()
    demo.load(lambda : "Loaded", None, t)

if __name__ == "__main__":
    demo.launch()
```

In your main `app.py` file, simply import the Gradio demos from the page files and `.render()` them:

`app.py`

```py
import gradio as gr

import main_page, second_page

with gr.Blocks() as demo:
    main_page.demo.render()
with demo.route("Second Page"):
    second_page.demo.render()

if __name__ == "__main__":
    demo.launch()
```

This allows you to run each page as an independent Gradio app for testing, while also creating a single file `app.py` that serves as the entrypoint for the complete multipage app.

## Customizing the Navbar

By default, Gradio automatically generates a navigation bar for multipage apps that displays all your pages with "Home" as the title for the main page. You can customize the navbar behavior using the `gr.Navbar` component.

### Per-Page Navbar Configuration

You can have different navbar configurations for each page of your app:

```python
import gradio as gr

with gr.Blocks() as demo:
    # Navbar for the main page
    navbar = gr.Navbar(
        visible=True,
        main_page_name="Dashboard",
        value=[("About", "https://example.com/about")]
    )
    
    gr.Textbox(label="Main page content")

with demo.route("Settings"):
    # Different navbar for the Settings page
    navbar = gr.Navbar(
        visible=True,
        main_page_name="Home",
        value=[("Documentation", "https://docs.example.com")]
    )
    gr.Textbox(label="Settings page")

demo.launch()
```


**Important Notes:**
- You can have one `gr.Navbar` component per page. Each page's navbar configuration is independent.
- The `main_page_name` parameter customizes the title of the home page link in the navbar.
- The `value` parameter allows you to add additional links to the navbar, which can be internal pages or external URLs.
- If no `gr.Navbar` component is present on a page, the default navbar behavior is used (visible with "Home" as the home page title).
- You can update the navbar properties using standard Gradio event handling, just like with any other component.

Here's an example that demonstrates the last point:

$code_navbar_customization

