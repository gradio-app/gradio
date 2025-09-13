import gradio as gr

def update_navbar_with_query(choice):
    """Updates navbar links to preserve query parameters"""
    if choice:
        return [("Main Page", f"?option={choice.lower().replace(' ', '_')}"), ("Page 2", f"page-2/?option={choice.lower().replace(' ', '_')}")]
    return [("Main Page", ""), ("Page 2", "page-2")]

update_url_js = """
(choice) => {
    console.log("choice", choice);
    if (choice) {
        const url = new URL(window.location);
        url.searchParams.set('option', choice.toLowerCase().replace(' ', '_'));
        window.history.replaceState({}, '', url);
    }
    return choice;
}
"""

with gr.Blocks() as demo:
    navbar1 = gr.Navbar(
        value=[("Main Page", ""),("Page 2", "page-2")],
        visible=True,
        main_page_name=False,
    )

    dropdown1 = gr.Dropdown(
        choices=["Option A", "Option B", "Option C"],
        label="Select an option",
        value=None
    )

    dropdown1.change(
        fn=update_navbar_with_query,
        inputs=[dropdown1],
        outputs=[navbar1],
        js=update_url_js
    )

with demo.route("Page 2", show_in_navbar=False):
    navbar2 = gr.Navbar(
        visible=True,
        main_page_name=False,
    )
    
    dropdown2 = gr.Dropdown(
        choices=["Value 1", "Value 2", "Value 3"],
        label="Select a value",
        value=None
    )
    dropdown2.change(
        fn=update_navbar_with_query,
        inputs=[dropdown2],
        outputs=[navbar2],
        js=update_url_js
    )

if __name__ == "__main__":
    demo.launch()