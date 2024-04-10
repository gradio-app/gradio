# Load Test

This folder contains the content to load test gradio apps, and check the ability to handle multiple connections simultaneously. 


## Setup

For a proper "production" environment load test, you can run gradio behind an nginx config. Install nginx and add `nginx.conf` to `/etc/nginx/conf.d/*.conf` on the machine running gradio. (You may want to have a machine running gradio that is separate from the machine running the load test, to include the effect of network latency).

`gradio.py` contains a simple gradio chat app that streams 500 tokens at a rate of 100 tokens/sec. This app is compatible with gradio 3.x as well.

`simple.py` contains a simple fastapi that streams 500 tokens at a rate of 100 tokens/sec, with both a WS and SSE endpoint. This does not use gradio. The purpose of this file is to compare the performance of streaming raw websockets and SSE, vs with gradio overhead.

`workers.py` contains a fastapi that uses queues and worker threads to stream 500 tokens at a rate of 100 tokens/sec, with both a WS and SSE endpoint. The purpose of this file is to compare the performance of streaming websockets and SSE with the implementation of gradio but without all the overhead.


`load.ipynb` supports running load tests on `chat.py` with gradio 3.x and 4.0, as well as on `app.py`. Simply configure the URL to point to where the app is running.
