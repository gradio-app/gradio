import gradio as gr

def test_liked_loading():
    test_history = [
        {"role": "user", "content": "test user message"},
        {"role": "assistant", "content": "test assistant message"}
    ]
    # Set feedback_value to ["Like"] for the assistant message
    return gr.update(value=test_history, feedback_value=["Like"])

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(
        resizable=True,
        min_height=500,
        layout="bubble",
    )
    chatbot.like(
        lambda: None,
        inputs=[],
        outputs=None,
    )
    test_btn = gr.Button("Test Liked Loading")
    test_btn.click(test_liked_loading, outputs=[chatbot])

if __name__ == "__main__":
    demo.launch(debug=True)
