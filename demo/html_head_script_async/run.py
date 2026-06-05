import gradio as gr

# Fixture for the "explicit async is honored" test: both scripts are `async`,
# so download-completion order applies (delayed first runs after fast second).

with gr.Blocks() as demo:
    gr.HTML(
        html_template="<div id='async-result'>pending</div>",
        head=(
            '<script async src="/__head_async__/first.js"></script>'
            '<script async src="/__head_async__/second.js"></script>'
        ),
        elem_id="async_demo",
    )

if __name__ == "__main__":
    demo.launch()
