#!/usr/bin/env python

# WS server that sends messages at random intervals

import asyncio
import datetime
import random
import websockets


async def time(websocket, path):
    while True:
        input = await websocket.recv()
        print(input)
        websocket.send(random.randint(0, 9))

start_server = websockets.serve(time, '127.0.0.1', 5679)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()