import gradio as gr

# Same head-script ordering fixture as html_head_script_order, but exercising
# the app-level gr.Blocks(head=...) path (handled by add_custom_html_head)
# rather than the per-component gr.HTML(head=...) path.

with gr.Blocks(
    head=(
        '<script src="/__head_order__/core.js"></script>'
        '<script src="/__head_order__/plugin.js"></script>'
    )
) as demo:
    gr.HTML("<div id='order-result'>pending</div>")

if __name__ == "__main__":
    demo.launch()
