from pathlib import Path

from fastapi.staticfiles import StaticFiles
from gradio import Server

app = Server()

@app.mcp.tool(name="add")
@app.api(name="add")
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b

@app.mcp.tool(name="multiply")
@app.api(name="multiply")
def multiply(a: int, b: int) -> int:
    """Multiply two numbers together."""
    return a * b

# The frontend is plain files, served at "/" without running any Python.
app.mount("/", StaticFiles(directory=Path(__file__).parent / "static", html=True))

if __name__ == "__main__":
    app.launch(mcp_server=True)
