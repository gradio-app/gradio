import gradio as gr
from gradio import media_data
import asyncio
import websockets
import json
import time
import random
import pandas as pd
import argparse


def identity_with_sleep(x):
    time.sleep(0.5)
    return x


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_txt = gr.Text()
            output_text = gr.Text()
            submit_text = gr.Button()
            submit_text.click(identity_with_sleep, input_txt, output_text, api_name="text")
        with gr.Column():
            input_img = gr.Image()
            output_img = gr.Image()
            submit_img = gr.Button()
            submit_img.click(identity_with_sleep, input_img, output_img, api_name="img")
        with gr.Column():
            input_audio = gr.Audio()
            output_audio = gr.Audio()
            submit_audio = gr.Button()
            submit_audio.click(identity_with_sleep, input_audio, output_audio, api_name="audio")
        with gr.Column():
            input_video = gr.Video()
            output_video = gr.Video()
            submit_video = gr.Button()
            submit_video.click(identity_with_sleep, input_video, output_video, api_name="video")
demo.queue(max_size=50, concurrency_count=20).launch(prevent_thread_lock=True)


FN_INDEX_TO_DATA = {
    "text": (0, "A longish text " * 15),
    "image": (1, media_data.BASE64_IMAGE),
    "audio": (2, media_data.BASE64_AUDIO),
    "video": (3, media_data.BASE64_VIDEO)
}


async def get_prediction(host):
    async with websockets.connect(host) as ws:
        completed = False
        name = random.choice(["image", "text", "audio", "video"])
        fn_to_hit, data = FN_INDEX_TO_DATA[name]
        start = time.time()

        while not completed:
            msg = json.loads(await ws.recv())
            if msg["msg"] == "send_data":
                await ws.send(json.dumps({"data": [data], "fn_index": fn_to_hit}))
            if msg["msg"] == "send_hash":
                await ws.send(json.dumps({"fn_index": fn_to_hit, "session_hash": "shdce"}))
            if msg["msg"] == "process_completed":
                completed = True
                end = time.time()
                return {"fn_to_hit": name, "duration": end - start}


async def main(host, n_results=1000):
    results = []
    while len(results) < n_results:
        batch_results = await asyncio.gather(*[get_prediction(host) for _ in range(20)])
        for result in batch_results:
            if result:
                results.append(result)    

    data = pd.DataFrame(results).groupby("fn_to_hit").agg({"mean"})
    data.columns = data.columns.get_level_values(0)
    data = data.reset_index()
    data = {"fn_to_hit": data["fn_to_hit"].to_list(), "duration": data["duration"].to_list()}                
    return data


if __name__ == "__main__":
    host = f"{demo.local_url.replace('http', 'ws')}queue/join"
    data = asyncio.run(main(host))

    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument("output", type=str, help="path to write output to")     
    args = parser.parse_args()
    
    print(data)
    json.dump(data, open(args.output, "w"))
