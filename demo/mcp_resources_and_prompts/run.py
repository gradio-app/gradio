"""
Adapts the FastMCP quickstart example to work with Gradio's MCP integration.
"""
import gradio as gr


@gr.mcp.tool()  # Not needed as functions are registered as tools by default
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


@gr.mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    return f"Hello, {name}!"


@gr.mcp.prompt()
def greet_user(name: str, style: str = "friendly") -> str:
    """Generate a greeting prompt"""
    styles = {
        "friendly": "Please write a warm, friendly greeting",
        "formal": "Please write a formal, professional greeting", 
        "casual": "Please write a casual, relaxed greeting",
    }

    return f"{styles.get(style, styles['friendly'])} for someone named {name}."


demo = gr.TabbedInterface(
    [
        gr.Interface(add, [gr.Number(value=1), gr.Number(value=2)], gr.Number()),
        gr.Interface(get_greeting, gr.Textbox("Abubakar"), gr.Textbox()),
        gr.Interface(greet_user, [gr.Textbox("Abubakar"), gr.Dropdown(choices=["friendly", "formal", "casual"])], gr.Textbox()),
    ],
    [
        "Add",
        "Get Greeting",
        "Greet User",
    ]
)


if __name__ == "__main__":
    demo.launch(mcp_server=True)
