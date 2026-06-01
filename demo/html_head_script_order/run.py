import gradio as gr

# Minimal fixture for the head-script execution-order test.
#
# `head` loads two scripts where the second ("plugin") depends on a global
# defined by the first ("core"). Literal `<script src>` tags execute in
# document order, so the plugin must run after core. Each script records its
# execution into window globals; the e2e test intercepts both requests and
# delays core so that, without the ordering fix, the faster plugin would run
# first and fail to see core.

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
