# Chatbot-Specific Events

Tags: LLM, CHAT

Users expect modern chatbot UIs to let them easily interact with individual chat messages: for example, users might want to retry message generations, undo messages, or click on a like/dislike button to upvote or downvote a generated message.

Thankfully, the Gradio Chatbot exposes several events, such as `.retry`, `.undo`, `.like`, and `.clear`, to let you build this functionality into your application. As an application developer, you can attach functions to any of these event, allowing you to run arbitrary Python functions e.g. when a user interacts with a message.

In this demo, we'll build a UI that implements these events. You can see our finished demo deployed on Hugging Face spaces here:

$demo_chatbot_retry_undo_like

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

Tip: You can also access the content of the user message with `undo_data.value`

## The Retry Event

The retry event will work similarly. We'll use `gr.RetryData` to get the index of the previous user message and remove all the subsequent messages from the history. Then we'll use the `respond` function to generate a new response. We could also get the previous prompt via the `value` property of `gr.RetryData`.

```python
def handle_retry(history, retry_data: gr.RetryData):
    new_history = history[:retry_data.index]
    previous_prompt = history[retry_data.index]['content']
    yield from respond(previous_prompt, new_history)

...

chatbot.retry(handle_retry, chatbot, chatbot)
```

You'll see that the bot messages have a "retry" icon now -

![retry_event](https://github.com/user-attachments/assets/cec386a7-c4cd-4fb3-a2d7-78fd806ceac6)

Tip: The Hugging Face inference API caches responses, so in this demo, the retry button will not generate a new response.

## The Like Event

By now you should hopefully be seeing the pattern!
To let users like a message, we'll add a `.like` event to our chatbot.
We'll pass it a function that accepts a `gr.LikeData` object.
In this case, we'll just print the message that was either liked or disliked.

```python
def handle_like(data: gr.LikeData):
    if data.liked:
        print("You upvoted this response: ", data.value)
    else:
        print("You downvoted this response: ", data.value)

...

chatbot.like(vote, None, None)
```

## The Edit Event

Same idea with the edit listener! with `gr.Chatbot(editable=True)`, you can capture user edits. The `gr.EditData` object tells us the index of the message edited and the new text of the mssage. Below, we use this object to edit the history, and delete any subsequent messages. 

```python
def handle_edit(history, edit_data: gr.EditData):
    new_history = history[:edit_data.index]
    new_history[-1]['content'] = edit_data.value
    return new_history

...

chatbot.edit(handle_edit, chatbot, chatbot)
```

## The Clear Event

As a bonus, we'll also cover the `.clear()` event, which is triggered when the user clicks the clear icon to clear all messages. As a developer, you can attach additional events that should happen when this icon is clicked, e.g. to handle clearing of additional chatbot state:

```python
from uuid import uuid4
import gradio as gr


def clear():
    print("Cleared uuid")
    return uuid4()


def chat_fn(user_input, history, uuid):
    return f"{user_input} with uuid {uuid}"


with gr.Blocks() as demo:
    uuid_state = gr.State(
        uuid4
    )
    chatbot = gr.Chatbot(type="messages")
    chatbot.clear(clear, outputs=[uuid_state])

    gr.ChatInterface(
        chat_fn,
        additional_inputs=[uuid_state],
        chatbot=chatbot,
        type="messages"
    )

demo.launch()
```

In this example, the `clear` function, bound to the `chatbot.clear` event, returns a new UUID into our session state, when the chat history is cleared via the trash icon. This can be seen in the `chat_fn` function, which references the UUID saved in our session state.

This example also shows that you can use these events with `gr.ChatInterface` by passing in a custom `gr.Chatbot` object.

## Conclusion

That's it! You now know how you can implement the retry, undo, like, and clear events for the Chatbot.



