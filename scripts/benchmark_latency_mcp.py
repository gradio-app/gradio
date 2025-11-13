import asyncio
import time

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

import gradio as gr

SHOW_RESULTS = False

with gr.Blocks() as demo:
    input = gr.Textbox(label="Input")
    output = gr.Textbox(label="Output")
    def double(word: str) -> str:
        return word * 2
    input.change(double, input, output, api_name="predict")

_, url, _ = demo.launch(prevent_thread_lock=True, mcp_server=True)

mcp_url = f"{url}gradio_api/mcp/"

async def make_serial_requests():
    times = []

    async with streamablehttp_client(mcp_url) as (read_stream, write_stream, _):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()

            tools = await session.list_tools()
            tool_name = tools.tools[0].name

            for _ in range(5):
                start = time.time()
                result = await session.call_tool(tool_name, arguments={"word": "Hello"})
                end = time.time()
                times.append(end - start)

    if SHOW_RESULTS:
        print("Serial result was: ", result.content[0].text)
    print(f"Serial average: {sum(times) / len(times)} seconds")

asyncio.run(make_serial_requests())


async def make_serial_requests_with_progress():    
    times = []
    progress_counts = []

    async with streamablehttp_client(mcp_url) as (read_stream, write_stream, _):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()

            tools = await session.list_tools()
            tool_name = tools.tools[0].name

            for _ in range(5):
                progress_updates = []
                
                async def progress_callback(progress: float, total: float | None, message: str | None):
                    progress_updates.append({"progress": progress, "total": total, "message": message})
                
                start = time.time()
                result = await session.call_tool(
                    tool_name,
                    arguments={"word": "Hello"},
                    progress_callback=progress_callback,
                    meta={"progressToken": f"progress-token-{_}"}
                )
                end = time.time()
                times.append(end - start)
                progress_counts.append(len(progress_updates))

    if SHOW_RESULTS:
        print("Serial with progress result was: ", result.content[0].text)
    print(f"Serial with progress average: {sum(times) / len(times)} seconds")
    print(f"Average progress notifications received: {sum(progress_counts) / len(progress_counts)}")

asyncio.run(make_serial_requests_with_progress())

async def make_parallel_requests():
    parallel_times = []
    results = []

    async def make_request():
        async with streamablehttp_client(mcp_url) as (read_stream, write_stream, _):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                tools = await session.list_tools()
                tool_name = tools.tools[0].name
                start = time.time()
                result = await session.call_tool(tool_name, arguments={"word": "Hello"})
                end = time.time()
                parallel_times.append(end - start)
                results.append(result)

    tasks = [make_request() for _ in range(25)]
    await asyncio.gather(*tasks)

    if SHOW_RESULTS:
        print("Parallel result was: ", results[0].content[0].text)
    print(f"Parallel average: {sum(parallel_times) / len(parallel_times)} seconds")

asyncio.run(make_parallel_requests())

