import gradio as gr
from gradio import ChatMessage
from transformers import load_tool, ReactCodeAgent, HfEngine
from utils import stream_from_transformers_agent

# Import tool from Hub
image_generation_tool = load_tool("m-ric/text-to-image")


llm_engine = HfEngine("meta-llama/Meta-Llama-3-70B-Instruct")
# Initialize the agent with both tools
agent = ReactCodeAgent(tools=[image_generation_tool], llm_engine=llm_engine)


def interact_with_agent(prompt, messages):
    messages.append(ChatMessage(role="user", content=prompt))
    yield messages
    for msg in stream_from_transformers_agent(agent, prompt):
        messages.append(msg)
        yield messages
    yield messages


with gr.Blocks() as demo:
    chatbot = gr.Chatbot(label="Agent",
                         msg_format="messages",
                         avatar_images=(None, "https://em-content.zobj.net/source/twitter/53/robot-face_1f916.png"))
    text_input = gr.Textbox(lines=1, label="Chat Message")
    text_input.submit(interact_with_agent, [text_input, chatbot], [chatbot])


if __name__ == "__main__":
    demo.launch()