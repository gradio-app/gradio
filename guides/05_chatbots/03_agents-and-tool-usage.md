# Building a UI for an LLM Agent

Tags: LLM, AGENTS, CHAT
Related spaces: https://huggingface.co/spaces/gradio/agent_chatbot, https://huggingface.co/spaces/gradio/langchain-agent

The Gradio Chatbot can natively display intermediate thoughts and tool usage. This makes it perfect for creating UIs for LLM agents. This guide will show you how. Before we begin, familiarize yourself with the `messages` chatbot data format documented in this [guide](./messages-format).

## The metadata key

In addition to the `content` and `role` keys, the messages dictionary accepts a `metadata` key. At present, the `metadata` key accepts a dictionary with a single key called `title`. 
If you specify a `title` for the message, it will be displayed in a collapsible box.

Here is an example, were we display the agent's thought to use a weather API tool to answer the user query.

```python
with gr.Blocks() as demo:
    chatbot  = gr.Chatbot(type="messages",
            value=[{"role": "user", "content": "What is the weather in San Francisco?"},
                    {"role": "assistant", "content": "I need to use the weather API tool",
                    "metadata": {"title":  "🧠 Thinking"}}]
            )
```

![simple-metadat-chatbot](https://github.com/freddyaboulton/freddyboulton/assets/41651716/3941783f-6835-4e5e-89a6-03f850d9abde)


## A real example using transformers.agents

We'll create a Gradio application simple agent that has access to a text-to-image tool.

Tip: Make sure you read the transformers agent [documentation](https://huggingface.co/docs/transformers/en/agents) first

We'll start by importing the necessary classes from transformers and gradio. 

```python
import gradio as gr
from gradio import ChatMessage
from transformers import load_tool, ReactCodeAgent, HfEngine
from utils import stream_from_transformers_agent

# Import tool from Hub
image_generation_tool = load_tool("m-ric/text-to-image")


llm_engine = HfEngine("meta-llama/Meta-Llama-3-70B-Instruct")
# Initialize the agent with both tools
agent = ReactCodeAgent(tools=[image_generation_tool], llm_engine=llm_engine)
```

Then we'll build the UI. The bulk of the logic is handled by `stream_from_transformers_agent`. We won't cover it in this guide because it will soon be merged to transformers but you can see its source code [here](https://huggingface.co/spaces/gradio/agent_chatbot/blob/main/utils.py).

```python
def interact_with_agent(prompt, messages):
    messages.append(ChatMessage(role="user", content=prompt))
    yield messages
    for msg in stream_from_transformers_agent(agent, prompt):
        messages.append(msg)
        yield messages
    yield messages


with gr.Blocks() as demo:
    stored_message = gr.State([])
    chatbot = gr.Chatbot(label="Agent",
                         type="messages",
                         avatar_images=(None, "https://em-content.zobj.net/source/twitter/53/robot-face_1f916.png"))
    text_input = gr.Textbox(lines=1, label="Chat Message")
    text_input.submit(lambda s: (s, ""), [text_input], [stored_message, text_input]).then(interact_with_agent, [stored_message, chatbot], [chatbot])
```

You can see the full demo code [here](https://huggingface.co/spaces/gradio/agent_chatbot/blob/main/app.py).


![transformers_agent_code](https://github.com/freddyaboulton/freddyboulton/assets/41651716/c8d21336-e0e6-4878-88ea-e6fcfef3552d)


## A real example using langchain agents

We'll create a UI for langchain agent that has access to a search engine.

We'll begin with imports and setting up the langchain agent. Note that you'll need an .env file with
the following environment variables set - 

```
SERPAPI_API_KEY=
HF_TOKEN=
OPENAI_API_KEY=
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent, load_tools
from langchain_openai import ChatOpenAI
from gradio import ChatMessage
import gradio as gr

from dotenv import load_dotenv

load_dotenv()

model = ChatOpenAI(temperature=0, streaming=True)

tools = load_tools(["serpapi"])

# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-tools-agent")
# print(prompt.messages) -- to see the prompt
agent = create_openai_tools_agent(
    model.with_config({"tags": ["agent_llm"]}), tools, prompt
)
agent_executor = AgentExecutor(agent=agent, tools=tools).with_config(
    {"run_name": "Agent"}
)
```

Then we'll create the Gradio UI

```python
async def interact_with_langchain_agent(prompt, messages):
    messages.append(ChatMessage(role="user", content=prompt))
    yield messages
    async for chunk in agent_executor.astream(
        {"input": prompt}
    ):
        if "steps" in chunk:
            for step in chunk["steps"]:
                messages.append(ChatMessage(role="assistant", content=step.action.log,
                                  metadata={"title": f"🛠️ Used tool {step.action.tool}"}))
                yield messages
        if "output" in chunk:
            messages.append(ChatMessage(role="assistant", content=chunk["output"]))
            yield messages


with gr.Blocks() as demo:
    gr.Markdown("# Chat with a LangChain Agent 🦜⛓️ and see its thoughts 💭")
    chatbot = gr.Chatbot(
        type="messages",
        label="Agent",
        avatar_images=(
            None,
            "https://em-content.zobj.net/source/twitter/141/parrot_1f99c.png",
        ),
    )
    input = gr.Textbox(lines=1, label="Chat Message")
    input.submit(interact_with_langchain_agent, [input_2, chatbot_2], [chatbot_2])

demo.launch()
```

![langchain_agent_code](https://github.com/freddyaboulton/freddyboulton/assets/41651716/762283e5-3937-47e5-89e0-79657279ea67)

That's it! See our finished langchain demo [here](https://huggingface.co/spaces/gradio/langchain-agent).



