import gradio as gr
import os
from huggingface_hub import InferenceClient

# --- 1. Setup the Hugging Face Client ---
try:
    client = InferenceClient(token=os.environ["HF_TOKEN"])
except KeyError:
    raise ValueError("Please set the HF_TOKEN environment variable to your Hugging Face token.")

MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"

# --- 2. The chatbot function that can fail ---
def get_llm_response(user_input, history, force_fail):
    """
    Adds the user's message to history and generates a real LLM response.
    Can be forced to fail using the checkbox.
    """
    # CHANGED: Now appends a dictionary, matching the new chatbot type
    history.append({"role": "user", "content": user_input})

    if force_fail:
        raise gr.Error("Simulating a backend failure!")

    try:
        # The history is already in the correct format for the API
        messages = history

        # CHANGED: Called the correct method `chat_completion` with `stream=True`
        response_stream = client.chat_completion(
            messages=messages,
            model=MODEL,
            max_tokens=1024,
            stream=True,
        )

        # Start with an empty assistant message
        history.append({"role": "assistant", "content": ""})

        # Stream the response into the last message
        for chunk in response_stream:
            token = chunk.choices[0].delta.content
            if token is not None:
                # CHANGED: Update the 'content' key of the last dictionary
                history[-1]["content"] += token
                # Return an empty string for the textbox to clear it on success
                yield history, ""

    except Exception as e:
        raise gr.Error(f"Hugging Face API Error: {e}")

# --- 3. Function to restore user input on failure ---
def restore_user_input(user_input, history):
    """
    This function will be called when .failure() is triggered.
    It should return the user's original input back to the textbox.
    """
    print(f" FAILURE RECOVERY: Restoring user input: '{user_input}'")
    return user_input

# --- 3. The Gradio App ---
with gr.Blocks() as demo:
    gr.Markdown(
        """
        ## Testing `.failure()` Event Listener 
        This app demonstrates the SOLUTION using the `.failure()` event listener.
        - **Success:** Type a normal message. The bot will reply and the textbox will clear.
        - **Failure:** Check the "Force Failure" checkbox and send any message. An error will appear, BUT your input will be restored to the textbox for easy retry!
        
        **The `.failure()` event should restore your message when the AI fails.**
        """
    )

    # CHANGED: Added type='messages' to use the modern format
    chatbot = gr.Chatbot(label="Chat History", height=500, type='messages', avatar_images=("user.png", "bot.png"))
    
    with gr.Row():
        textbox = gr.Textbox(
            label="Your Message", 
            placeholder="Type any message...",
            scale=4
        )
        force_fail = gr.Checkbox(
            label="Force Failure", 
            value=False,
            scale=1
        )

    textbox.submit(
        fn=get_llm_response,
        inputs=[textbox, chatbot, force_fail],
        outputs=[chatbot, textbox],
    ).failure(
        fn=restore_user_input,
        inputs=[textbox, chatbot],
        outputs=[textbox],
    )

demo.launch()