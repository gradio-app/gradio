import gradio as gr

# Fixture for the head-script order test: "plugin" depends on a global set by
# "core", so it must run after core (document order).

with gr.Blocks() as demo:
    gr.HTML(
        html_template="<div id='order-result'>pending</div>",
        head=(
            '<script src="/__head_order__/core.js"></script>'
            '<script src="/__head_order__/plugin.js"></script>'
        ),
        elem_id="order_demo",
    )

if __name__ == "__main__":
    demo.launch()
