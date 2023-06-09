import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from typing import List
import threading


tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small")


def get_message_pair(user_message) -> List[tuple[str, str]]:
    new_user_input_ids = tokenizer.encode(
        user_message + tokenizer.eos_token, return_tensors="pt"
    )

    bot_input_ids = torch.cat([torch.LongTensor([]), new_user_input_ids], dim=-1)

    response_1 = model.generate(
        bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id
    ).tolist()

    response_2 = model.generate(
        bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id
    ).tolist()

    response_1 = tokenizer.decode(response_1[0]).split("<|endoftext|>")
    response_2 = tokenizer.decode(response_2[0]).split("<|endoftext|>")

    user_message = response_1[0]
    
    # DialoGPT-small allows faster itereation but not very diverse answers. Upper-case RESP B instead to distinguish.
    option_a = f"A: {response_1[1]}"
    option_b = f"B: {response_2[1].upper()}" 

    message_pair = [(user_message, option_a, option_b)]

    return message_pair


def generate(user_message, history):
    history.append([user_message, None])

    message_pair = get_message_pair(user_message)
    history[-1] = message_pair[0]
    return "", history

# User's custom fucntion to store the responses
def save_results(history, score):
    print(f"Save results: {history} | {score}")
    return


def on_select(event: gr.SelectData, history):
    score = event.value
    index_to_delete = event.index
    
    # If the save_results operation is I/O bound (for example, pushing it to the Hub), it can cause lag in the UI. 
    # So starting a new thread for this.
    threading.Thread(target=save_results, args=(history, score)).start()
    
    new_history = history.copy()
    del new_history[-1][index_to_delete]

    return new_history


with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    user_message = gr.Textbox()
    clear = gr.Button("Clear")

    user_message.submit(
        generate,
        [user_message, chatbot],
        [user_message, chatbot],
        queue=False,
    )

    chatbot.select(on_select, chatbot, chatbot)

    clear.click(lambda: None, None, chatbot, queue=False)

if __name__ == "__main__":
    demo.launch()
