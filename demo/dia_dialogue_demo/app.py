import gradio as gr
import httpx


emotions = [
    "(laughs)",
    "(clears throat)",
    "(sighs)",
    "(gasps)",
    "(coughs)",
    "(singing)",
    "(sings)",
    "(mumbles)",
    "(beep)",
    "(groans)",
    "(sniffs)",
    "(claps)",
    "(screams)",
    "(inhales)",
    "(exhales)",
    "(applause)",
    "(burps)",
    "(humming)",
    "(sneezes)",
    "(chuckle)",
    "(whistles)",
]
speakers = ["Speaker 1", "Speaker 2"]

client = httpx.AsyncClient(timeout=180)
API_URL = "https://router.huggingface.co/fal-ai/fal-ai/dia-tts"


async def query(dialogue: str, token: gr.OAuthToken | None):
    if token is None:
        raise gr.Error(
            "No token provided. Use Sign in with Hugging Face to get a token."
        )
    headers = {
        "Authorization": f"Bearer {token.token}",
    }
    response = await client.post(API_URL, headers=headers, json={"text": dialogue})
    url = response.json()["audio"]["url"]
    print("URL: ", url)
    return url


def formatter(speaker, text):
    speaker = speaker.split(" ")[1]
    return f"[S{speaker}] {text}"


with gr.Blocks() as demo:
    with gr.Sidebar():
        login_button = gr.LoginButton()
    gr.HTML(
        """
        <h1 style='text-align: center; display: flex; align-items: center; justify-content: center;'>
        <img src="https://huggingface.co/datasets/freddyaboulton/bucket/resolve/main/dancing_huggy.gif" alt="Dancing Huggy" style="height: 100px; margin-right: 10px"> Dia Dialogue Generation Model
        </h1>
        <h2 style='text-align: center; display: flex; align-items: center; justify-content: center;'>Model by <a href="https://huggingface.co/nari-labs/Dia-1.6B"> Nari Labs</a>. Powered by HF and <a href="https://fal.ai/">Fal AI</a>  API.</h2>
        <h3>Dia is a dialogue generation model that can generate realistic dialogue between two speakers. Use the dialogue component to create a conversation and then hit the submit button in the bottom right corner to see it come to life .</h3>
        """
    )
    with gr.Row():
        with gr.Column():
            dialogue = gr.Dialogue(
                speakers=speakers, emotions=emotions, formatter=formatter
            )
        with gr.Column():
            with gr.Row():
                audio = gr.Audio(label="Audio")
            with gr.Row():
                gr.DeepLinkButton(value="Share Audio via Link")
    with gr.Row():
        gr.Examples(
            examples=[
                [
                    [
                        {
                            "speaker": "Speaker 1",
                            "text": "Why did the chicken cross the road?",
                        },
                        {"speaker": "Speaker 2", "text": "I don't know!"},
                        {
                            "speaker": "Speaker 1",
                            "text": "to get to the other side! (laughs)",
                        },
                    ]
                ],
                [
                    [
                        {
                            "speaker": "Speaker 1",
                            "text": "I am a little tired today (sighs).",
                        },
                        {"speaker": "Speaker 2", "text": "Hang in there!"},
                    ]
                ],
            ],
            inputs=[dialogue],
            cache_examples=False,
        )

    dialogue.submit(query, [dialogue], audio)

if __name__ == "__main__":
    demo.launch()
