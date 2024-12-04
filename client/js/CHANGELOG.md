# @gradio/client

## 1.8.0

### Features

- [#9930](https://github.com/gradio-app/gradio/pull/9930) [`eae345e`](https://github.com/gradio-app/gradio/commit/eae345e5fde39aea220b57c6a954cd7d72ff32d5) - Allow settings custom headers in js client.  Thanks @elgiano!
- [#9950](https://github.com/gradio-app/gradio/pull/9950) [`fc06fe4`](https://github.com/gradio-app/gradio/commit/fc06fe41f015678a0545f4e5c99f6ae2704f0031) - Add ability to read and write from LocalStorage.  Thanks @abidlabs!

## 1.7.1

### Fixes

- [#9814](https://github.com/gradio-app/gradio/pull/9814) [`6505d42`](https://github.com/gradio-app/gradio/commit/6505d4289a3e3d27d9133b1c8af41697fdc1476d) - support gradio apps on spaces served on subpaths.  Thanks @pngwn!

## 1.7.0

### Features

- [#9681](https://github.com/gradio-app/gradio/pull/9681) [`2ed2361`](https://github.com/gradio-app/gradio/commit/2ed236187a9aab18e17fc4a8079eddef7dd195a5) - Allow setting title in gr.Info/Warning/Error.  Thanks @ABucket!

## 1.6.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Disable liking user message in chatbot by default but make it configurable
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Open audio/image input stream only when queue is ready
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Send Streaming data over Websocket if possible. Also support base64 output format for images.
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Streaming inputs for 5.0
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - fix SSR apps on spaces
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ssr part 2
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - prefix api routes

### Fixes


- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Trigger state change event on iterators

## 1.6.0-beta.4

### Features

- [#9483](https://github.com/gradio-app/gradio/pull/9483) [`8dc7c12`](https://github.com/gradio-app/gradio/commit/8dc7c12389311b60efcde1b9d3e3668a34d2dc00) - Send Streaming data over Websocket if possible. Also support base64 output format for images.  Thanks @freddyaboulton!

## 1.6.0-beta.3

### Features

- [#9412](https://github.com/gradio-app/gradio/pull/9412) [`c2c2fd9`](https://github.com/gradio-app/gradio/commit/c2c2fd989348f826566773c07c0e0bda200199ff) - fix SSR apps on spaces.  Thanks @pngwn!

## 1.6.0-beta.2

### Features

- [#9323](https://github.com/gradio-app/gradio/pull/9323) [`06babda`](https://github.com/gradio-app/gradio/commit/06babda0395fd3fbd323c1c3cb33704ecfd6deb0) - Disable liking user message in chatbot by default but make it configurable.  Thanks @freddyaboulton!
- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!

### Fixes

- [#9299](https://github.com/gradio-app/gradio/pull/9299) [`aa35b07`](https://github.com/gradio-app/gradio/commit/aa35b0788e613fdd45446d267513e6f94fa208ea) - Trigger state change event on iterators.  Thanks @freddyaboulton!

## 1.6.0-beta.1

### Features

- [#9200](https://github.com/gradio-app/gradio/pull/9200) [`2e179d3`](https://github.com/gradio-app/gradio/commit/2e179d35be6ed60a5a6bfc7303178d63e41781ad) - prefix api routes.  Thanks @pngwn!

## 1.6.0-beta.0

### Features

- [#9149](https://github.com/gradio-app/gradio/pull/9149) [`3d7a9b8`](https://github.com/gradio-app/gradio/commit/3d7a9b81f6fef06187eca832471dc1692eb493a0) - Open audio/image input stream only when queue is ready.  Thanks @freddyaboulton!
- [#8941](https://github.com/gradio-app/gradio/pull/8941) [`97a7bf6`](https://github.com/gradio-app/gradio/commit/97a7bf66a79179d1b91a3199d68e5c11216ca500) - Streaming inputs for 5.0.  Thanks @freddyaboulton!

## 1.5.2

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

## 1.5.1

### Features

- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!

## 1.5.0

### Features

- [#8965](https://github.com/gradio-app/gradio/pull/8965) [`d30432e`](https://github.com/gradio-app/gradio/commit/d30432e9c6d4cc1e5cfd989a1a3ae4aba7e21290) - harden CI.  Thanks @pngwn!

### Fixes

- [#8847](https://github.com/gradio-app/gradio/pull/8847) [`4d8a473`](https://github.com/gradio-app/gradio/commit/4d8a473632e388a312aee5c705b3c1f79853441b) - fix: wrong named param check for js client.  Thanks @freddyaboulton!

## 1.4.0

### Features

- [#8816](https://github.com/gradio-app/gradio/pull/8816) [`9ee6839`](https://github.com/gradio-app/gradio/commit/9ee6839f94d23d685a800ed3a275206e0b0e48f6) - Change optionality of the `data` param in `submit` + `predict`.  Thanks @hannahblair!

### Fixes

- [#8820](https://github.com/gradio-app/gradio/pull/8820) [`5050b36`](https://github.com/gradio-app/gradio/commit/5050b36221e75a18d8a5d4f74a725e70768a4c4a) - fix: wrong named param check for js client.  Thanks @JacobLinCool!

## 1.3.0

### Fixes

- [#8699](https://github.com/gradio-app/gradio/pull/8699) [`012da05`](https://github.com/gradio-app/gradio/commit/012da05287846d94beb0ecdc28d7fbc48c4248ff) - Ensure JS client `status_callback` functionality works and improve status messages.  Thanks @hannahblair!
- [#8505](https://github.com/gradio-app/gradio/pull/8505) [`2943d6d`](https://github.com/gradio-app/gradio/commit/2943d6d68847314885dc6c5c0247083116017ca0) - Add Timer component.  Thanks @aliabid94!
- [#8715](https://github.com/gradio-app/gradio/pull/8715) [`a6b3c6c`](https://github.com/gradio-app/gradio/commit/a6b3c6ce4e1d06253860c72740024a9138e3a93a) - Ensure `@gradio/client`'s `submit` iterator releases as expected.  Thanks @pngwn!
- [#8716](https://github.com/gradio-app/gradio/pull/8716) [`e834d30`](https://github.com/gradio-app/gradio/commit/e834d302e44f7a54565129bf2c11acf4e882a59b) - ensure `@gradio/client` always returns the correct data.  Thanks @pngwn!
- [#8714](https://github.com/gradio-app/gradio/pull/8714) [`1b5b5b0`](https://github.com/gradio-app/gradio/commit/1b5b5b0b43e69ee84f3baad2aae59ffc9c4d995a) - Bind `fetch` and `stream` in JS client.  Thanks @hannahblair!
- [#8720](https://github.com/gradio-app/gradio/pull/8720) [`936c713`](https://github.com/gradio-app/gradio/commit/936c7137a99ef59efdf75bae5dd27eea2ac1f577) - Documents auth in the guides, in the view API page, and also types the Blocks.config object.  Thanks @abidlabs!

## 1.2.1

### Features

- [#8649](https://github.com/gradio-app/gradio/pull/8649) [`4b6c8b1`](https://github.com/gradio-app/gradio/commit/4b6c8b1c004cee67345a7f103ba2dc8e90b82e6c) - ensure `File` objects are handled in JS client `handle_file`.  Thanks @hannahblair!

## 1.2.0

### Features

- [#8489](https://github.com/gradio-app/gradio/pull/8489) [`c2a0d05`](https://github.com/gradio-app/gradio/commit/c2a0d056d679d90631d9ccd944dadd67e7e03b7f) - Control Display of Error, Info, Warning.  Thanks @freddyaboulton!
- [#8571](https://github.com/gradio-app/gradio/pull/8571) [`a77877f`](https://github.com/gradio-app/gradio/commit/a77877f62df7c610fcfac7b3b00e186a087c8ec6) - First time loading performance optimization.  Thanks @baojianting!
- [#8600](https://github.com/gradio-app/gradio/pull/8600) [`7289c4b`](https://github.com/gradio-app/gradio/commit/7289c4b036d8a78c48f8c9e66ba998e6730e80d2) - Add credentials: include and Cookie header to prevent 401 error.  Thanks @yinkiu602!
- [#8522](https://github.com/gradio-app/gradio/pull/8522) [`bdaa678`](https://github.com/gradio-app/gradio/commit/bdaa678d0c0a22250b41104f32e9121f98dc7437) - add handle_file docs.  Thanks @pngwn!

### Fixes

- [#8521](https://github.com/gradio-app/gradio/pull/8521) [`900cf25`](https://github.com/gradio-app/gradio/commit/900cf25256a5b0563860097d69aac28b6afbfd8b) - Ensure frontend functions work when they don't return a value.  Thanks @pngwn!
- [#8548](https://github.com/gradio-app/gradio/pull/8548) [`7fc0f51`](https://github.com/gradio-app/gradio/commit/7fc0f5149bb8d31f3d01b4151b478070499751ee) - Fix reload mode by implementing `close` on the client.  Thanks @freddyaboulton!

## 1.1.1

### Features

- [#8499](https://github.com/gradio-app/gradio/pull/8499) [`c5f6e77`](https://github.com/gradio-app/gradio/commit/c5f6e7722a197d4706419ade14276ddecf3196f8) - Cache break themes on change.  Thanks @aliabid94!

## 1.1.0

### Features

- [#8483](https://github.com/gradio-app/gradio/pull/8483) [`e2271e2`](https://github.com/gradio-app/gradio/commit/e2271e207d98074bf39b02ae3c5443b2f097627d) - documentation for @gradio/client.  Thanks @pngwn!
- [#8485](https://github.com/gradio-app/gradio/pull/8485) [`f8ebace`](https://github.com/gradio-app/gradio/commit/f8ebaceccef60a112603d290d10072ef4e938a6a) - Ensure all status are reported internally when calling `predict`.  Thanks @pngwn!

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

- [#8370](https://github.com/gradio-app/gradio/pull/8370) [`48eeea4`](https://github.com/gradio-app/gradio/commit/48eeea4eaab7e24168688e3c3fbafb30e4e78d51) - Refactor Cancelling Logic To Use /cancel.  Thanks @freddyaboulton!

### Fixes

- [#8477](https://github.com/gradio-app/gradio/pull/8477) [`d5a9604`](https://github.com/gradio-app/gradio/commit/d5a960493017a4890685af61d78ce7d3b3b12e6b) - Fix js client bundle.  Thanks @pngwn!
- [#8451](https://github.com/gradio-app/gradio/pull/8451) [`9d2d605`](https://github.com/gradio-app/gradio/commit/9d2d6051caed5c8749a26a6fa7480a5ae6e6c4f3) - Change client submit API to be an AsyncIterable and support more platforms.  Thanks @pngwn!
- [#8462](https://github.com/gradio-app/gradio/pull/8462) [`6447dfa`](https://github.com/gradio-app/gradio/commit/6447dface4d46db1c69460e8325a1928d0476a46) - Improve file handling in JS Client.  Thanks @hannahblair!
- [#8439](https://github.com/gradio-app/gradio/pull/8439) [`63d36fb`](https://github.com/gradio-app/gradio/commit/63d36fbbf4bf6dc909be9a0ffc7b6bf6621d83e8) - Handle gradio apps using `state` in the JS Client.  Thanks @hannahblair!

## 0.20.1

### Features

- [#8415](https://github.com/gradio-app/gradio/pull/8415) [`227de35`](https://github.com/gradio-app/gradio/commit/227de352982b3dcdf9384eaa28b7e9cf09afb6e8) - Fix spaces load error.  Thanks @aliabid94!

## 0.20.0

### Features

- [#8401](https://github.com/gradio-app/gradio/pull/8401) [`d078621`](https://github.com/gradio-app/gradio/commit/d078621928136c09ca902d2f37594ed887c67d2e) - Add CDN installation to JS docs.  Thanks @hannahblair!
- [#8243](https://github.com/gradio-app/gradio/pull/8243) [`55f664f`](https://github.com/gradio-app/gradio/commit/55f664f2979a49acc29a73cde16c6ebdfcc91db2) - Add event listener support to render blocks.  Thanks @aliabid94!
- [#8398](https://github.com/gradio-app/gradio/pull/8398) [`945ac83`](https://github.com/gradio-app/gradio/commit/945ac837e779b120790814ea6f6f81bd2712f5f8) - Improve rendering.  Thanks @aliabid94!
- [#8299](https://github.com/gradio-app/gradio/pull/8299) [`ab65360`](https://github.com/gradio-app/gradio/commit/ab653608045ff9462db7ad9fe63e1c60bf20e773) - Allow JS Client to work with authenticated spaces 🍪.  Thanks @hannahblair!

### Fixes

- [#8408](https://github.com/gradio-app/gradio/pull/8408) [`e86dd01`](https://github.com/gradio-app/gradio/commit/e86dd01b6e8f7bab3d3c25b84f2ad33129138af4) - Connect heartbeat if state created in render. Also fix config cleanup bug #8407.  Thanks @freddyaboulton!
- [#8258](https://github.com/gradio-app/gradio/pull/8258) [`1f8e5c4`](https://github.com/gradio-app/gradio/commit/1f8e5c44e054b943052d8f24d044696ddfd01a54) - Improve URL handling in JS Client.  Thanks @hannahblair!

## 0.19.4

### Fixes

- [#8322](https://github.com/gradio-app/gradio/pull/8322) [`47012a0`](https://github.com/gradio-app/gradio/commit/47012a0c4e3e8a80fcae620aaf08b16ceb343cde) - ensure the client correctly handles all binary data.  Thanks @Saghen!

## 0.19.3

### Features

- [#8229](https://github.com/gradio-app/gradio/pull/8229) [`7c81897`](https://github.com/gradio-app/gradio/commit/7c81897076ddcd0bb05e0e4ffec35bb9a986d330) - chore(deps): update dependency esbuild to ^0.21.0.  Thanks @renovate!

### Fixes

- [#8296](https://github.com/gradio-app/gradio/pull/8296) [`929d216`](https://github.com/gradio-app/gradio/commit/929d216d49aa05614bc83f0761cf7b1cd803d8fe) - always create a jwt when connecting to a space if a hf_token is present.  Thanks @pngwn!

## 0.19.2

### Fixes

- [#8285](https://github.com/gradio-app/gradio/pull/8285) [`7d9d8ea`](https://github.com/gradio-app/gradio/commit/7d9d8eab50d36cbecbb84c6a0f3cc1bca7215604) - use the correct query param to pass the jwt to the heartbeat event.  Thanks @pngwn!

## 0.19.1

### Fixes

- [#8272](https://github.com/gradio-app/gradio/pull/8272) [`fbf4edd`](https://github.com/gradio-app/gradio/commit/fbf4edde7c896cdf4c903463e44c31ed96111b3c) - ensure client works for private spaces.  Thanks @pngwn!

## 0.19.0

### Features

- [#8110](https://github.com/gradio-app/gradio/pull/8110) [`5436031`](https://github.com/gradio-app/gradio/commit/5436031f92c1596282eb64e1e74d555f279e9697) - Render decorator 2.  Thanks @aliabid94!
- [#8197](https://github.com/gradio-app/gradio/pull/8197) [`e09b4e8`](https://github.com/gradio-app/gradio/commit/e09b4e8216b970bc1b142a0f08e7d190b954eb35) - Add support for passing keyword args to `data` in JS client.  Thanks @hannahblair!

### Fixes

- [#8252](https://github.com/gradio-app/gradio/pull/8252) [`22df61a`](https://github.com/gradio-app/gradio/commit/22df61a26adf8023f6dd49c051979990e8d3879a) - Client node fix.  Thanks @pngwn!

## 0.18.0

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!
- [#8209](https://github.com/gradio-app/gradio/pull/8209) [`b9afe93`](https://github.com/gradio-app/gradio/commit/b9afe93915401df5bd6737c89395c2477acfa585) - Rename `eventSource_Factory` and `fetch_implementation`.  Thanks @hannahblair!
- [#8109](https://github.com/gradio-app/gradio/pull/8109) [`bed2f82`](https://github.com/gradio-app/gradio/commit/bed2f82e2297b50f7b59423a3de05af0b9910724) - Implement JS Client tests.  Thanks @hannahblair!
- [#8211](https://github.com/gradio-app/gradio/pull/8211) [`91b5cd6`](https://github.com/gradio-app/gradio/commit/91b5cd6132fb8903c92f70fce0800324836a1fc3) - remove redundant event source logic.  Thanks @hannahblair!

### Fixes

- [#8179](https://github.com/gradio-app/gradio/pull/8179) [`6a218b4`](https://github.com/gradio-app/gradio/commit/6a218b4148095aaa0c58d8c20973ba01c8764fc2) - rework upload to be a class method + pass client into each component.  Thanks @pngwn!
- [#8181](https://github.com/gradio-app/gradio/pull/8181) [`cf52ca6`](https://github.com/gradio-app/gradio/commit/cf52ca6a51320ece97f009a177792840b5fbc785) - Ensure connectivity to private HF spaces with SSE protocol.  Thanks @hannahblair!
- [#8169](https://github.com/gradio-app/gradio/pull/8169) [`3a6f1a5`](https://github.com/gradio-app/gradio/commit/3a6f1a50b263e0a733f609a08019fc4d05480e1a) - Only connect to heartbeat if needed.  Thanks @freddyaboulton!
- [#8118](https://github.com/gradio-app/gradio/pull/8118) [`7aca673`](https://github.com/gradio-app/gradio/commit/7aca673b38a087533524b2fd8dd3a03e0e4bacfe) - Add eventsource polyfill for Node.js and browser environments.  Thanks @hannahblair!

## 0.17.0

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

- [#8056](https://github.com/gradio-app/gradio/pull/8056) [`2e469a5`](https://github.com/gradio-app/gradio/commit/2e469a5f99e52a5011a010f46e47dde7bb0c7140) - Using keys to preserve values between reloads.  Thanks @aliabid94!
- [#7646](https://github.com/gradio-app/gradio/pull/7646) [`450b8cc`](https://github.com/gradio-app/gradio/commit/450b8cc898f130f15caa3742f65c17b9f7a8f398) - Refactor JS Client.  Thanks @hannahblair!
- [#8061](https://github.com/gradio-app/gradio/pull/8061) [`17e83c9`](https://github.com/gradio-app/gradio/commit/17e83c958ebb35b3e122ca486067d1bd5ce33a22) - Docs Reorg and Intro Page.  Thanks @aliabd!

### Fixes

- [#8066](https://github.com/gradio-app/gradio/pull/8066) [`624f9b9`](https://github.com/gradio-app/gradio/commit/624f9b9477f74a581a6c14119234f9efdfcda398) - make gradio dev tools a local dependency rather than bundling.  Thanks @pngwn!

## 0.16.0

### Features

- [#7845](https://github.com/gradio-app/gradio/pull/7845) [`dbb7373`](https://github.com/gradio-app/gradio/commit/dbb7373dde69d4ed2741942b5a1898f8620cec24) - ensure `ImageEditor` events work as expected.  Thanks @pngwn!

### Fixes

- [#7974](https://github.com/gradio-app/gradio/pull/7974) [`79e0aa8`](https://github.com/gradio-app/gradio/commit/79e0aa81c94e755faa6e85d76ac5d5a666313e6a) - Fix heartbeat in the js client to be Lite compatible.  Thanks @whitphx!

## 0.15.1

### Fixes

- [#7926](https://github.com/gradio-app/gradio/pull/7926) [`9666854`](https://github.com/gradio-app/gradio/commit/966685479078f59430b3bced7e6068eb8157c003) - Fixes streaming event race condition.  Thanks @aliabid94!

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

## 0.14.0

### Features

- [#7691](https://github.com/gradio-app/gradio/pull/7691) [`84f81fe`](https://github.com/gradio-app/gradio/commit/84f81fec9287b041203a141bbf2852720f7d199c) - Closing stream from the backend.  Thanks @aliabid94!

### Fixes

- [#7564](https://github.com/gradio-app/gradio/pull/7564) [`5d1e8da`](https://github.com/gradio-app/gradio/commit/5d1e8dae5ac23f605c3b5f41dbe18751dff380a0) - batch UI updates on a per frame basis.  Thanks @pngwn!

## 0.13.0

### Fixes

- [#7575](https://github.com/gradio-app/gradio/pull/7575) [`d0688b3`](https://github.com/gradio-app/gradio/commit/d0688b3c25feabb4fc7dfa0ab86086b3af7eb337) - Files should now be supplied as `file(...)` in the Client, and some fixes to `gr.load()` as well.  Thanks @abidlabs!

## 0.12.2

### Features

- [#7528](https://github.com/gradio-app/gradio/pull/7528) [`eda33b3`](https://github.com/gradio-app/gradio/commit/eda33b3763897a542acf298e523fa493dc655aee) - Refactors `get_fetchable_url_or_file()` to remove it from the frontend.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#7340](https://github.com/gradio-app/gradio/pull/7340) [`4b0d589`](https://github.com/gradio-app/gradio/commit/4b0d58933057432758a54169a360eb352903d6b4) - chore(deps): update all non-major dependencies.  Thanks [@renovate](https://github.com/apps/renovate)!

## 0.12.1

### Fixes

- [#7411](https://github.com/gradio-app/gradio/pull/7411) [`32b317f`](https://github.com/gradio-app/gradio/commit/32b317f24e3d43f26684bb9f3964f31efd0ea556) - Set `root` correctly for Gradio apps that are deployed behind reverse proxies.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.12.0

### Features

- [#7183](https://github.com/gradio-app/gradio/pull/7183) [`49d9c48`](https://github.com/gradio-app/gradio/commit/49d9c48537aa706bf72628e3640389470138bdc6) - [WIP] Refactor file normalization to be in the backend and remove it from the frontend of each component.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.11.0

### Features

- [#7102](https://github.com/gradio-app/gradio/pull/7102) [`68a54a7`](https://github.com/gradio-app/gradio/commit/68a54a7a310d8d7072fdae930bf1cfdf12c45a7f) - Improve chatbot streaming performance with diffs.  Thanks [@aliabid94](https://github.com/aliabid94)!/n  Note that this PR changes the API format for generator functions, which would be a breaking change for any clients reading the EventStream directly

## 0.10.1

### Fixes

- [#7055](https://github.com/gradio-app/gradio/pull/7055) [`3c3cf86`](https://github.com/gradio-app/gradio/commit/3c3cf8618a8cad1ef66a7f96664923d2c9f5e0e2) - Fix UI freeze on rapid generators.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.10.0

### Features

- [#6931](https://github.com/gradio-app/gradio/pull/6931) [`6c863af`](https://github.com/gradio-app/gradio/commit/6c863af92fa9ceb5c638857eb22cc5ddb718d549) - Fix functional tests.  Thanks [@aliabid94](https://github.com/aliabid94)!
- [#6820](https://github.com/gradio-app/gradio/pull/6820) [`649cd4d`](https://github.com/gradio-app/gradio/commit/649cd4d68041d11fcbe31f8efa455345ac49fc74) - Use `EventSource_factory` in `open_stream()` for Wasm.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.9.4

### Fixes

- [#6863](https://github.com/gradio-app/gradio/pull/6863) [`d406855`](https://github.com/gradio-app/gradio/commit/d4068557953746662235d595ec435c42ceb24414) - Fix JS Client when app is running behind a proxy.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.9.3

### Features

- [#6814](https://github.com/gradio-app/gradio/pull/6814) [`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d) - Refactor queue so that there are separate queues for each concurrency id.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.9.2

### Features

- [#6798](https://github.com/gradio-app/gradio/pull/6798) [`245d58e`](https://github.com/gradio-app/gradio/commit/245d58eff788e8d44a59d37a2d9b26d0f08a62b4) - Improve how server/js client handle unexpected errors.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.9.1

### Fixes

- [#6693](https://github.com/gradio-app/gradio/pull/6693) [`34f9431`](https://github.com/gradio-app/gradio/commit/34f943101bf7dd6b8a8974a6131c1ed7c4a0dac0) - Python client properly handles hearbeat and log messages. Also handles responses longer than 65k.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.9.0

### Features

- [#6398](https://github.com/gradio-app/gradio/pull/6398) [`67ddd40`](https://github.com/gradio-app/gradio/commit/67ddd40b4b70d3a37cb1637c33620f8d197dbee0) - Lite v4.  Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6556](https://github.com/gradio-app/gradio/pull/6556) [`d76bcaa`](https://github.com/gradio-app/gradio/commit/d76bcaaaf0734aaf49a680f94ea9d4d22a602e70) - Fix api event drops.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.8.2

### Features

- [#6511](https://github.com/gradio-app/gradio/pull/6511) [`71f1a1f99`](https://github.com/gradio-app/gradio/commit/71f1a1f9931489d465c2c1302a5c8d768a3cd23a) - Mark `FileData.orig_name` optional on the frontend aligning the type definition on the Python side.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.8.1

### Fixes

- [#6383](https://github.com/gradio-app/gradio/pull/6383) [`324867f63`](https://github.com/gradio-app/gradio/commit/324867f63c920113d89a565892aa596cf8b1e486) - Fix event target.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.8.0

### Features

- [#6307](https://github.com/gradio-app/gradio/pull/6307) [`f1409f95e`](https://github.com/gradio-app/gradio/commit/f1409f95ed39c5565bed6a601e41f94e30196a57) - Provide status updates on file uploads.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.7.2

### Fixes

- [#6327](https://github.com/gradio-app/gradio/pull/6327) [`bca6c2c80`](https://github.com/gradio-app/gradio/commit/bca6c2c80f7e5062427019de45c282238388af95) - Restore query parameters in request.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.7.1

### Features

- [#6137](https://github.com/gradio-app/gradio/pull/6137) [`2ba14b284`](https://github.com/gradio-app/gradio/commit/2ba14b284f908aa13859f4337167a157075a68eb) - JS Param.  Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.7.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - fix circular dependency with client + upload.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Swap websockets for SSE.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.7.0-beta.1

### Features

- [#6143](https://github.com/gradio-app/gradio/pull/6143) [`e4f7b4b40`](https://github.com/gradio-app/gradio/commit/e4f7b4b409323b01aa01b39e15ce6139e29aa073) - fix circular dependency with client + upload.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6094](https://github.com/gradio-app/gradio/pull/6094) [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13) - Image v4.  Thanks [@pngwn](https://github.com/pngwn)!
- [#6069](https://github.com/gradio-app/gradio/pull/6069) [`bf127e124`](https://github.com/gradio-app/gradio/commit/bf127e1241a41401e144874ea468dff8474eb505) - Swap websockets for SSE.  Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.7.0-beta.0

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.6.0

### Features

- [#5972](https://github.com/gradio-app/gradio/pull/5972) [`11a300791`](https://github.com/gradio-app/gradio/commit/11a3007916071f0791844b0a37f0fb4cec69cea3) - Lite: Support opening the entrypoint HTML page directly in browser via the `file:` protocol.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.5.2

### Fixes

- [#5840](https://github.com/gradio-app/gradio/pull/5840) [`4e62b8493`](https://github.com/gradio-app/gradio/commit/4e62b8493dfce50bafafe49f1a5deb929d822103) - Ensure websocket polyfill doesn't load if there is already a `global.Webocket` property set.  Thanks [@Jay2theWhy](https://github.com/Jay2theWhy)!

## 0.5.1

### Fixes

- [#5816](https://github.com/gradio-app/gradio/pull/5816) [`796145e2c`](https://github.com/gradio-app/gradio/commit/796145e2c48c4087bec17f8ec0be4ceee47170cb) - Fix calls to the component server so that `gr.FileExplorer` works on Spaces.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.5.0

### Highlights

#### new `FileExplorer` component ([#5672](https://github.com/gradio-app/gradio/pull/5672) [`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e))

Thanks to a new capability that allows components to communicate directly with the server _without_ passing data via the value, we have created a new `FileExplorer` component.

This component allows you to populate the explorer by passing a glob, but only provides the selected file(s) in your prediction function. 

Users can then navigate the virtual filesystem and select files which will be accessible in your predict function. This component will allow developers to build more complex spaces, with more flexible input options.

![output](https://github.com/pngwn/MDsveX/assets/12937446/ef108f0b-0e84-4292-9984-9dc66b3e144d)

For more information check the [`FileExplorer` documentation](https://gradio.app/docs/fileexplorer).

 Thanks [@aliabid94](https://github.com/aliabid94)!

### Features

- [#5787](https://github.com/gradio-app/gradio/pull/5787) [`caeee8bf7`](https://github.com/gradio-app/gradio/commit/caeee8bf7821fd5fe2f936ed82483bed00f613ec) - ensure the client does not depend on `window` when running in a node environment.  Thanks [@gibiee](https://github.com/gibiee)!

### Fixes

- [#5776](https://github.com/gradio-app/gradio/pull/5776) [`c0fef4454`](https://github.com/gradio-app/gradio/commit/c0fef44541bfa61568bdcfcdfc7d7d79869ab1df) - Revert replica proxy logic and instead implement using the `root` variable.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.4.2

### Features

- [#5124](https://github.com/gradio-app/gradio/pull/5124) [`6e56a0d9b`](https://github.com/gradio-app/gradio/commit/6e56a0d9b0c863e76c69e1183d9d40196922b4cd) - Lite: Websocket queueing.  Thanks [@whitphx](https://github.com/whitphx)!

## 0.4.1

### Fixes

- [#5705](https://github.com/gradio-app/gradio/pull/5705) [`78e7cf516`](https://github.com/gradio-app/gradio/commit/78e7cf5163e8d205e8999428fce4c02dbdece25f) - ensure internal data has updated before dispatching `success` or `then` events.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0

### Features

- [#5682](https://github.com/gradio-app/gradio/pull/5682) [`c57f1b75e`](https://github.com/gradio-app/gradio/commit/c57f1b75e272c76b0af4d6bd0c7f44743ff34f26) - Fix functional tests.  Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5681](https://github.com/gradio-app/gradio/pull/5681) [`40de3d217`](https://github.com/gradio-app/gradio/commit/40de3d2178b61ebe424b6f6228f94c0c6f679bea) - add query parameters to the `gr.Request` object through the `query_params` attribute.  Thanks [@DarhkVoyd](https://github.com/DarhkVoyd)!
- [#5653](https://github.com/gradio-app/gradio/pull/5653) [`ea0e00b20`](https://github.com/gradio-app/gradio/commit/ea0e00b207b4b90a10e9d054c4202d4e705a29ba) - Prevent Clients from accessing API endpoints that set `api_name=False`.  Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.3.1

### Fixes

- [#5412](https://github.com/gradio-app/gradio/pull/5412) [`26fef8c7`](https://github.com/gradio-app/gradio/commit/26fef8c7f85a006c7e25cdbed1792df19c512d02) - Skip view_api request in js client when auth enabled.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.3.0

### Features

- [#5267](https://github.com/gradio-app/gradio/pull/5267) [`119c8343`](https://github.com/gradio-app/gradio/commit/119c834331bfae60d4742c8f20e9cdecdd67e8c2) - Faster reload mode.  Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.2.1

### Features

- [#5173](https://github.com/gradio-app/gradio/pull/5173) [`730f0c1d`](https://github.com/gradio-app/gradio/commit/730f0c1d54792eb11359e40c9f2326e8a6e39203) - Ensure gradio client works as expected for functions that return nothing.  Thanks [@raymondtri](https://github.com/raymondtri)!

## 0.2.0

### Features

- [#5133](https://github.com/gradio-app/gradio/pull/5133) [`61129052`](https://github.com/gradio-app/gradio/commit/61129052ed1391a75c825c891d57fa0ad6c09fc8) - Update dependency esbuild to ^0.19.0. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5035](https://github.com/gradio-app/gradio/pull/5035) [`8b4eb8ca`](https://github.com/gradio-app/gradio/commit/8b4eb8cac9ea07bde31b44e2006ca2b7b5f4de36) - JS Client: Fixes cannot read properties of null (reading 'is_file'). Thanks [@raymondtri](https://github.com/raymondtri)!

### Fixes

- [#5075](https://github.com/gradio-app/gradio/pull/5075) [`67265a58`](https://github.com/gradio-app/gradio/commit/67265a58027ef1f9e4c0eb849a532f72eaebde48) - Allow supporting >1000 files in `gr.File()` and `gr.UploadButton()`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.4

### Patch Changes

- [#4717](https://github.com/gradio-app/gradio/pull/4717) [`ab5d1ea0`](https://github.com/gradio-app/gradio/commit/ab5d1ea0de87ed888779b66fd2a705583bd29e02) Thanks [@whitphx](https://github.com/whitphx)! - Fix the package description

## 0.1.3

### Patch Changes

- [#4357](https://github.com/gradio-app/gradio/pull/4357) [`0dbd8f7f`](https://github.com/gradio-app/gradio/commit/0dbd8f7fee4b4877f783fa7bc493f98bbfc3d01d) Thanks [@pngwn](https://github.com/pngwn)! - Various internal refactors and cleanups.

## 0.1.2

### Patch Changes

- [#4273](https://github.com/gradio-app/gradio/pull/4273) [`1d0f0a9d`](https://github.com/gradio-app/gradio/commit/1d0f0a9db096552e67eb2197c932342587e9e61e) Thanks [@pngwn](https://github.com/pngwn)! - Ensure websocket error messages are correctly handled.

- [#4315](https://github.com/gradio-app/gradio/pull/4315) [`b525b122`](https://github.com/gradio-app/gradio/commit/b525b122dd8569bbaf7e06db5b90d622d2e9073d) Thanks [@whitphx](https://github.com/whitphx)! - Refacor types.

- [#4271](https://github.com/gradio-app/gradio/pull/4271) [`1151c525`](https://github.com/gradio-app/gradio/commit/1151c5253554cb87ebd4a44a8a470ac215ff782b) Thanks [@pngwn](https://github.com/pngwn)! - Ensure the full root path is always respected when making requests to a gradio app server.

## 0.1.1

### Patch Changes

- [#4201](https://github.com/gradio-app/gradio/pull/4201) [`da5b4ee1`](https://github.com/gradio-app/gradio/commit/da5b4ee11721175858ded96e5710225369097f74) Thanks [@pngwn](https://github.com/pngwn)! - Ensure semiver is bundled so CDN links work correctly.

- [#4202](https://github.com/gradio-app/gradio/pull/4202) [`a26e9afd`](https://github.com/gradio-app/gradio/commit/a26e9afde319382993e6ddc77cc4e56337a31248) Thanks [@pngwn](https://github.com/pngwn)! - Ensure all URLs returned by the client are complete URLs with the correct host instead of an absolute path relative to a server.

## 0.1.0

### Minor Changes

- [#4185](https://github.com/gradio-app/gradio/pull/4185) [`67239ca9`](https://github.com/gradio-app/gradio/commit/67239ca9b2fe3796853fbf7bf865c9e4b383200d) Thanks [@pngwn](https://github.com/pngwn)! - Update client for initial release

### Patch Changes

- [#3692](https://github.com/gradio-app/gradio/pull/3692) [`48e8b113`](https://github.com/gradio-app/gradio/commit/48e8b113f4b55e461d9da4f153bf72aeb4adf0f1) Thanks [@pngwn](https://github.com/pngwn)! - Ensure client works in node, create ESM bundle and generate typescript declaration files.

- [#3605](https://github.com/gradio-app/gradio/pull/3605) [`ae4277a9`](https://github.com/gradio-app/gradio/commit/ae4277a9a83d49bdadfe523b0739ba988128e73b) Thanks [@pngwn](https://github.com/pngwn)! - Update readme.