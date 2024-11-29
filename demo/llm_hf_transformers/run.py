from transformers import AutoModelForCausalLM, AutoTokenizer
import gradio as gr

checkpoint = "HuggingFaceTB/SmolLM2-135M-Instruct"
device = "cpu"  # "cuda" or "cpu"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
model = AutoModelForCausalLM.from_pretrained(checkpoint).to(device)

def predict(message, history):
    history.append({"role": "user", "content": message})
    input_text = tokenizer.apply_chat_template(history, tokenize=False)
    inputs = tokenizer.encode(input_text, return_tensors="pt").to(device)  # type: ignore
    outputs = model.generate(inputs, max_new_tokens=100, temperature=0.2, top_p=0.9, do_sample=True)
    decoded = tokenizer.decode(outputs[0])
    response = decoded.split("<|im_start|>assistant\n")[-1].split("<|im_end|>")[0]
    return response

demo = gr.ChatInterface(predict, type="messages")

if __name__ == "__main__":
    demo.launch()
