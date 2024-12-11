import gradio as gr

python_code = """
def fib(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fib(n-1) + fib(n-2)
"""

js_code = """
function fib(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
}
"""

def chat(message, history):
    if "python" in message.lower():
        return "Type Python or JavaScript to see the code.", gr.Code(language="python", value=python_code)
    elif "javascript" in message.lower():
        return "Type Python or JavaScript to see the code.", gr.Code(language="javascript", value=js_code)
    else:
        return "Please ask about Python or JavaScript.", None

with gr.Blocks() as demo:
    code = gr.Code(render=False)
    with gr.Row():
        with gr.Column():
            gr.Markdown("<center><h1>Write Python or JavaScript</h1></center>")
            gr.ChatInterface(
                chat,
                examples=["Python", "JavaScript"],
                additional_outputs=[code],
                type="messages"
            )
        with gr.Column():
            gr.Markdown("<center><h1>Code Artifacts</h1></center>")
            code.render()

demo.launch()
