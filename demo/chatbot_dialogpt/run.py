import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")


def user(message, history):
    return "", history + [[message, None]]


def bot(history):
    user_message = history[-1][0]
    new_user_input_ids = tokenizer.encode(
        user_message + tokenizer.eos_token, return_tensors="pt"
    )

    # append the new user input tokens to the chat history
    bot_input_ids = torch.cat([torch.LongTensor([]), new_user_input_ids], dim=-1)

    # generate a response
    response = model.generate(
        bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id
    ).tolist()

    # convert the tokens to text, and then split the responses into lines
    response = tokenizer.decode(response[0]).split("<|endoftext|>")
    response = [
        (response[i], response[i + 1]) for i in range(0, len(response) - 1, 2)
    ]  # convert to tuples of list
    history[-1] = response[0]
    return history


with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    msg = gr.Textbox()
    clear = gr.Button("Clear")

    msg.submit(user, [msg, chatbot], [msg, chatbot], queue=False).then(
        bot, chatbot, chatbot
    )
    clear.click(lambda: None, None, chatbot, queue=False)

if __name__ == "__main__":
    demo.launch()
