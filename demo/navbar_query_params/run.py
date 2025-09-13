"""This is a demo of a custom navbar that preserves query parameters from one page to the next."""

import gradio as gr

def update_navbar_with_query(choice):
    """Updates navbar links to preserve query parameters"""
    if choice:
        return [("Main Page", f"?option={choice}"), ("Page 2", f"second?option={choice}")]
    return [("Main Page", ""), ("Page 2", "second")]

def update_dropdown_based_on_query(request: gr.Request):
    """Updates dropdown based on query parameters"""
    return request.query_params.get("option")

update_url_js = """
(choice) => {
    console.log("choice", choice);
    if (choice) {
        const url = new URL(window.location);
        url.searchParams.set('option', choice);
        window.history.replaceState({}, '', url);
    }
    return choice;
}
"""

with gr.Blocks() as demo:
    gr.Markdown("If you select an option, and go to the second page, the option will be preserved.")

    navbar1 = gr.Navbar(
        value=[("Main Page", ""),("Page 2", "second")],
        visible=True,
        main_page_name=False,
    )

    dropdown1 = gr.Dropdown(
        choices=["America", "Canada", "Pakistan"],
        label="Select an option",
        value=None
    )

    dropdown1.change(
        fn=update_navbar_with_query,
        inputs=[dropdown1],
        outputs=[navbar1],
        js=update_url_js
    )

with demo.route("second", show_in_navbar=False) as second_page:
    navbar2 = gr.Navbar(
        visible=True,
        main_page_name=False,
        value=[("Main Page", ""),("Page 2", "second")]
    )
    
    dropdown2 = gr.Dropdown(
        choices=["America", "Canada", "Pakistan"],
        label="Select a value",
        value=None
    )

    second_page.load(update_dropdown_based_on_query, None, dropdown2)

if __name__ == "__main__":
    demo.launch()