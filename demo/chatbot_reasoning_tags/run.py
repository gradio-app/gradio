import gradio as gr

def respond(message, history):
    response = """<thinking>
Let me analyze this problem step by step.
First, I need to understand what the user is asking.
Then I can formulate a proper response.
</thinking>

Based on your question, here's my answer: This is the main response content that should be visible by default.

<thinking>
Now let me consider if there are any edge cases.
I should make sure my response is complete.
</thinking>

And here's some additional information that might be helpful."""

    return response

demo = gr.ChatInterface(
    fn=respond,
    chatbot=gr.Chatbot(
        reasoning_tags=[("<thinking>", "</thinking>")],
        height=600
    ),
    title="Test Collapse Thinking Feature",
    description="This demo tests the reasoning_tags parameter. The thinking blocks should be collapsed by default."
)

if __name__ == "__main__":
    demo.launch()
