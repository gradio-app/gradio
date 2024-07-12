# Using the Messages data format

In the previous guides, we built chatbots where the conversation history was stored in a list of tuple pairs.
It is also possible to use the more flexible [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api#messages-api), which is fully compatible with LLM API providers such as Hugging Face Text Generation Inference, Llama.cpp server, and OpenAI's chat completions API.

To use this format, set the `type` parameter of `gr.Chatbot` or `gr.ChatInterface` to `'messages'`. This expects a list of dictionaries with content and role keys.

The `role` key should be `'assistant'` for the bot/llm and `user` for the human.

The `content` key can be one of three things:

1. A string (markdown supported) to display a simple text message
2. A dictionary (or `gr.FileData`) to display a file. At minimum this dictionary should contain a `path` key corresponding to the path to the file. Full documenation of this dictionary is in the appendix of this guide.
3. A gradio component - at present `gr.Plot`, `gr.Image`, `gr.Gallery`, `gr.Video`, `gr.Audio` are supported. 

For better type hinting and auto-completion in your IDE, you can use the `gr.ChatMessage` dataclass:

```python
from gradio import ChatMessage

def chat_function(message, history):
    history.append(ChatMessage(role="user", content=message))
    history.append(ChatMessage(role="assistant", content="Hello, how can I help you?"))
    return history
```

## Examples

The following chatbot will always greet the user with "Hello"

```python
import gradio as gr

def chat_greeter(msg, history):
    history.append({"role": "assistant", "content": "Hello!"})
    return history

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(type="messages")
    msg = gr.Textbox()
    clear = gr.ClearButton([msg, chatbot])

    msg.submit(chat_greeter, [msg, chatbot], [chatbot])

demo.launch()
```

The messages format lets us seemlessly stream from the Hugging Face Inference API -

```python
import gradio as gr
from huggingface_hub import InferenceClient

client = InferenceClient("HuggingFaceH4/zephyr-7b-beta")

def respond(message, history: list[dict]):

    messages = history + [{"role": "user", "content": message}]

    print(messages)

    response = {"role": "assistant", "content": ""}

    for message in client.chat_completion(
        messages,
        max_tokens=512,
        stream=True,
        temperature=0.7,
        top_p=0.95,
    ):
        token = message.choices[0].delta.content

        response['content'] += token
        yield response


demo = gr.ChatInterface(respond, type="messages")

if __name__ == "__main__":
    demo.launch()
```


### Appendix

The full contents of the dictionary format for files is documented here

```python
class FileDataDict(TypedDict):
    path: str  # server filepath
    url: NotRequired[Optional[str]]  # normalised server url
    size: NotRequired[Optional[int]]  # size in bytes
    orig_name: NotRequired[Optional[str]]  # original filename
    mime_type: NotRequired[Optional[str]]
    is_stream: NotRequired[bool]
    meta: dict[Literal["_type"], Literal["gradio.FileData"]]
```