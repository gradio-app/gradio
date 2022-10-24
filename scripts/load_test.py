import gradio as gr
import requests
import time
from threading import Thread

NUM_INTERFACES = 20
NUM_REQUESTS_PER_INTERFACE = 1
BYTE_SIZE = 50

text_data = "a" * BYTE_SIZE
share_urls = []

for i in range(NUM_INTERFACES):
    print(">", i)
    text_iface = gr.Interface(lambda x:x, gr.Text(), gr.Text())
    _, _, share_url = text_iface.launch(share=True, prevent_thread_lock=True, server_port=8860+i)
    share_urls.append(share_url)

def send_request(url, data):
    start = time.time()
    resp = requests.post(f"{url}/api/predict/", json={"data": [data]})
    assert resp.status_code == 200
    duration = time.time() - start
    print(duration)

threads = []
start = time.time()
for share_url in share_urls:
    for _ in range(NUM_REQUESTS_PER_INTERFACE):
        thread = Thread(target=send_request, args=(share_url, text_data))
        thread.start()
        threads.append(thread)
while True:
    time.sleep(0.0001)
    live_threads = [thread.is_alive() for thread in threads]
    if not any(live_threads):
        break

duration = time.time() - start
print("TOTAL TIME", duration)
            
    