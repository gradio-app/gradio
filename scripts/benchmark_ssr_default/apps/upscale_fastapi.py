"""upscale_gradio.py written with plain FastAPI, with the same element ids.

FastAPI gets its best case: the page is an `async def` route with the example
images inlined, so it loads in one request that never waits for a thread, and
the model is a `def` route, run in FastAPI's thread pool.
"""

import base64
import io

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from PIL import Image
from upscale_model import HIGH, LOW, enhance


def data_url(image: Image.Image) -> str:
    buf = io.BytesIO()
    image.save(buf, format="webp", quality=90)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Enhance resolution</title>
<style>
  :root { color-scheme: light dark; --bg: #fff; --panel: #f4f4f5; --text: #18181b; --line: #d4d4d8; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0b0f19; --panel: #1f2937; --text: #f4f4f5; --line: #374151; }
  }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 16px 24px; }
  h2 { margin: 4px 0 16px; font-size: 22px; }
  .row { display: flex; gap: 16px; }
  .panel { flex: 1; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
  .panel span { display: block; font-size: 13px; padding: 6px 10px; }
  .panel img { display: block; width: 100%; height: 260px; object-fit: contain; }
  #slider .stage { position: relative; height: 260px; cursor: ew-resize; touch-action: none; }
  #slider .stage img { position: absolute; inset: 0; }
  #slider .handle { position: absolute; top: 0; bottom: 0; width: 2px; background: #fff; left: 50%; }
  #slider .handle::after { content: ""; position: absolute; top: 50%; left: -14px; width: 30px; height: 30px;
    margin-top: -15px; border-radius: 6px; background: #ea580c; }
  button { margin-top: 16px; width: 100%; padding: 12px; font-size: 17px; font-weight: 600; border: 0;
    border-radius: 8px; background: #ea580c; color: #fff; cursor: pointer; }
</style>
</head>
<body>
<main>
  <h2>Enhance resolution</h2>
  <div class="row">
    <div class="panel" id="input"><span>Low resolution</span><img src="__LOW__" alt=""></div>
    <div class="panel" id="slider"><span>Before / after</span>
      <div class="stage">
        <img class="after" src="__HIGH__" alt="">
        <img class="before" src="__LOW__" alt="" style="clip-path: inset(0 50% 0 0)">
        <div class="handle"></div>
      </div>
    </div>
  </div>
  <button id="enhance">Enhance</button>
</main>
<script>
  const stage = document.querySelector("#slider .stage");
  const move = (e) => {
    const r = stage.getBoundingClientRect();
    const p = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    stage.querySelector(".before").style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    stage.querySelector(".handle").style.left = p + "%";
  };
  stage.addEventListener("pointerdown", (e) => {
    stage.setPointerCapture(e.pointerId);
    move(e);
    stage.onpointermove = move;
  });
  stage.addEventListener("pointerup", () => { stage.onpointermove = null; });
  document.getElementById("enhance").addEventListener("click", async () => {
    const res = await fetch("/api/enhance", { method: "POST" });
    const body = await res.json();
    stage.querySelector(".before").src = body.before;
    stage.querySelector(".after").src = body.after;
  });
</script>
</body>
</html>
""".replace("__LOW__", data_url(LOW)).replace("__HIGH__", data_url(HIGH))

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
async def index():
    return PAGE


@app.post("/api/enhance")
def enhance_route():
    before, after = enhance(None)
    return {"before": data_url(before), "after": data_url(after)}
