"""
Adapts the FastMCP quickstart example to work with Gradio's MCP integration.
"""
import gradio as gr


def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    return f"Hello, {name}!"


def greet_user(name: str, style: str = "friendly") -> str:
    """Generate a greeting prompt"""
    styles = {
        "friendly": "Please write a warm, friendly greeting",
        "formal": "Please write a formal, professional greeting", 
        "casual": "Please write a casual, relaxed greeting",
    }

    return f"{styles.get(style, styles['friendly'])} for someone named {name}."


# Create the demo
with gr.Blocks() as demo:
    # Register MCP resources and prompts
    gr.mcp.resource("greeting://{name}")(get_greeting)
    gr.mcp.prompt()(greet_user)
    
    with gr.Tab("Add"):
        with gr.Row():
            a = gr.Number(value=1)
            b = gr.Number(value=2)
        result = gr.Number()
        gr.Interface(add, [a, b], result)
    
    with gr.Tab("Get Greeting"):
        name_input = gr.Textbox("Abubakar")
        greeting_output = gr.Textbox()
        gr.Interface(get_greeting, name_input, greeting_output)
    
    with gr.Tab("Greet User"):
        name_input2 = gr.Textbox("Abubakar")
        style_input = gr.Dropdown(choices=["friendly", "formal", "casual"])
        prompt_output = gr.Textbox()
        gr.Interface(greet_user, [name_input2, style_input], prompt_output)

if __name__ == "__main__":
    demo.launch(mcp_server=True)
