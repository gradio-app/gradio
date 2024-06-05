---
"@gradio/client": major
"gradio_client": major
---

highlight:

#### Clients 1.0 Launch! 

We're excited to unveil the first major release of the Gradio clients.
We've made it even easier to turn any Gradio application into a production endpoint thanks to the clients' **ergonomic**, **transparent**, and **portable** design.

#### Ergonomic API 💆

**Stream From a Gradio APP in 5 lines**

Use the `submit` method to get a job you can iterate over:

```python
from gradio_client import Client

client = Client("gradio/llm_stream")

for result in client.submit("What's the best UI framework in Python?"):
    print(result)
```

```ts
import { Client } from "@gradio/client";

const client = await Client.connect("gradio/llm_stream")
const job = client.submit("/predict", {"text": "What's the best UI framework in Python?"})

for await (const msg of job) console.log(msg.data)
```

**Use the same keyword arguments as the app**


```python
from gradio_client import Client

client = Client("http://127.0.0.1:7860/")
result = client.predict(
		message="Hello!!",
		system_prompt="You are helpful AI.",
		tokens=10,
		api_name="/chat"
)
print(result)
```

```ts
import { Client } from "@gradio/client";

const client = await Client.connect("http://127.0.0.1:7860/");
const result = await client.predict("/chat", { 		
		message: "Hello!!", 		
		system_prompt: "Hello!!", 		
		tokens: 10, 
});

console.log(result.data);
```

**Better Error Messages**

If something goes wrong in the upstream app, the client will raise the same exception as the app provided it's a `gr.Error` exception.

#### Transparent Design 🪟

Anything you can do in the UI, you can do with the client:
* 🔒 Authentication
* 🛑 Job Cancelling
* ℹ️ Access Queue Position and API
* 📕 View the API information

Here's an example showing how to display the queue position of a pending job:

```python
from gradio_client import Client

client = Client("gradio/diffusion_model")

job = client.submit("A cute cat")
while not job.done():
    status = job.status()
    print(f"Current in position {status.rank} out of {status.queue_size}")
```

#### Portable Design ⛺️

The client can run from pretty much any python and javascript environment (node, deno, the browser, Service Workers). 

Here's an example using the client from a Flask server using gevent:

```python
from gevent import monkey
monkey.patch_all()

from gradio_client import Client
from flask import Flask, send_file
import time

app = Flask(__name__)

imageclient = Client("gradio/diffusion_model")

@app.route("/gen")
def gen():
      result = imageclient.predict(
                "A cute cat",
                api_name="/predict"
              )
      return send_file(result)

if __name__ == "__main__":
      app.run(host="0.0.0.0", port=5000)
```

#### Migration Guide and Breaking Changes

**Python**
- The `serialize` argument of the `Client` class was removed. Has no effect.
- The `upload_files` argument of the `Client` was removed.
- All filepaths must be wrapped in the `handle_file` method. Example:
```python
from gradio_client import Client, handle_file

client = Client("gradio/image_captioner")
client.predict(handle_file("cute_cat.jpg"))
```
- The `output_dir` argument was removed. It is not specified in the `download_files` argument.


**Javascript**
The client has been redesigned entirely. It was refactored from a function into a class. An instance can now be constructed by awaiting the `connect` method.

```js
const app = await Client.connect("gradio/whisper")
```
The app variable has the same methods as the python class (`submit`, `predict`, `view_api`, `duplicate`).



#### Additional Changes

- [#8243](https://github.com/gradio-app/gradio/pull/8243) -  Set orig_name in python client file uploads.
- [#8264](https://github.com/gradio-app/gradio/pull/8264) - Make exceptions in the Client more specific.
- [#8247](https://github.com/gradio-app/gradio/pull/8247) - Fix api recorder.
- [#8276](https://github.com/gradio-app/gradio/pull/8276) - Fix bug where client could not connect to apps that had self signed certificates.
- [#8245](https://github.com/gradio-app/gradio/pull/8245) - Cancel  server progress from the python client.
- [#8200](https://github.com/gradio-app/gradio/pull/8200) -  Support custom components in gr.load
- [#8182](https://github.com/gradio-app/gradio/pull/8182) - Convert sse calls in client from async to sync.
- [#7732](https://github.com/gradio-app/gradio/pull/7732) - Adds support for kwargs and default arguments in the python client, and improves how parameter information is displayed in the "view API" page.
- [#7888](https://github.com/gradio-app/gradio/pull/7888) - Cache view_api info in server and python client.
- [#7575](https://github.com/gradio-app/gradio/pull/7575) - Files should now be supplied as `file(...)` in the Client, and some fixes to `gr.load()` as well.
- [#8401](https://github.com/gradio-app/gradio/pull/8401) - Add CDN installation to JS docs. 
- [#8299](https://github.com/gradio-app/gradio/pull/8299) - Allow JS Client to work with authenticated spaces 🍪. 
- [#8408](https://github.com/gradio-app/gradio/pull/8408) - Connect heartbeat if state created in render. Also fix config cleanup bug #8407.
- [#8258](https://github.com/gradio-app/gradio/pull/8258) - Improve URL handling in JS Client.  
- [#8322](https://github.com/gradio-app/gradio/pull/8322) - ensure the client correctly handles all binary data. 
- [#8296](https://github.com/gradio-app/gradio/pull/8296) - always create a jwt when connecting to a space if a hf_token is present.  
- [#8285](https://github.com/gradio-app/gradio/pull/8285) - use the correct query param to pass the jwt to the heartbeat event. 
- [#8272](https://github.com/gradio-app/gradio/pull/8272) - ensure client works for private spaces.  
- [#8197](https://github.com/gradio-app/gradio/pull/8197) - Add support for passing keyword args to `data` in JS client.  
- [#8252](https://github.com/gradio-app/gradio/pull/8252) - Client node fix.
- [#8209](https://github.com/gradio-app/gradio/pull/8209) - Rename `eventSource_Factory` and `fetch_implementation`. 
- [#8109](https://github.com/gradio-app/gradio/pull/8109) - Implement JS Client tests.
- [#8211](https://github.com/gradio-app/gradio/pull/8211) - remove redundant event source logic.  
- [#8179](https://github.com/gradio-app/gradio/pull/8179) - rework upload to be a class method + pass client into each component.
- [#8181](https://github.com/gradio-app/gradio/pull/8181) - Ensure connectivity to private HF spaces with SSE protocol.
- [#8169](https://github.com/gradio-app/gradio/pull/8169) - Only connect to heartbeat if needed.
- [#8118](https://github.com/gradio-app/gradio/pull/8118) - Add eventsource polyfill for Node.js and browser environments.
- [#7646](https://github.com/gradio-app/gradio/pull/7646) - Refactor JS Client.
- [#7974](https://github.com/gradio-app/gradio/pull/7974) - Fix heartbeat in the js client to be Lite compatible.
- [#7926](https://github.com/gradio-app/gradio/pull/7926) - Fixes streaming event race condition.