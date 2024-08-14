# gradio_client

## 1.3.0

### Features

- [#8968](https://github.com/gradio-app/gradio/pull/8968) [`38b3682`](https://github.com/gradio-app/gradio/commit/38b3682c3a9b40fb4070f665d94711c43c6fe40e) - Improvements to FRP client download and usage.  Thanks @abidlabs!
- [#9059](https://github.com/gradio-app/gradio/pull/9059) [`981731a`](https://github.com/gradio-app/gradio/commit/981731acb7da3e78555abeb20f47f3a8a5f0d861) - Fix flaky tests and tests on Windows.  Thanks @abidlabs!

## 1.2.0

### Features

- [#8862](https://github.com/gradio-app/gradio/pull/8862) [`ac132e3`](https://github.com/gradio-app/gradio/commit/ac132e3cbc8dbc7bec3d607d52bef347e90feb41) - Support the use of custom authentication mechanism, timeouts, and other `httpx` parameters in Python Client.  Thanks @valgai!
- [#8948](https://github.com/gradio-app/gradio/pull/8948) [`f7fbd2c`](https://github.com/gradio-app/gradio/commit/f7fbd2c23795d97071296463779d41bd0e937164) - Bump websockets version max for gradio-client.  Thanks @evanscho!

## 1.1.1

### Features

- [#8757](https://github.com/gradio-app/gradio/pull/8757) [`6073736`](https://github.com/gradio-app/gradio/commit/60737366517f48d1a37ffce15425783a2887f305) - Document `FileData` class in docs.  Thanks @hannahblair!

## 1.1.0

### Fixes

- [#8505](https://github.com/gradio-app/gradio/pull/8505) [`2943d6d`](https://github.com/gradio-app/gradio/commit/2943d6d68847314885dc6c5c0247083116017ca0) - Add Timer component.  Thanks @aliabid94!

## 1.0.2

### Features

- [#8516](https://github.com/gradio-app/gradio/pull/8516) [`de6aa2b`](https://github.com/gradio-app/gradio/commit/de6aa2b67668605b65ad92842b2c798afa2c6d8a) - Add helper classes to docs.  Thanks @aliabd!

## 1.0.1

### Features

- [#8481](https://github.com/gradio-app/gradio/pull/8481) [`41a4493`](https://github.com/gradio-app/gradio/commit/41a449383a34b7d6e4c83cfbf61c222fd5501206) - fix client flaky tests.  Thanks @abidlabs!

## 1.0.0

### Highlights

#### Clients 1.0 Launch!  ([#8468](https://github.com/gradio-app/gradio/pull/8468) [`7cc0a0c`](https://github.com/gradio-app/gradio/commit/7cc0a0c1abea585c3f50ffb1ff78d2b08ddbdd92))

We're excited to unveil the first major release of the Gradio clients.
We've made it even easier to turn any Gradio application into a production endpoint thanks to the clients' **ergonomic**, **transparent**, and **portable** design.

#### Ergonomic API 💆

**Stream From a Gradio app in 5 lines**

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

If something goes wrong in the upstream app, the client will raise the same exception as the app provided that `show_error=True` in the original app's `launch()` function, or it's a `gr.Error` exception.

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

#### 1.0 Migration Guide and Breaking Changes

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

 Thanks @freddyaboulton!

### Features

- [#8444](https://github.com/gradio-app/gradio/pull/8444) [`2cd02ff`](https://github.com/gradio-app/gradio/commit/2cd02ff3b7c57cd69635d111ff25643eba30b9b0) - Remove deprecated parameters from Python Client.  Thanks @abidlabs!

## 0.17.0

### Features

- [#8243](https://github.com/gradio-app/gradio/pull/8243) [`55f664f`](https://github.com/gradio-app/gradio/commit/55f664f2979a49acc29a73cde16c6ebdfcc91db2) - Add event listener support to render blocks.  Thanks @aliabid94!
- [#8409](https://github.com/gradio-app/gradio/pull/8409) [`8028c33`](https://github.com/gradio-app/gradio/commit/8028c33bbc5a324a5e9e8b28906443db28683d79) - Render decorator documentation.  Thanks @aliabid94!

### Fixes

- [#8371](https://github.com/gradio-app/gradio/pull/8371) [`a373b0e`](https://github.com/gradio-app/gradio/commit/a373b0edd36613a9a6a25a1a2893edd6533a7291) - Set orig_name in python client file uploads.  Thanks @freddyaboulton!

## 0.16.4

### Fixes

- [#8247](https://github.com/gradio-app/gradio/pull/8247) [`8f46556`](https://github.com/gradio-app/gradio/commit/8f46556b38e35cffbadac74ff80445dceea3bcf5) - Fix api recorder.  Thanks @abidlabs!

## 0.16.3

### Features

- [#8264](https://github.com/gradio-app/gradio/pull/8264) [`a9e1a8a`](https://github.com/gradio-app/gradio/commit/a9e1a8ac5633c5336fea1c63d7f66a9883e7e6e1) - Make exceptions in the Client more specific.  Thanks @abidlabs!

### Fixes

- [#8276](https://github.com/gradio-app/gradio/pull/8276) [`0bf3d1a`](https://github.com/gradio-app/gradio/commit/0bf3d1a992db2753c1a55452b569027190f26ef6) - Fix bug where client could not connect to apps that had self signed certificates.  Thanks @freddyaboulton!

## 0.16.2

### Fixes

- [#8245](https://github.com/gradio-app/gradio/pull/8245) [`c562a3d`](https://github.com/gradio-app/gradio/commit/c562a3d9a440c8f94ca070bd07b8d4121d6ab7b3) - Cancel  server progress from the python client.  Thanks @freddyaboulton!

## 0.16.1

### Highlights

#### Support custom components in gr.load ([#8200](https://github.com/gradio-app/gradio/pull/8200) [`72039be`](https://github.com/gradio-app/gradio/commit/72039be93acda856d92ceac7f21f1ec1a054fae2))

It is now possible to load a demo with a custom component with `gr.load`.

The custom component must be installed in your system and imported in your python session.

```python
import gradio as gr
import gradio_pdf

demo = gr.load("freddyaboulton/gradiopdf", src="spaces")

if __name__ == "__main__":
    demo.launch()
```

<img width="1284" alt="image" src="https://github.com/gradio-app/gradio/assets/41651716/9c3e846b-f3f2-4c1c-8cb6-53a6d186aaa0">

 Thanks @freddyaboulton!

### Fixes

- [#8182](https://github.com/gradio-app/gradio/pull/8182) [`39791eb`](https://github.com/gradio-app/gradio/commit/39791eb186d3a4ce82c8c27979a28311c37a4067) - Convert sse calls in client from async to sync.  Thanks @abidlabs!

## 0.16.0

### Highlights

#### Setting File Upload Limits ([#7909](https://github.com/gradio-app/gradio/pull/7909) [`2afca65`](https://github.com/gradio-app/gradio/commit/2afca6541912b37dc84f447c7ad4af21607d7c72))

We have added a `max_file_size` size parameter to `launch()` that limits to size of files uploaded to the server. This limit applies to each individual file. This parameter can be specified as a string or an integer (corresponding to the size in bytes).

The following code snippet sets a max file size of 5 megabytes.

```python
import gradio as gr

demo = gr.Interface(lambda x: x, "image", "image")

demo.launch(max_file_size="5mb")
# or
demo.launch(max_file_size=5 * gr.FileSize.MB)
```

![max_file_size_upload](https://github.com/gradio-app/gradio/assets/41651716/7547330c-a082-4901-a291-3f150a197e45)


#### Error states can now be cleared

When a component encounters an error, the error state shown in the UI can now be cleared by clicking on the `x` icon in the top right of the component. This applies to all types of errors, whether it's raised in the UI or the server.

![error_modal_calculator](https://github.com/gradio-app/gradio/assets/41651716/16cb071c-accd-45a6-9c18-0dea27d4bd98)

 Thanks @freddyaboulton!

### Features

- [#8100](https://github.com/gradio-app/gradio/pull/8100) [`cbdfbdf`](https://github.com/gradio-app/gradio/commit/cbdfbdfc973fa67665911fb5d8cb005a025b0e58) - upgrade `ruff` test dependency to `ruff==0.4.1`.  Thanks @abidlabs!

## 0.15.1

### Features

- [#7850](https://github.com/gradio-app/gradio/pull/7850) [`2bae1cf`](https://github.com/gradio-app/gradio/commit/2bae1cfbd41ed8ae3eea031a64899611a22a1821) - Adds an "API Recorder" to the view API page, some internal methods have been made async.  Thanks @abidlabs!

## 0.15.0

### Highlights

#### Automatically delete state after user has disconnected from the webpage ([#7829](https://github.com/gradio-app/gradio/pull/7829) [`6a4bf7a`](https://github.com/gradio-app/gradio/commit/6a4bf7abe29059dbdc6a342e0366fdaa2e4120ee))

Gradio now automatically deletes `gr.State` variables stored in the server's RAM when users close their browser tab.
The deletion will happen 60 minutes after the server detected a disconnect from the user's browser.
If the user connects again in that timeframe, their state will not be deleted.

Additionally, Gradio now includes a `Blocks.unload()` event, allowing you to run arbitrary cleanup functions when users disconnect (this does not have a 60 minute delay).
You can think of the `unload` event as the opposite of the `load` event.


```python
with gr.Blocks() as demo:
    gr.Markdown(
"""# State Cleanup Demo
🖼️ Images are saved in a user-specific directory and deleted when the users closes the page via demo.unload.
""")
    with gr.Row():
        with gr.Column(scale=1):
            with gr.Row():
                img = gr.Image(label="Generated Image", height=300, width=300)
            with gr.Row():
                gen = gr.Button(value="Generate")
            with gr.Row():
                history = gr.Gallery(label="Previous Generations", height=500, columns=10)
                state = gr.State(value=[], delete_callback=lambda v: print("STATE DELETED"))

    demo.load(generate_random_img, [state], [img, state, history]) 
    gen.click(generate_random_img, [state], [img, state, history])
    demo.unload(delete_directory)


demo.launch(auth=lambda user,pwd: True,
            auth_message="Enter any username and password to continue")
```

 Thanks @freddyaboulton!

### Fixes

- [#7888](https://github.com/gradio-app/gradio/pull/7888) [`946487c`](https://github.com/gradio-app/gradio/commit/946487cf8e477cbf8d6fad4e772ff574a21782c3) - Cache view_api info in server and python client.  Thanks @freddyaboulton!

## 0.14.0

### Features

- [#7800](https://github.com/gradio-app/gradio/pull/7800) [`b0a3ea9`](https://github.com/gradio-app/gradio/commit/b0a3ea951c06d4f3ff2755b567629fe988a3e30d) - Small fix to client.view_api() in the case of default file values.  Thanks @abidlabs!
- [#7732](https://github.com/gradio-app/gradio/pull/7732) [`2efb05e`](https://github.com/gradio-app/gradio/commit/2efb05ed99a8a3575aab0a6c14a8d8b91f4e9ed7) - Adds support for kwargs and default arguments in the python client, and improves how parameter information is displayed in the "view API" page.  Thanks @abidlabs!

## 0.13.0

### Features

- [#7691](https://github.com/gradio-app/gradio/pull/7691) [`84f81fe`](https://github.com/gradio-app/gradio/commit/84f81fec9287b041203a141bbf2852720f7d199c) - Closing stream from the backend.  Thanks @aliabid94!

### Fixes

- [#7718](https://github.com/gradio-app/gradio/pull/7718) [`6390d0b`](https://github.com/gradio-app/gradio/commit/6390d0bf6c2be0aefa56102dd029f25161bfebc3) - Add support for python client connecting to gradio apps running with self-signed SSL certificates.  Thanks @abidlabs!
- [#7706](https://github.com/gradio-app/gradio/pull/7706) [`bc61ff6`](https://github.com/gradio-app/gradio/commit/bc61ff6b1603eedf3111f1b5c3d2751629902d98) - Several fixes to `gr.load`.  Thanks @abidlabs!

## 0.12.0

### Fixes

- [#7575](https://github.com/gradio-app/gradio/pull/7575) [`d0688b3`](https://github.com/gradio-app/gradio/commit/d0688b3c25feabb4fc7dfa0ab86086b3af7eb337) - Files should now be supplied as `file(...)` in the Client, and some fixes to `gr.load()` as well.  Thanks @abidlabs!
- [#7618](https://github.com/gradio-app/gradio/pull/7618) [`0ae1e44`](https://github.com/gradio-app/gradio/commit/0ae1e4486c06e06bb7a4bad45d58d14f1f8d1b94) - Control which files get moved to cache with gr.set_static_paths.  Thanks @freddyaboulton!

## 0.11.0

### Features

- [#7407](https://github.com/gradio-app/gradio/pull/7407) [`375bfd2`](https://github.com/gradio-app/gradio/commit/375bfd28d2def576b4e1c12e0a60127b7419e826) - Fix server_messages.py to use the patched BaseModel class for Wasm env.  Thanks [@aliabid94](https://github.com/aliabid94)!

### Fixes

- [#7555](https://github.com/gradio-app/gradio/pull/7555) [`fc4c2db`](https://github.com/gradio-app/gradio/commit/fc4c2dbd994c49e37296978da1cb85e424080d1c) - Allow Python Client to upload/download files when connecting to Gradio apps with auth enabled.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.10.1

### Features

- [#7495](https://github.com/gradio-app/gradio/pull/7495) [`ddd4d3e`](https://github.com/gradio-app/gradio/commit/ddd4d3e4d3883fb7540d1df240fb08202fc77705) - Enable Ruff S101.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7443](https://github.com/gradio-app/gradio/pull/7443) [`b7a97f2`](https://github.com/gradio-app/gradio/commit/b7a97f29b84a72678a717db03d2932ed6caae6ce) - Update `httpx` to `httpx>=0.24.1` in `requirements.txt`.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.10.0

### Features

- [#7183](https://github.com/gradio-app/gradio/pull/7183) [`49d9c48`](https://github.com/gradio-app/gradio/commit/49d9c48537aa706bf72628e3640389470138bdc6) - [WIP] Refactor file normalization to be in the backend and remove it from the frontend of each component.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7377](https://github.com/gradio-app/gradio/pull/7377) [`6dfd40f`](https://github.com/gradio-app/gradio/commit/6dfd40fc6b2fa461490d2370ab91fcda7e07c0da) - Make set_documentation_group a no-op.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7334](https://github.com/gradio-app/gradio/pull/7334) [`b95d0d0`](https://github.com/gradio-app/gradio/commit/b95d0d043c739926af986e573200af92732bbc01) - Allow setting custom headers in Python Client.  Thanks [@abidlabs](https://github.com/abidlabs)!

### Fixes

- [#7350](https://github.com/gradio-app/gradio/pull/7350) [`7302a6e`](https://github.com/gradio-app/gradio/commit/7302a6e151dac553c17833be64d4639ee4cf97aa) - Fix `gr.load` for file-based Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.9.0

### Features

- [#7062](https://github.com/gradio-app/gradio/pull/7062) [`0fddd0f`](https://github.com/gradio-app/gradio/commit/0fddd0f971761bff3ef6ccc7ab9deb1891cd80d0) - Determine documentation group automatically.  Thanks [@akx](https://github.com/akx)!
- [#7102](https://github.com/gradio-app/gradio/pull/7102) [`68a54a7`](https://github.com/gradio-app/gradio/commit/68a54a7a310d8d7072fdae930bf1cfdf12c45a7f) - Improve chatbot streaming performance with diffs.  Thanks [@aliabid94](https://github.com/aliabid94)!/n  Note that this PR changes the API format for generator functions, which would be a breaking change for any clients reading the EventStream directly
- [#7116](https://github.com/gradio-app/gradio/pull/7116) [`3c8c4ac`](https://github.com/gradio-app/gradio/commit/3c8c4ac2db284e1cb503c397205a79a6dcc27e23) - Document the `gr.ParamViewer` component, and fix component preprocessing/postprocessing docstrings.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7061](https://github.com/gradio-app/gradio/pull/7061) [`05d8a3c`](https://github.com/gradio-app/gradio/commit/05d8a3c8030b733bd47250f5db6f89f230f9a707) - Update ruff to 0.1.13, enable more rules, fix issues.  Thanks [@akx](https://github.com/akx)!

### Fixes

- [#7178](https://github.com/gradio-app/gradio/pull/7178) [`9f23b0b`](https://github.com/gradio-app/gradio/commit/9f23b0bc54b4ef63c056b309370df52ec2c2a43c) - Optimize client view_api method.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7322](https://github.com/gradio-app/gradio/pull/7322) [`b25e95e`](https://github.com/gradio-app/gradio/commit/b25e95e164e80d66203ef71ce6bdb67ceb6b24df) - Fix `processing_utils.save_url_to_cache()` to follow redirects when accessing the URL.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.8.1

### Features

- [#7075](https://github.com/gradio-app/gradio/pull/7075) [`1fc8a94`](https://github.com/gradio-app/gradio/commit/1fc8a941384775f587a6ef30365960f43353cb0d) - fix lint.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#7054](https://github.com/gradio-app/gradio/pull/7054) [`64c65d8`](https://github.com/gradio-app/gradio/commit/64c65d821983961111297a969946d87e2fc4105d) - Add encoding to open/writing files on the deploy_discord function.  Thanks [@WilliamHarer](https://github.com/WilliamHarer)!

## 0.8.0

### Fixes

- [#6846](https://github.com/gradio-app/gradio/pull/6846) [`48d6534`](https://github.com/gradio-app/gradio/commit/48d6534b40f80e7e70a4061f97d9f2e23ba77fe1) - Add `show_api` parameter to events, and fix `gr.load()`. Also makes some minor improvements to the "view API" page when running on Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6767](https://github.com/gradio-app/gradio/pull/6767) [`7bb561a`](https://github.com/gradio-app/gradio/commit/7bb561a294ca41d1044927cb34d8645c4175cae0) - Rewriting parts of the README and getting started guides for 4.0.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.7.3

### Fixes

- [#6693](https://github.com/gradio-app/gradio/pull/6693) [`34f9431`](https://github.com/gradio-app/gradio/commit/34f943101bf7dd6b8a8974a6131c1ed7c4a0dac0) - Python client properly handles hearbeat and log messages. Also handles responses longer than 65k.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.7.2

### Features

- [#6598](https://github.com/gradio-app/gradio/pull/6598) [`7cbf96e`](https://github.com/gradio-app/gradio/commit/7cbf96e0bdd12db7ecac7bf99694df0a912e5864) - Issue 5245: consolidate usage of requests and httpx.  Thanks [@cswamy](https://github.com/cswamy)!
- [#6704](https://github.com/gradio-app/gradio/pull/6704) [`24e0481`](https://github.com/gradio-app/gradio/commit/24e048196e8f7bd309ef5c597d4ffc6ca4ed55d0) - Hotfix: update `huggingface_hub` dependency version.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#6543](https://github.com/gradio-app/gradio/pull/6543) [`8a70e83`](https://github.com/gradio-app/gradio/commit/8a70e83db9c7751b46058cdd2514e6bddeef6210) - switch from black to ruff formatter.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!

### Fixes

- [#6556](https://github.com/gradio-app/gradio/pull/6556) [`d76bcaa`](https://github.com/gradio-app/gradio/commit/d76bcaaaf0734aaf49a680f94ea9d4d22a602e70) - Fix api event drops.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.7.1

### Fixes

- [#6602](https://github.com/gradio-app/gradio/pull/6602) [`b8034a1`](https://github.com/gradio-app/gradio/commit/b8034a1e72c3aac649ee0ad9178ffdbaaa60fc61) - Fix: Gradio Client work with private Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.7.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Add json schema unit tests.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Swap websockets for SSE.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.7.0-beta.2

### Features

- [#6094](https://github.com/gradio-app/gradio/pull/6094) [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6069](https://github.com/gradio-app/gradio/pull/6069) [`bf127e124`](https://github.com/gradio-app/gradio/commit/bf127e1241a41401e144874ea468dff8474eb505) - Swap websockets for SSE.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.7.0-beta.1

### Features

- [#6082](https://github.com/gradio-app/gradio/pull/6082) [`037e5af33`](https://github.com/gradio-app/gradio/commit/037e5af3363c5b321b95efc955ee8d6ec0f4504e) - WIP: Fix docs.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#5970](https://github.com/gradio-app/gradio/pull/5970) [`0c571c044`](https://github.com/gradio-app/gradio/commit/0c571c044035989d6fe33fc01fee63d1780635cb) - Add json schema unit tests.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6073](https://github.com/gradio-app/gradio/pull/6073) [`abff6fb75`](https://github.com/gradio-app/gradio/commit/abff6fb758bd310053a23c938bf1dd8fbdc5d333) - Fix remaining xfail tests in backend.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.7.0-beta.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Simplify how files are handled in components in 4.0.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`85ba6de13`](https://github.com/gradio-app/gradio/commit/85ba6de136a45b3e92c74e410bb27e3cbe7138d7) - Rename gradio_component to gradio component.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.6.1

### Fixes

- [#5811](https://github.com/gradio-app/gradio/pull/5811) [`1d5b15a2d`](https://github.com/gradio-app/gradio/commit/1d5b15a2d24387154f2cfb40a36de25b331471d3) - Assert refactor in external.py.  Thanks [@harry-urek](https://github.com/harry-urek)!

## 0.6.0

### Highlights

#### new `FileExplorer` component ([#5672](https://github.com/gradio-app/gradio/pull/5672) [`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e))

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function. 

Users can then navigate the virtual filesystem and select files which will be accessible in your predict function. This component will allow developers to build more complex spaces, with more flexible input options.

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).

 Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.5.3

### Features

- [#5721](https://github.com/gradio-app/gradio/pull/5721) [`84e03fe50`](https://github.com/gradio-app/gradio/commit/84e03fe506e08f1f81bac6d504c9fba7924f2d93) - Adds copy buttons to website, and better descriptions to API Docs.  Thanks [@aliabd](https://github.com/aliabd)!

## 0.5.2

### Features

- [#5653](https://github.com/gradio-app/gradio/pull/5653) [`ea0e00b20`](https://github.com/gradio-app/gradio/commit/ea0e00b207b4b90a10e9d054c4202d4e705a29ba) - Prevent Clients from accessing API endpoints that set `api_name=False`.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.5.1

### Features

- [#5514](https://github.com/gradio-app/gradio/pull/5514) [`52f783175`](https://github.com/gradio-app/gradio/commit/52f7831751b432411e109bd41add4ab286023a8e) - refactor: Use package.json for version management.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!

## 0.5.0

### Highlights

#### Enable streaming audio in python client ([#5248](https://github.com/gradio-app/gradio/pull/5248) [`390624d8`](https://github.com/gradio-app/gradio/commit/390624d8ad2b1308a5bf8384435fd0db98d8e29e))

The `gradio_client` now supports streaming file outputs 🌊

No new syntax! Connect to a gradio demo that supports streaming file outputs and call `predict` or `submit` as you normally would.

```python
import gradio_client as grc
client = grc.Client("gradio/stream_audio_out")

# Get the entire generated audio as a local file
client.predict("/Users/freddy/Pictures/bark_demo.mp4", api_name="/predict")

job = client.submit("/Users/freddy/Pictures/bark_demo.mp4", api_name="/predict")

# Get the entire generated audio as a local file
job.result()

# Each individual chunk
job.outputs()
```

 Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#5295](https://github.com/gradio-app/gradio/pull/5295) [`7b8fa8aa`](https://github.com/gradio-app/gradio/commit/7b8fa8aa58f95f5046b9add64b40368bd3f1b700) - Allow caching examples with streamed output.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.4.0

### Highlights

#### Client.predict will now return the final output for streaming endpoints ([#5057](https://github.com/gradio-app/gradio/pull/5057) [`35856f8b`](https://github.com/gradio-app/gradio/commit/35856f8b54548cae7bd3b8d6a4de69e1748283b2))

### This is a breaking change (for gradio_client only)!

Previously, `Client.predict` would only return the first output of an endpoint that streamed results. This was causing confusion for developers that wanted to call these streaming demos via the client.

We realize that developers using the client don't know the internals of whether a demo streams or not, so we're changing the behavior of predict to match developer expectations.

Using `Client.predict` will now return the final output of a streaming endpoint. This will make it even easier to use gradio apps via the client.

 Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Features

- [#5076](https://github.com/gradio-app/gradio/pull/5076) [`2745075a`](https://github.com/gradio-app/gradio/commit/2745075a26f80e0e16863d483401ff1b6c5ada7a) - Add deploy_discord to docs. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#5061](https://github.com/gradio-app/gradio/pull/5061) [`136adc9c`](https://github.com/gradio-app/gradio/commit/136adc9ccb23e5cb4d02d2e88f23f0b850041f98) - Ensure `gradio_client` is backwards compatible with `gradio==3.24.1`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.3.0

### Highlights

#### Create Discord Bots from Gradio Apps 🤖 ([#4960](https://github.com/gradio-app/gradio/pull/4960) [`46e4ef67`](https://github.com/gradio-app/gradio/commit/46e4ef67d287dd68a91473b73172b29cbad064bc))

We're excited to announce that Gradio can now automatically create a discord bot from any `gr.ChatInterface` app.

It's as easy as importing `gradio_client`, connecting to the app, and calling `deploy_discord`!

_🦙 Turning Llama 2 70b into a discord bot 🦙_

```python
import gradio_client as grc
grc.Client("ysharma/Explore_llamav2_with_TGI").deploy_discord(to_id="llama2-70b-discord-bot")
```

<img src="https://gradio-builds.s3.amazonaws.com/demo-files/discordbots/guide/llama_chat.gif">

#### Getting started with template spaces

To help get you started, we have created an organization on Hugging Face called [gradio-discord-bots](https://huggingface.co/gradio-discord-bots) with template spaces you can use to turn state of the art LLMs powered by Gradio to discord bots.

Currently we have template spaces for:

- [Llama-2-70b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-70b-chat-hf) powered by a FREE Hugging Face Inference Endpoint!
- [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/Llama-2-13b-chat-hf) powered by Hugging Face Inference Endpoints.
- [Llama-2-13b-chat-hf](https://huggingface.co/spaces/gradio-discord-bots/llama-2-13b-chat-transformers) powered by Hugging Face transformers.
- [falcon-7b-instruct](https://huggingface.co/spaces/gradio-discord-bots/falcon-7b-instruct) powered by Hugging Face Inference Endpoints.
- [gpt-3.5-turbo](https://huggingface.co/spaces/gradio-discord-bots/gpt-35-turbo), powered by openai. Requires an OpenAI key.

But once again, you can deploy ANY `gr.ChatInterface` app exposed on the internet! So don't hesitate to try it on your own Chatbots.

❗️ Additional Note ❗️: Technically, any gradio app that exposes an api route that takes in a single string and outputs a single string can be deployed to discord. But `gr.ChatInterface` apps naturally lend themselves to discord's chat functionality so we suggest you start with those.

Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### New Features:

- Endpoints that return layout components are now properly handled in the `submit` and `view_api` methods. Output layout components are not returned by the API but all other components are (excluding `gr.State`). By [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4871](https://github.com/gradio-app/gradio/pull/4871)

### Bug Fixes:

No changes to highlight

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

# 0.2.9

### New Features:

No changes to highlight

### Bug Fixes:

- Fix bug determining the api name when a demo has `api_name=False` by [@freddyboulton](https://github.com/freddyaboulton) in [PR 4886](https://github.com/gradio-app/gradio/pull/4886)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

- Pinned dependencies to major versions to reduce the likelihood of a broken `gradio_client` due to changes in downstream dependencies by [@abidlabs](https://github.com/abidlabs) in [PR 4885](https://github.com/gradio-app/gradio/pull/4885)

# 0.2.8

### New Features:

- Support loading gradio apps where `api_name=False` by [@abidlabs](https://github.com/abidlabs) in [PR 4683](https://github.com/gradio-app/gradio/pull/4683)

### Bug Fixes:

- Fix bug where space duplication would error if the demo has cpu-basic hardware by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4583](https://github.com/gradio-app/gradio/pull/4583)
- Fixes and optimizations to URL/download functions by [@akx](https://github.com/akx) in [PR 4695](https://github.com/gradio-app/gradio/pull/4695)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

# 0.2.7

### New Features:

- The output directory for files downloaded via the Client can now be set by the `output_dir` parameter in `Client` by [@abidlabs](https://github.com/abidlabs) in [PR 4501](https://github.com/gradio-app/gradio/pull/4501)

### Bug Fixes:

- The output directory for files downloaded via the Client are now set to a temporary directory by default (instead of the working directory in some cases) by [@abidlabs](https://github.com/abidlabs) in [PR 4501](https://github.com/gradio-app/gradio/pull/4501)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

# 0.2.6

### New Features:

No changes to highlight.

### Bug Fixes:

- Fixed bug file deserialization didn't preserve all file extensions by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4440](https://github.com/gradio-app/gradio/pull/4440)
- Fixed bug where mounted apps could not be called via the client by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4435](https://github.com/gradio-app/gradio/pull/4435)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

# 0.2.5

### New Features:

No changes to highlight.

### Bug Fixes:

- Fixes parameter names not showing underscores by [@abidlabs](https://github.com/abidlabs) in [PR 4230](https://github.com/gradio-app/gradio/pull/4230)
- Fixes issue in which state was not handled correctly if `serialize=False` by [@abidlabs](https://github.com/abidlabs) in [PR 4230](https://github.com/gradio-app/gradio/pull/4230)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

# 0.2.4

### Bug Fixes:

- Fixes missing serialization classes for several components: `Barplot`, `Lineplot`, `Scatterplot`, `AnnotatedImage`, `Interpretation` by [@abidlabs](https://github.com/abidlabs) in [PR 4167](https://github.com/gradio-app/gradio/pull/4167)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

# 0.2.3

### New Features:

No changes to highlight.

### Bug Fixes:

- Fix example inputs for `gr.File(file_count='multiple')` output components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4153](https://github.com/gradio-app/gradio/pull/4153)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

# 0.2.2

### New Features:

No changes to highlight.

### Bug Fixes:

- Only send request to `/info` route if demo version is above `3.28.3` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4109](https://github.com/gradio-app/gradio/pull/4109)

### Other Changes:

- Fix bug in test from gradio 3.29.0 refactor by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4138](https://github.com/gradio-app/gradio/pull/4138)

### Breaking Changes:

No changes to highlight.

# 0.2.1

### New Features:

No changes to highlight.

### Bug Fixes:

Removes extraneous `State` component info from the `Client.view_api()` method by [@abidlabs](https://github.com/freddyaboulton) in [PR 4107](https://github.com/gradio-app/gradio/pull/4107)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

Separates flaky tests from non-flaky tests by [@abidlabs](https://github.com/freddyaboulton) in [PR 4107](https://github.com/gradio-app/gradio/pull/4107)

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

# 0.1.4

### New Features:

- Progress Updates from `gr.Progress()` can be accessed via `job.status().progress_data` by @freddyaboulton](https://github.com/freddyaboulton) in [PR 3924](https://github.com/gradio-app/gradio/pull/3924)

### Bug Fixes:

- Fixed bug where unnamed routes where displayed with `api_name` instead of `fn_index` in `view_api` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3972](https://github.com/gradio-app/gradio/pull/3972)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

# 0.1.3

### New Features:

No changes to highlight.

### Bug Fixes:

- Fixed bug where `Video` components in latest gradio were not able to be deserialized by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3860](https://github.com/gradio-app/gradio/pull/3860)

### Documentation Changes:

No changes to highlight.

### Testing and Infrastructure Changes:

No changes to highlight.

### Breaking Changes:

No changes to highlight.

### Full Changelog:

No changes to highlight.

### Contributors Shoutout:

No changes to highlight.

# 0.1.2

First public release of the Gradio Client library! The `gradio_client` Python library that makes it very easy to use any Gradio app as an API.

As an example, consider this [Hugging Face Space that transcribes audio files](https://huggingface.co/spaces/abidlabs/whisper) that are recorded from the microphone.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/whisper-screenshot.jpg)

Using the `gradio_client` library, we can easily use the Gradio as an API to transcribe audio files programmatically.

Here's the entire code to do it:

```python
from gradio_client import Client

client = Client("abidlabs/whisper")
client.predict("audio_sample.wav")

>> "This is a test of the whisper speech recognition model."
```

Read more about how to use the `gradio_client` library here: https://gradio.app/getting-started-with-the-python-client/