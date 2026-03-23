from gradio import App
from fastapi.responses import HTMLResponse

app = App()

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
<head><title>Calculator</title>
<style>
  * { margin: 0; box-sizing: border-box; font-family: 'Courier New', monospace; }
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a1a2e; }
  .calc { background: #16213e; padding: 2rem; border-radius: 1rem; box-shadow: 0 8px 32px rgba(0,0,0,.4); width: 320px; }
  #out { background: #0f3460; color: #0f0; font-size: 2rem; text-align: right; padding: .75rem 1rem; border-radius: .5rem; min-height: 3rem; margin-bottom: 1rem; }
  .row { display: flex; gap: .5rem; margin-bottom: .5rem; }
  input { flex: 1; min-width: 0; padding: .6rem; font-size: 1.2rem; border: none; border-radius: .5rem; background: #e2e2e2; text-align: center; }
  button { flex: 1; padding: .6rem; font-size: 1rem; border: none; border-radius: .5rem; cursor: pointer; font-weight: bold; color: #fff; }
  .add { background: #e94560; } .mul { background: #533483; }
  button:hover { opacity: .85; }
</style></head>
<body>
  <div class="calc">
    <div id="out">0</div>
    <div class="row"><input id="a" type="number" value="3"><input id="b" type="number" value="5"></div>
    <div class="row"><button class="add" onclick="run('add')">+</button><button class="mul" onclick="run('multiply')">&times;</button></div>
  </div>
  <script type="module">
    import { client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
    const app = await client(location.origin);
    window.run = async (ep) => {
      const a = parseInt(document.getElementById("a").value), b = parseInt(document.getElementById("b").value);
      document.getElementById("out").textContent = (await app.predict("/" + ep, { a, b })).data;
    };
  </script>
</body>
</html>"""

if __name__ == "__main__":
    app.launch(mcp_server=True)
