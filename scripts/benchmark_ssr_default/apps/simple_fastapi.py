"""The same app as simple_gradio.py, written with plain FastAPI.

It serves a hand-written HTML page with the same element ids, and a JSON endpoint
that runs the same function. It's the floor that Gradio's overhead is measured
against: no queue, no SSE, no frontend framework.
"""

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>bench</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; }
  label { display: block; margin: 1rem 0 .25rem; }
  input { width: 100%; padding: .5rem; box-sizing: border-box; }
  button { margin-top: 1rem; padding: .5rem 1rem; }
</style>
</head>
<body>
<div id="name"><label>Name<input></label></div>
<button id="greet">Greet</button>
<div id="out"><label>Greeting<input readonly></label></div>
<script>
  document.getElementById("greet").addEventListener("click", async () => {
    const name = document.querySelector("#name input").value;
    const res = await fetch("/api/greet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [name] }),
    });
    const body = await res.json();
    document.querySelector("#out input").value = body.data[0];
  });
</script>
</body>
</html>
"""


def greet(name):
    return f"Hello {name}!"


class Payload(BaseModel):
    data: list


app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def index():
    return PAGE


@app.post("/api/greet")
def predict(payload: Payload):
    return {"data": [greet(payload.data[0])]}
