from gradio import App
from fastapi.responses import HTMLResponse

app = App()

cache = {}

@app.mcp.tool(name="add")
@app.api(name="add")
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    result = a + b
    cache[f"{a}+{b}"] = result
    return result

@app.mcp.tool(name="multiply")
@app.api(name="multiply")
def multiply(a: int, b: int) -> int:
    """Multiply two numbers together."""
    result = a * b
    cache[f"{a}*{b}"] = result
    return result

@app.get("/", response_class=HTMLResponse)
async def homepage():
    return """
<!DOCTYPE html>
<html>
<head><title>Calculator</title></head>
<body>
  <h1>Calculator</h1>
  <input id="a" type="number" placeholder="a" value="3">
  <input id="b" type="number" placeholder="b" value="5">
  <button onclick="run('add')">Add</button>
  <button onclick="run('multiply')">Multiply</button>
  <pre id="out"></pre>
  <script type="module">
    import { client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
    const app = await client(location.origin);
    window.run = async (endpoint) => {
      const a = parseInt(document.getElementById("a").value);
      const b = parseInt(document.getElementById("b").value);
      const result = await app.predict("/" + endpoint, { a, b });
      document.getElementById("out").textContent = JSON.stringify(result.data);
    };
  </script>
</body>
</html>"""

@app.get("/cache")
async def get_cache():
    return cache

if __name__ == "__main__":
    app.launch(mcp_server=True)
