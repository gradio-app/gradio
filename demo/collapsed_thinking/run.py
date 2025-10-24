import gradio as gr

# Test the collapse_thinking feature
def respond(message, history):
    # Simulate a response with thinking tags
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

# Create the chatbot with collapse_thinking enabled
demo = gr.ChatInterface(
    fn=respond,
    chatbot=gr.Chatbot(
        collapse_thinking=[("<thinking>", "</thinking>")],
        height=600
    ),
    title="Test Collapse Thinking Feature",
    description="This demo tests the collapse_thinking parameter. The thinking blocks should be collapsed by default."
)

if __name__ == "__main__":
    demo.launch()
