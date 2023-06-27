import gradio as gr


def failure():
    raise gr.Error("This should fail!")

def exception():
    raise ValueError("Something went wrong")

def success():
    return True

with gr.Blocks() as demo:
    gr.Markdown("Used in E2E tests of success event trigger. The then event covered in chatbot E2E tests."
                " Also testing that the status modals show up.")
    with gr.Row():
        result = gr.Textbox(label="Result")
        result_2 = gr.Textbox(label="Consecutive Event")
    with gr.Row():
        success_btn = gr.Button(value="Trigger Success")
        success_btn_2 = gr.Button(value="Trigger Consecutive Success")
        failure_btn = gr.Button(value="Trigger Failure")
        failure_exception = gr.Button(value="Trigger Failure With ValueError")

        success_btn_2.click(success, None, None).success(lambda: "First Event Trigered", None, result).success(lambda: "Consecutive Event Triggered", None, result_2)
        success_btn.click(success, None, None).success(lambda: "Success event triggered", inputs=None, outputs=result)
        failure_btn.click(failure, None, None).success(lambda: "Should not be triggered", inputs=None, outputs=result)
        failure_exception.click(exception, None, None)

if __name__ == "__main__":
    demo.launch(show_error=True)