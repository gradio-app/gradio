---
"@gradio/chatbot": minor
"@gradio/tootils": minor
"gradio": minor
"website": minor
---

highlight:

#### Support message format in chatbot 💬

`gr.Chatbot` and `gr.ChatInterface` now support the [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api#messages-api), which is fully compatible with LLM API providers such as Hugging Face Text Generation Inference, OpenAI's chat completions API, and Llama.cpp server. 

Building Gradio applications around these LLM solutions is now even easier! 

`gr.Chatbot` and `gr.ChatInterface` now have a `msg_format` parameter that can accept two values - `'tuples'` and `'messages'`. If set to `'tuples'`, the default chatbot data format is expected. If set to `'messages'`, a list of dictionaries with `content` and `role` keys is expected. See below - 

```python
def chat_greeter(msg, history):
    history.append({"role": "assistant", "content": "Hello!"})
    return history
```

Additionally, gradio now exposes a `gr.ChatMessage` dataclass you can use for IDE type hints and auto completion.

<img width="852" alt="image" src="https://github.com/freddyaboulton/freddyboulton/assets/41651716/d283e8f3-b194-466a-8194-c7e697dca9ad">


#### Tool use in Chatbot 🛠️

The Gradio Chatbot can now natively display tool usage and intermediate thoughts common in Agent and chain-of-thought workflows!

If you are using the new "messages" format, simply add a `metadata` key with a dictionary containing a `title` key and `value`. This will display the assistant message in an expandable message box to show the result of a tool or intermediate step.

```python
import gradio as gr
from gradio import ChatMessage
import time

def generate_response(history):
    history.append(ChatMessage(role="user", content="What is the weather in San Francisco right now?"))
    yield history
    time.sleep(0.25)
    history.append(ChatMessage(role="assistant",
                               content="In order to find the current weather in San Francisco, I will need to use my weather tool.")
                               )
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="API Error when connecting to weather service.",
                              metadata={"title": "💥 Error using tool 'Weather'"})
                  )
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="I will try again",
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="Weather 72 degrees Fahrenheit with 20% chance of rain.",
                                metadata={"title": "🛠️ Used tool 'Weather'"}
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="Now that the API succeeded I can complete my task.",
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="It's a sunny day in San Francisco with a current temperature of 72 degrees Fahrenheit and a 20% chance of rain. Enjoy the weather!",
                              ))
    yield history


with gr.Blocks() as demo:
    chatbot  = gr.Chatbot(msg_format="messages")
    button = gr.Button("Get San Francisco Weather")
    button.click(generate_response, chatbot, chatbot)

if __name__ == "__main__":
    demo.launch()
```



![tool-box-demo](https://github.com/freddyaboulton/freddyboulton/assets/41651716/cf73ecc9-90ac-42ce-bca5-768e0cc00a48)