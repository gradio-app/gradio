# How to Create a Chatbot with Gradio Fast

Tags: NLP, TEXT, CHAT

## Introduction

Chatbots are a popular application of large language models. Using `gradio`, you can easily build a demo of your chatbot model and share that with your users, or try it yourself using an intuitive chatbot GUI.

This tutorial uses `gr.ChatInterface()`, which is a high-level abstraction that allows you to create your chatbot UI fast, often with a single line of code. The chatbot interface that we create will look something like this:

We'll start with a couple of simple examples, and then show how to use `gr.ChatInterface()` with real language models from several popular APIs and libraries, including `langchain`, `openai`, and Hugging Face. 

**Prerequisites**: please make sure you are using the **latest version** version of Gradio:  

```bash
$ pip install --upgrade gradio
```

## Defining a chat function

When working with `gr.ChatInterface()`, the first thing you should do is define your chat function. Your chat function should take two arguments: `message` and then `history` (the arguments can be named anything, but must be in this order)

* `message`: a `str` representing the user's input
* `history`: a `list` of `list` representing the conversations up until that point. Uusally, each inner list consists of two `str` representing a pair: `[user input, bot response]`. We'll discuss this more later

Your function should return a single string response, which is the bot's response to the particular user input `message`. Your function can take into account the `history` of messages, as well as the current message.

Take a look at an example:

## Example: a chatbot that responds yes or no

Let's write a chat function that responds `Yes` or `No` randomly.

Here's our chat function:

```py
import random

def random_response(message, history):
    return random.choice(["Yes", "No"])
```

Now, we can plug this into `gr.ChatInterface()` and call the `.launch()` method to create the web interface:

```py
import gradio as gr

gr.ChatInterface(random_response).launch()
```

That's it! Here's our running demo, try it out:

## Another example using the user's input and history

Of course, the previous example was very simplistic, it didn't even take user input or the previous history into account! Here's a pretty simple example showing how to incorporate a user's input as well as the history.

```py
import random
import gradio as gr

def alternatingly_agree(message, history):
    if len(history) % 2 == 0:
        return f"Yes, I do think that '{message}'"
    else:
        return "I don't think so"

gr.ChatInterface(alternatingly_agree).launch()
```

## Streaming chatbots 

If in your chat function, if you use `yield` to generate a sequence of responses, you'll end up with a streaming chatbot. It's that simple!

```py
import random
import time
import gradio as gr

def slow_echo(message, history):
    for i in range(len(message)):
        time.sleep(0.3)
        yield message[: i+1]

gr.ChatInterface(slow_echo).queue().launch()
```

Notice that we've [enabled queuing], which is required to use generator functions.

## Customizing your chatbot

If you're familiar with Gradio's `Interface` class, the `gr.ChatInterface` includes many of the same arguments that you can use to customize the look and feel of your Chatbot. For example, you can:

* add a `title` and `description` above your chatbot using `title` and `description` arguments
* add a theme or custom css using `theme` and `css` arguments respectively
* add `examples` and even enable `cache_examples`, which make it easier for users to try it out 
* You can change the text or disable each of the buttons that appear in the chatbot interface: `submit_btn`, `retry_btn`, `delete_last_btn`, `clear_btn`

If you want to customize the `gr.Chatbot` or `gr.Textbox` that compose the `ChatInterface`, then you can pass in your own chatbot or textbox as well. Here's an example of how we can use these parameters:

If you need to create something even more custom, then its best to construct the chatbot UI using the low-level `gr.Blocks()` API. We have [a dedicated guide for that here](/).

Here's a complete example using the parameters above:

```py
import gradio as gr

def yes_man(message, history):
    if messages.endswith("?"):
        return "Yes"
    else:
        return "Ask me anything!"

gr.ChatInterface(
    yes_man,
    title="Yes Man",
    description="Ask Yes Man any question",
    theme="soft",
    examples=["Hello", "Am I cool?", "Are tomatoes vegetables?"],
    cache_examples=True,
    retry_btn=False,
    delete_last_btn="Delete",
    clear_btn="Clear",
).launch()
```

## Using your chatbot via an API

Once you've built your Gradio chatbot and are hosting it on [Hugging Face Spaces](https://hf.space) or somewhere else, then you can query it with a simple API at the `/chat` endpoint. The endpoint just expects the user's message, and will return the response, internally keeping track of the messages sent so far.

INSERT SCREENSHOT

To use the endpoint, you should use either the Gradio Python Client or the Gradio JS client.

## A `langchain` example

Now, let's actually use the `gr.ChatInterface` with some real large language models. We'll start by using `langchain` on top of `openai` to build a general-purpose streaming chatbot application in XX lines of code. You'll need to have an OpenAI key for this example (keep reading for the free, open-source equivalent!)

```py
import langchain
import gradio as gr

def predict(user_input, chatbot):

    chat = ChatOpenAI(temperature=1.0, streaming=True, model='gpt-3.5-turbo-0613')
    messages=[]

    for conv in chatbot:
        human = HumanMessage(content=conv[0])
        ai = AIMessage(content=conv[1])
        messages.append(human)
        messages.append(ai)

    messages.append(HumanMessage(content=user_input))

    # getting gpt3.5's response
    gpt_response = chat(messages)
    return gpt_response.content

gr.ChatInterface(predict, delete_last_btn="❌Delete").launch(debug=True) 
```

## An Streaming example using `openai` APIs 

openai.api_key = os.getenv("OPENAI_API_KEY")

def predict(inputs, chatbot):

    messages = []
    for conv in chatbot:
        user = conv[0]
        messages.append({"role": "user", "content":user })
        if conv[1] is None: 
            break
        assistant = conv[1]
        messages.append({"role": "assistant", "content":assistant})

    # a ChatCompletion request
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages= messages, # example :  [{'role': 'user', 'content': "What is life? Answer in three words."}],
        temperature=1.0,
        stream=True  # for streaming the output to chatbot
    )

    partial_message = ""
    for chunk in response:
        if len(chunk['choices'][0]['delta']) != 0:
          print(chunk['choices'][0]['delta']['content'])
          partial_message = partial_message + chunk['choices'][0]['delta']['content']
          yield partial_message 

gr.ChatInterface(predict, delete_last_btn="❌Delete").queue().launch(debug=True) 

## Examples using open-source LLMs with Hugging Face!

model2endpoint = {
    "starchat-alpha": "https://api-inference.huggingface.co/models/HuggingFaceH4/starcoderbase-finetuned-oasst1",
    "starchat-beta": "https://api-inference.huggingface.co/models/HuggingFaceH4/starchat-beta",
}
system_message = "Below is a conversation between a human user and a helpful AI coding assistant."

def predict(user_message, chatbot):
    client = Client(
            model2endpoint["starchat-beta"],
            headers={"Authorization": f"Bearer {<YOUR_INFERENCE_API_TOKEN>}"},
        )
    
    past_messages = []
    for data in chatbot:
        user_data, model_data = data
        if model_data is None:
            break
    
        past_messages.extend(
            [{"role": "user", "content": user_data}, {"role": "assistant", "content": model_data.rstrip()}]
        )
    
    if len(past_messages) < 1:
        dialogue_template = DialogueTemplate(
            system=system_message, messages=[{"role": "user", "content": user_message}]
        )
        prompt = dialogue_template.get_inference_prompt()
    else:
        dialogue_template = DialogueTemplate(
            system=system_message, messages=past_messages + [{"role": "user", "content": user_message}]
        )
        prompt = dialogue_template.get_inference_prompt()
    
    
    generate_kwargs = dict(
        temperature=1.0,
        max_new_tokens=1024,
        top_p=0.95,
        repetition_penalty=1.2,
        do_sample=True,
        truncate=4096,
        seed=42,
        stop_sequences=["<|end|>"],
    )
    
    stream = client.generate_stream(
        prompt,
        **generate_kwargs,
    )
    
    output = ""
    for idx, response in enumerate(stream):
        if response.token.special:
            continue
        output += response.token.text
        yield output #chat, history, user_message, ""

gr.ChatInterface(predict, delete_last_btn="❌Delete").queue().launch(debug=True)

