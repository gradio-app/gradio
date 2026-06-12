import gradio as gr

# Fixture for the shared head-script test: both components load the same
# library, so the second must wait for the first's in-flight script load
# before running js_on_load.

js_on_load = (
    "var out = element.querySelector('.shared-result');"
    "out.textContent = window.__SHARED_LIB === true ? 'loaded' : 'missing';"
)

with gr.Blocks() as demo:
    gr.HTML(
        html_template="<div class='shared-result' id='shared-left'>pending</div>",
        head='<script src="/__head_shared__/lib.js"></script>',
        js_on_load=js_on_load,
        elem_id="shared_left",
    )
    gr.HTML(
        html_template="<div class='shared-result' id='shared-right'>pending</div>",
        head='<script src="/__head_shared__/lib.js"></script>',
        js_on_load=js_on_load,
        elem_id="shared_right",
    )

if __name__ == "__main__":
    demo.launch()
