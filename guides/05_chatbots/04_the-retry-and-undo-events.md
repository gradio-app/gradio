# Retrying and Undoing Messages

Tags: LLM, CHAT

Users expect modern chatbot UIs to let them easily retry message generations or undo them all together.
Thankfully, the Gradio Chatbot exposes two events, `.retry` and `.undo`, to let you, the developer, build this functionality into your application.

In this demo, we'll build a UI that implements these events. You can see our finished demo deployed on Hugging Face spaces here:

$demo_chatbot_retry_undo

Tip: `gr.ChatInterface` automatically uses the `retry` and `.undo` events so it's best to start there in order get a fully working application quickly.


## The UI

First, we'll build the UI without handling these events and build from there. 
We'll use the Hugging Face InferenceClient in order to get started without setting up
any API keys.

This is what the first draft of our application looks like:

```python
from huggingface_hub import InferenceClient
import gradio as gr

client = InferenceClient()

def respond(
    prompt: str,
    history,
):
    if not history:
        history = [{"role": "system", "content": "You are a friendly chatbot"}]
    history.append({"role": "user", "content": prompt})

    yield history

    response = {"role": "assistant", "content": ""}
    for message in client.chat_completion(
        history,
        temperature=0.95,
        top_p=0.9,
        max_tokens=512,
        stream=True,
        model="HuggingFaceH4/zephyr-7b-beta"
    ):
        response["content"] += message.choices[0].delta.content or ""

        yield history + [response]


with gr.Blocks() as demo:
    gr.Markdown("# Chat with Hugging Face Zephyr 7b 🤗")
    chatbot = gr.Chatbot(
        label="Agent",
        type="messages",
        avatar_images=(
            None,
            "https://em-content.zobj.net/source/twitter/376/hugging-face_1f917.png",
        ),
    )
    prompt = gr.Textbox(max_lines=1, label="Chat Message")
    prompt.submit(respond, [prompt, chatbot], [chatbot])
    prompt.submit(lambda: "", None, [prompt])


if __name__ == "__main__":
    demo.launch()
```

## The Undo Event

Our undo event will populate the textbox with the previous user message and also remove all subsequent assistant responses.

In order to know the index of the last user message, we can pass `gr.UndoData` to our event handler function like so:

``python
def handle_undo(history, undo_data: gr.UndoData):
    return history[:undo_data.index], history[undo_data.index]['content']
```

We then pass this function to the `undo` event!

```python
    chatbot.undo(handle_undo, chatbot, [chatbot, prompt])
```

You'll notice that every bot response will now have an "undo icon" you can use to undo the response - 

![undo_event](https://github.com/user-attachments/assets/180b5302-bc4a-4c3e-903c-f14ec2adcaa6)


## The Retry Event

The retry event will work similarly. We'll use `gr.RetryData` to get the index of the previous user message and remove all the subsequent messages from the history. Then we'll use the `respond` function to generate a new response.

```python
def handle_retry(history, retry_data: gr.RetryData):
    new_history = history[:retry_data.index]
    previous_prompt = history[retry_data.index]['content']
    yield from respond(previous_prompt, new_history)

...

chatbot.retry(handle_retry, chatbot, [chatbot])
```

You'll see that the bot messages have a "retry" icon now -

![retry_event](https://github.com/user-attachments/assets/cec386a7-c4cd-4fb3-a2d7-78fd806ceac6)


That's it! You now know how you can implement the retry and undo events for the Chatbot.
