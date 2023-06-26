import gradio as gr


def failure():
    raise ValueError("This should fail!")

def success():
    return True

with gr.Blocks() as demo:
    gr.Markdown("Used in E2E tests of success event trigger. The then event covered in chatbot E2E tests.")
    with gr.Row():
        result = gr.Textbox(label="Result")
    with gr.Row():
        success_btn = gr.Button(value="Trigger Success")
        failure_btn = gr.Button(value="Trigger Failure")
        success_btn.click(success, None, None).success(lambda: "Success event triggered", inputs=None, outputs=result)
        failure_btn.click(failure, None, None).success(lambda: "Should not be triggered", inputs=None, outputs=result)

if __name__ == "__main__":
    demo.launch()