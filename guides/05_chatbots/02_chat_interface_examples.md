In this Guide, we go through several examples of how to use `gr.ChatInterface` with popular LLM libraries.

## A `langchain` example

Let's start by using `langchain` on top of `openai` to build a general-purpose streaming chatbot application in 19 lines of code. You'll need to have an OpenAI key for this example (keep reading for the free, open-source equivalent!)

```python
from langchain.chat_models import ChatOpenAI
from langchain.schema import AIMessage, HumanMessage
import openai
import gradio as gr

os.environ["OPENAI_API_KEY"] = "sk-..."  # Replace with your key

llm = ChatOpenAI(temperature=1.0, model='gpt-3.5-turbo-0613')

def predict(message, history):
    history_langchain_format = []
    for msg in history:
        if msg['role'] == "user":
            history_langchain_format.append(HumanMessage(content=msg['content']))
        elif msg['role'] == "assistant":
            history_langchain_format.append(AIMessage(content=msg['content']))
    history_langchain_format.append(HumanMessage(content=message))
    gpt_response = llm(history_langchain_format)
    return gpt_response.content

gr.ChatInterface(predict, type="messages").launch()
```

## A streaming example using `openai`

Of course, we could also use the `openai` library directy. Here a similar example, but this time with streaming results as well:

```python
from openai import OpenAI
import gradio as gr

api_key = "sk-..."  # Replace with your key
client = OpenAI(api_key=api_key)

def predict(message, history):
    history_openai_format = []
    for msg in history:
        history_openai_format.append(msg)
    history_openai_format.append(message)
  
    response = client.chat.completions.create(model='gpt-3.5-turbo',
    messages= history_openai_format,
    temperature=1.0,
    stream=True)

    partial_message = ""
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
              partial_message = partial_message + chunk.choices[0].delta.content
              yield partial_message

gr.ChatInterface(predict, type="messages").launch()
```

**Handling Concurrent Users with Threads**

The example above works if you have a single user — or if you have multiple users, since it passes the entire history of the conversation each time there is a new message from a user. 

However, the `openai` library also provides higher-level abstractions that manage conversation history for you, e.g. the [Threads abstraction](https://platform.openai.com/docs/assistants/how-it-works/managing-threads-and-messages). If you use these abstractions, you will need to create a separate thread for each user session. Here's a partial example of how you can do that, by accessing the `session_hash` within your `predict()` function:

```py
import openai
import gradio as gr

client = openai.OpenAI(api_key = os.getenv("OPENAI_API_KEY"))
threads = {}

def predict(message, history, request: gr.Request):
    if request.session_hash in threads:
        thread = threads[request.session_hash]
    else:
        threads[request.session_hash] = client.beta.threads.create()
        
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=message)
    
    ...

gr.ChatInterface(predict, type="messages").launch()
```

## Example using a local, open-source LLM with Hugging Face

Of course, in many cases you want to run a chatbot locally. Here's the equivalent example using Together's RedPajama model, from Hugging Face (this requires you to have a GPU with CUDA).

```python
import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, StoppingCriteria, StoppingCriteriaList, TextIteratorStreamer
from threading import Thread

tokenizer = AutoTokenizer.from_pretrained("togethercomputer/RedPajama-INCITE-Chat-3B-v1")
model = AutoModelForCausalLM.from_pretrained("togethercomputer/RedPajama-INCITE-Chat-3B-v1", torch_dtype=torch.float16)
model = model.to('cuda:0')

class StopOnTokens(StoppingCriteria):
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        stop_ids = [29, 0]
        for stop_id in stop_ids:
            if input_ids[0][-1] == stop_id:
                return True
        return False

def predict(message, history):
    history_transformer_format = list(zip(history[:-1], history[1:])) + [[message, ""]]
    stop = StopOnTokens()

    messages = "".join(["".join(["\n<human>:"+item[0], "\n<bot>:"+item[1]])
                for item in history_transformer_format])

    model_inputs = tokenizer([messages], return_tensors="pt").to("cuda")
    streamer = TextIteratorStreamer(tokenizer, timeout=10., skip_prompt=True, skip_special_tokens=True)
    generate_kwargs = dict(
        model_inputs,
        streamer=streamer,
        max_new_tokens=1024,
        do_sample=True,
        top_p=0.95,
        top_k=1000,
        temperature=1.0,
        num_beams=1,
        stopping_criteria=StoppingCriteriaList([stop])
        )
    t = Thread(target=model.generate, kwargs=generate_kwargs)
    t.start()

    partial_message = ""
    for new_token in streamer:
        if new_token != '<':
            partial_message += new_token
            yield partial_message

gr.ChatInterface(predict).launch()
```

