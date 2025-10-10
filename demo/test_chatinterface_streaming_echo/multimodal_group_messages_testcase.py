import gradio as gr

runs = 0

def reset_runs():
    global runs
    runs = 0

def slow_echo(message, history):
    global runs  # i didn't want to add state or anything to this demo
    runs = runs + 1
    for i in range(len(message['text'])):
        yield f"Run {runs} - You typed: " + message['text'][: i + 1]
    if "files" in message and message["files"]:
        yield f"Run {runs} - You typed: " + message['text'] + f" And you sent {len(message['files'])} files"

chat = gr.ChatInterface(slow_echo, multimodal=True, group_multimodal_data=True)

with gr.Blocks() as demo:
    chat.render()
    # We reset the global variable to minimize flakes
    # this works because CI runs only one test at at time
    # need to use gr.State if we want to parallelize this test
    # currently chatinterface does not support that
    demo.unload(reset_runs)

if __name__ == "__main__":
    demo.launch()