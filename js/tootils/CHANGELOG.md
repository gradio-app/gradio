# @self/tootils

## 0.7.25

### Dependency updates

- @gradio/statustracker@0.10.14

## 0.7.24

### Dependency updates

- @gradio/statustracker@0.10.13

## 0.7.23

### Dependency updates

- @gradio/statustracker@0.10.12

## 0.7.23

### Dependency updates

- @gradio/statustracker@0.10.12

## 0.7.23

### Dependency updates

- @gradio/statustracker@0.10.12

## 0.7.22

### Dependency updates

- @gradio/statustracker@0.10.11

## 0.7.21

### Dependency updates

- @gradio/statustracker@0.10.10

## 0.7.20

### Dependency updates

- @gradio/statustracker@0.10.9
- @gradio/utils@0.10.2

## 0.7.19

### Dependency updates

- @gradio/statustracker@0.10.8

## 0.7.18

### Dependency updates

- @gradio/statustracker@0.10.7

## 0.7.17

### Dependency updates

- @gradio/statustracker@0.10.6

## 0.7.16

### Dependency updates

- @gradio/statustracker@0.10.5

## 0.7.15

### Dependency updates

- @gradio/statustracker@0.10.4

## 0.7.14

### Dependency updates

- @gradio/statustracker@0.10.3
- @gradio/utils@0.10.1

## 0.7.13

### Dependency updates

- @gradio/statustracker@0.10.2

## 0.7.12

### Dependency updates

- @gradio/statustracker@0.10.1

## 0.7.11

### Dependency updates

- @gradio/utils@0.10.0
- @gradio/statustracker@0.10.0

## 0.7.10

### Dependency updates

- @gradio/statustracker@0.9.7

## 0.7.9

### Dependency updates

- @gradio/utils@0.9.0
- @gradio/statustracker@0.9.6

## 0.7.8

### Dependency updates

- @gradio/utils@0.8.0
- @gradio/statustracker@0.9.5

## 0.7.7

### Dependency updates

- @gradio/statustracker@0.9.4

## 0.7.6

### Dependency updates

- @gradio/statustracker@0.9.3

## 0.7.5

### Dependency updates

- @gradio/statustracker@0.9.2

## 0.7.4

### Dependency updates

- @gradio/statustracker@0.9.1

## 0.7.3

### Dependency updates

- @gradio/statustracker@0.9.0

## 0.7.2

### Fixes

- [#9528](https://github.com/gradio-app/gradio/pull/9528) [`9004b11`](https://github.com/gradio-app/gradio/commit/9004b110640bdb54995343a870bf080ee15da02d) - Fix Lite to work on FireFox.  Thanks @whitphx!

## 0.7.1

### Dependency updates

- @gradio/statustracker@0.8.1

## 0.7.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - SSR e2e + fixes

### Dependencies

- @gradio/statustracker@0.8.0
- @gradio/utils@0.7.0

## 0.7.0-beta.5

### Features

- [#9590](https://github.com/gradio-app/gradio/pull/9590) [`e853c41`](https://github.com/gradio-app/gradio/commit/e853c413583d91186aef3aceb0849d0ec0494834) - SSR e2e + fixes.  Thanks @pngwn!

### Dependency updates

- @gradio/statustracker@0.8.0-beta.5

## 0.6.5-beta.4

### Dependency updates

- @gradio/statustracker@0.8.0-beta.4

## 0.6.5-beta.3

### Dependency updates

- @gradio/statustracker@0.8.0-beta.3

## 0.6.5-beta.2

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2

## 0.6.5-beta.2

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2
- @gradio/utils@0.7.0-beta.2

## 0.6.5-beta.1

### Dependency updates

- @gradio/statustracker@0.8.0-beta.1
- @gradio/utils@0.7.0-beta.1

## 0.6.5

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.1
- @gradio/statustracker@0.7.6

## 0.6.4

### Dependency updates

- @gradio/utils@0.6.0
- @gradio/statustracker@0.7.5

## 0.6.3

### Dependency updates

- @gradio/statustracker@0.7.4

## 0.6.2

### Dependency updates

- @gradio/utils@0.5.2
- @gradio/statustracker@0.7.3

## 0.6.1

### Dependency updates

- @gradio/statustracker@0.7.2

## 0.6.0

### Highlights

#### Support message format in chatbot 💬 ([#8422](https://github.com/gradio-app/gradio/pull/8422) [`4221290`](https://github.com/gradio-app/gradio/commit/4221290d847041024b1faa3df5585bba0775b8b3))

`gr.Chatbot` and `gr.ChatInterface` now support the [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api#messages-api), which is fully compatible with LLM API providers such as Hugging Face Text Generation Inference, OpenAI's chat completions API, and Llama.cpp server. 

Building Gradio applications around these LLM solutions is now even easier! 

`gr.Chatbot` and `gr.ChatInterface` now have a `type` parameter that can accept two values - `'tuples'` and `'messages'`. If set to `'tuples'`, the default chatbot data format is expected. If set to `'messages'`, a list of dictionaries with `content` and `role` keys is expected. See below - 

```python
def chat_greeter(msg, history):
    history.append({"role": "assistant", "content": "Hello!"})
    return history
```

Additionally, gradio now exposes a `gr.ChatMessage` dataclass you can use for IDE type hints and auto completion.

<img width="852" alt="image" src="https://github.com/freddyaboulton/freddyboulton/assets/41651716/d283e8f3-b194-466a-8194-c7e697dca9ad">


#### Tool use in Chatbot 🛠️

The Gradio Chatbot can now natively display tool usage and intermediate thoughts common in Agent and chain-of-thought workflows!

If you are using the new "messages" format, simply add a `metadata` key with a dictionary containing a `title` key and `value`. This will display the assistant message in an expandable message box to show the result of a tool or intermediate step.

```python
import gradio as gr
from gradio import ChatMessage
import time

def generate_response(history):
    history.append(ChatMessage(role="user", content="What is the weather in San Francisco right now?"))
    yield history
    time.sleep(0.25)
    history.append(ChatMessage(role="assistant",
                               content="In order to find the current weather in San Francisco, I will need to use my weather tool.")
                               )
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="API Error when connecting to weather service.",
                              metadata={"title": "💥 Error using tool 'Weather'"})
                  )
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="I will try again",
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="Weather 72 degrees Fahrenheit with 20% chance of rain.",
                                metadata={"title": "🛠️ Used tool 'Weather'"}
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="Now that the API succeeded I can complete my task.",
                              ))
    yield history
    time.sleep(0.25)

    history.append(ChatMessage(role="assistant",
                               content="It's a sunny day in San Francisco with a current temperature of 72 degrees Fahrenheit and a 20% chance of rain. Enjoy the weather!",
                              ))
    yield history


with gr.Blocks() as demo:
    chatbot  = gr.Chatbot(type="messages")
    button = gr.Button("Get San Francisco Weather")
    button.click(generate_response, chatbot, chatbot)

if __name__ == "__main__":
    demo.launch()
```



![tool-box-demo](https://github.com/freddyaboulton/freddyboulton/assets/41651716/cf73ecc9-90ac-42ce-bca5-768e0cc00a48)

 Thanks @freddyaboulton!

### Features

- [#8222](https://github.com/gradio-app/gradio/pull/8222) [`3a6142f`](https://github.com/gradio-app/gradio/commit/3a6142fa4829aa6d65d7b8388fbba49cc8db8ab1) - Lite load perf ci.  Thanks @whitphx!

### Dependency updates

- @gradio/utils@0.5.1
- @gradio/statustracker@0.7.1

## 0.5.1

### Dependency updates

- @gradio/utils@0.5.0
- @gradio/statustracker@0.7.0

## 0.5.0

### Features

- [#8417](https://github.com/gradio-app/gradio/pull/8417) [`96d8de2`](https://github.com/gradio-app/gradio/commit/96d8de231270321da5f310768643363276df3204) - add delete event to `File` component.  Thanks @pngwn!

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.4.5

### Dependency updates

- @gradio/statustracker@0.6.0

## 0.4.4

### Dependency updates

- @gradio/utils@0.4.2
- @gradio/statustracker@0.5.5

## 0.4.3

### Dependency updates

- @gradio/statustracker@0.5.4

## 0.4.2

### Dependency updates

- @gradio/statustracker@0.5.3

## 0.4.1

### Dependency updates

- @gradio/statustracker@0.5.2

## 0.4.0

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!

### Fixes

- [#8179](https://github.com/gradio-app/gradio/pull/8179) [`6a218b4`](https://github.com/gradio-app/gradio/commit/6a218b4148095aaa0c58d8c20973ba01c8764fc2) - rework upload to be a class method + pass client into each component.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.4.1
- @gradio/statustracker@0.5.1

## 0.3.0

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

### Dependency updates

- @gradio/statustracker@0.5.0
- @gradio/utils@0.4.0

## 0.2.8

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12

## 0.2.7

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/statustracker@0.4.11

## 0.2.6

### Dependency updates

- @gradio/statustracker@0.4.10

## 0.2.5

### Dependency updates

- @gradio/statustracker@0.4.9

## 0.2.4

### Features

- [#7345](https://github.com/gradio-app/gradio/pull/7345) [`561579d`](https://github.com/gradio-app/gradio/commit/561579d9b7b860c5cb3f8131e0dced0c8114463f) - fix-tests.  Thanks [@pngwn](https://github.com/pngwn)!

## 0.2.3

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @gradio/statustracker@0.4.7

## 0.2.1

### Patch Changes

- Updated dependencies [[`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7)]:
  - @gradio/utils@0.3.0
  - @gradio/statustracker@0.4.6

## 0.2.0

### Features

- [#6890](https://github.com/gradio-app/gradio/pull/6890) [`cccab27`](https://github.com/gradio-app/gradio/commit/cccab27fe8b6ae6860b3fff68694fa33060e18a7) - E2E tests for Lite. Thanks [@whitphx](https://github.com/whitphx)!
- [#7342](https://github.com/gradio-app/gradio/pull/7342) [`0db7272`](https://github.com/gradio-app/gradio/commit/0db7272694f307890afa569c80619828c173c3d5) - Fix lite tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.9

### Patch Changes

- Updated dependencies [[`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557)]:
  - @gradio/utils@0.2.2
  - @gradio/statustracker@0.4.5

## 0.1.8

### Patch Changes

- Updated dependencies [[`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b)]:
  - @gradio/utils@0.2.1
  - @gradio/statustracker@0.4.4

## 0.1.7

### Patch Changes

- Updated dependencies [[`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d)]:
  - @gradio/statustracker@0.4.3

## 0.1.6

### Patch Changes

- Updated dependencies []:
  - @gradio/statustracker@0.4.2

## 0.1.5

### Patch Changes

- Updated dependencies []:
  - @gradio/statustracker@0.4.1

## 0.1.4

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/statustracker@0.4.0

## 0.1.3

### Patch Changes

- Updated dependencies []:
  - @gradio/statustracker@0.3.2

## 0.1.2

### Patch Changes

- Updated dependencies []:
  - @gradio/statustracker@0.3.1

## 0.1.1

### Fixes

- [#6234](https://github.com/gradio-app/gradio/pull/6234) [`aaa55ce85`](https://github.com/gradio-app/gradio/commit/aaa55ce85e12f95aba9299445e9c5e59824da18e) - Video/Audio fixes. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6236](https://github.com/gradio-app/gradio/pull/6236) [`6bce259c5`](https://github.com/gradio-app/gradio/commit/6bce259c5db7b21b327c2067e74ea20417bc89ec) - Ensure `gr.CheckboxGroup` updates as expected. Thanks [@pngwn](https://github.com/pngwn)!
- [#6249](https://github.com/gradio-app/gradio/pull/6249) [`2cffcf3c3`](https://github.com/gradio-app/gradio/commit/2cffcf3c39acd782f314f8a406100ae22e0809b7) - ensure radios have different names. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.7

### Patch Changes

- Updated dependencies [[`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a)]:
  - @gradio/utils@0.2.0-beta.6

## 0.1.0-beta.6

### Features

- [#6044](https://github.com/gradio-app/gradio/pull/6044) [`9053c95a1`](https://github.com/gradio-app/gradio/commit/9053c95a10de12aef572018ee37c71106d2da675) - Simplify File Component. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.1.0-beta.5

### Patch Changes

- Updated dependencies [[`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93)]:
  - @gradio/utils@0.2.0-beta.4

## 0.1.0-beta.4

### Features

- [#5648](https://github.com/gradio-app/gradio/pull/5648) [`c573e2339`](https://github.com/gradio-app/gradio/commit/c573e2339b86c85b378dc349de5e9223a3c3b04a) - Publish all components to npm. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.1.0-beta.3

### Patch Changes

- Updated dependencies [[`0b4fd5b6d`](https://github.com/gradio-app/gradio/commit/0b4fd5b6db96fc95a155e5e935e17e1ab11d1161)]:
  - @gradio/utils@0.2.0-beta.3

## 0.1.0-beta.2

### Patch Changes

- Updated dependencies [[`14fc612d8`](https://github.com/gradio-app/gradio/commit/14fc612d84bf6b1408eccd3a40fab41f25477571)]:
  - @gradio/utils@0.2.0-beta.2

## 0.1.0-beta.1

### Patch Changes

- Updated dependencies []:
  - @gradio/utils@0.2.0-beta.1

## 0.1.0-beta.0

### Features

- [#5507](https://github.com/gradio-app/gradio/pull/5507) [`1385dc688`](https://github.com/gradio-app/gradio/commit/1385dc6881f2d8ae7a41106ec21d33e2ef04d6a9) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.0.2

### Highlights

#### Improve startup performance and markdown support ([#5279](https://github.com/gradio-app/gradio/pull/5279) [`fe057300`](https://github.com/gradio-app/gradio/commit/fe057300f0672c62dab9d9b4501054ac5d45a4ec))

##### Improved markdown support

We now have better support for markdown in `gr.Markdown` and `gr.Dataframe`. Including syntax highlighting and Github Flavoured Markdown. We also have more consistent markdown behaviour and styling.

##### Various performance improvements

These improvements will be particularly beneficial to large applications.

- Rather than attaching events manually, they are now delegated, leading to a significant performance improvement and addressing a performance regression introduced in a recent version of Gradio. App startup for large applications is now around twice as fast.
- Optimised the mounting of individual components, leading to a modest performance improvement during startup (~30%).
- Corrected an issue that was causing markdown to re-render infinitely.
- Ensured that the `gr.3DModel` does re-render prematurely.

Thanks [@pngwn](https://github.com/pngwn)!