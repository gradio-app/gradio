'''
A script that benchmarks the queue performance, can be used to compare the performance 
of the queue on a given branch vs the main branch. By default, runs 100 jobs in batches
of 20 and prints the average time per job. The inference time for each job (without the
network overhead of sending/receiving the data) is 0.5 seconds. Each job sends one of:
a text, image, audio, or video input and the output is the same as the input.

Navigate to the root directory of the gradio repo and run:
>> python scripts/benchmark_queue.py

You can specify the number of jobs to run and the batch size with the -n parameter:
>> python scripts/benchmark_queue.py -n 1000

The results are printed to the console, but you can specify a path to save the results 
to with the -o parameter:
>> python scripts/benchmark_queue.py -n 1000 -o results.json
'''

import argparse
import asyncio
import json
import random
import time

import pandas as pd
import websockets

import gradio as gr
from gradio_client import media_data


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
demo.queue(max_size=50).launch(prevent_thread_lock=True, quiet=True)


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


async def main(host, n_results=100):
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
    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument("-n", "--n_jobs", type=int, help="number of jobs", default=100, required=False)
    parser.add_argument("-o", "--output", type=str, help="path to write output to", required=False)     
    args = parser.parse_args()

    host = f"{demo.local_url.replace('http', 'ws')}queue/join"
    data = asyncio.run(main(host, n_results=args.n_jobs))
    data = dict(zip(data["fn_to_hit"], data["duration"]))
    
    print(data)
    
    if args.output:
        print("Writing results to:", args.output)
        json.dump(data, open(args.output, "w"))
