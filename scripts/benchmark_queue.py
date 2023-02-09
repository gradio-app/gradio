import gradio as gr
import asyncio
import websockets
import json


async def get_prediction(host):
    async with websockets.connect(host) as ws:
        completed = False
        while not completed:
            msg = json.loads(await ws.recv())
            if msg["msg"] == "send_data":
                await ws.send(json.dumps({"data": ["A longish text " * 15], "fn_index": 0}))
            if msg["msg"] == "send_hash":
                await ws.send(json.dumps({"fn_index": 0, "session_hash": "shdce"}))
            if msg["msg"] == "process_completed":
                completed = True
                return msg

async def main(host):
    asyncio.gather(*[get_prediction(host) for _ in range(20)])


if __name__ == "__main__":
    io = gr.Interface(lambda x:x, "text", "text").queue()
    io.launch(inline=False)

    host = f"{io.local_url.replace('http', 'ws')}queue/join"
    batch_results = asyncio.run(main)
