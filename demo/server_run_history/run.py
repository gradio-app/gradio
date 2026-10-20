"""A `gr.Server` app with a custom frontend that saves its runs to the user's
own Hugging Face bucket, and repopulates itself from that history.

The frontend owns the whole UI, so it names the bucket on the client and reads
the records back itself; the server records each run from the call it actually
executed, using the signed-in user's own credentials.
"""

import os
import uuid
from pathlib import Path

# Runs are filed under the app id, which is otherwise random per process — pin
# it so a restart does not orphan everything saved before it.
os.environ.setdefault("GRADIO_APP_ID", "server-run-history-demo")

from PIL import Image, ImageDraw, ImageFont  # noqa: E402
from fastapi import Request  # noqa: E402
from fastapi.responses import FileResponse, HTMLResponse  # noqa: E402

from gradio import Server  # noqa: E402
from gradio.utils import get_upload_folder  # noqa: E402

server = Server()

PALETTES = {
    "sunset": ((255, 126, 95), (254, 180, 123)),
    "ocean": ((33, 147, 176), (109, 213, 237)),
    "forest": ((17, 153, 142), (56, 239, 125)),
    "grape": ((101, 78, 163), (234, 175, 200)),
}


@server.api(name="shout")
def shout(text: str) -> str:
    """Uppercase some text. A plain JSON-in, JSON-out endpoint."""
    return f"{text.upper()}!"


@server.api(name="badge")
def badge(text: str, palette: str) -> dict:
    """Render a badge and return it as a gradio file value.

    Server-mode endpoints pass values through untouched (`gr.Api` does no
    pre/postprocessing), so a file has to be returned as a file *node* for the
    history recorder to recognise it as one. Writing into the upload folder is
    what makes the path trusted: the recorder stores nothing outside it.
    """
    start, end = PALETTES.get(palette, PALETTES["sunset"])
    image = Image.new("RGB", (480, 140))
    draw = ImageDraw.Draw(image)
    for x in range(480):
        ratio = x / 479
        draw.line(
            [(x, 0), (x, 140)],
            fill=tuple(round(start[i] + (end[i] - start[i]) * ratio) for i in range(3)),
        )
    draw.text(
        (240, 70),
        text[:28],
        font=ImageFont.load_default(size=34),
        fill=(255, 255, 255),
        anchor="mm",
    )

    folder = Path(get_upload_folder()) / uuid.uuid4().hex
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / "badge.png"
    image.save(path)
    return {
        "path": str(path),
        "meta": {"_type": "gradio.FileData"},
        "orig_name": "badge.png",
    }


@server.get("/whoami")
def whoami(request: Request) -> dict:
    """Who the session is signed in as, for the frontend's login state."""
    info = request.session.get("oauth_info") or {}
    return {"user": (info.get("userinfo") or {}).get("preferred_username")}


CLIENT_BUNDLE = (
    Path(__file__).resolve().parents[2] / "client" / "js" / "dist" / "index.min.js"
)


@server.get("/client.js")
def client_js():
    """Serve the local build of `@gradio/client` (swap for the CDN in your app)."""
    return FileResponse(CLIENT_BUNDLE, media_type="text/javascript")


@server.get("/", response_class=HTMLResponse)
def home():
    return (Path(__file__).parent / "index.html").read_text(encoding="utf-8")


if __name__ == "__main__":
    server.launch(oauth=True)
