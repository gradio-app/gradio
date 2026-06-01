import gradio as gr

# Fixture for the "explicit async is honored" test. Both head scripts are
# marked `async`, so the author opted into download-completion order rather
# than document order. The e2e test delays the first script, so the faster
# second script runs first, proving the async intent is preserved (not forced
# back into document order by the ordering fix).

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
