# @gradio/chatbot

## 0.14.2

### Dependency updates

- @gradio/upload@0.13.1
- @gradio/image@0.16.2
- @gradio/video@0.11.2
- @gradio/wasm@0.14.1
- @gradio/gallery@0.13.2

## 0.14.1

### Features

- [#9617](https://github.com/gradio-app/gradio/pull/9617) [`c163182`](https://github.com/gradio-app/gradio/commit/c163182d1b752ef91629f9caa13bf3cce0fb0869) - Fix dark mode detection and container height.  Thanks @pngwn!
- [#9623](https://github.com/gradio-app/gradio/pull/9623) [`5923c67`](https://github.com/gradio-app/gradio/commit/5923c679136cca68731393d5e4f3bd338e651f44) - Fix Chatbot Examples Error.  Thanks @freddyaboulton!
- [#9614](https://github.com/gradio-app/gradio/pull/9614) [`5d98550`](https://github.com/gradio-app/gradio/commit/5d985509b4b71aa4aa6b28acc38fe83c278dbbfa) - Fix `retry` and `undo` reactivity in gr.Chatbot.  Thanks @hannahblair!
- [#9619](https://github.com/gradio-app/gradio/pull/9619) [`1f3ee97`](https://github.com/gradio-app/gradio/commit/1f3ee97d10415bf7dfa693746517cf97897049b7) - Fix Functional Tests.  Thanks @dawoodkhan82!

### Fixes

- [#9630](https://github.com/gradio-app/gradio/pull/9630) [`2eaa066`](https://github.com/gradio-app/gradio/commit/2eaa0667e1d1a0edd1089bf8c3ffa3f563b9bca2) - Fix duplicate attribute error.  Thanks @pngwn!

### Dependency updates

- @gradio/video@0.11.1
- @gradio/statustracker@0.8.1
- @gradio/gallery@0.13.1
- @gradio/markdown@0.10.1
- @gradio/plot@0.7.1
- @gradio/image@0.16.1

## 0.14.0

### Features

- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Small tweak to how thoughts are shown in `gr.Chatbot`
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Move buttons from chat_interface into Chatbot
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Disable liking user message in chatbot by default but make it configurable
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Chatbot Examples
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Move icons into `IconButtonWrapper`
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix chatinterface embedding height issues
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Chatbot bug fixes
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Chatbot autoscroll
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix markdown code copy/check button in gr.Chatbot
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - 9227 chatinterface retry bug
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Some more chatbot fixes
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fixes: Chatbot examples for custom chatbot + rename `suggestions` -> `examples`
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Standardize `height` across components and add `max_height` and `min_height` parameters where appropriate
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Fix `gr.Chatbot` panels layout
- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ssr part 2

### Fixes


- [#8843](https://github.com/gradio-app/gradio/pull/8843) [`6f95286`](https://github.com/gradio-app/gradio/commit/6f95286337459efbccb95c9cfac63355669df9ee) - Ensure undo/try shows for final bot message in gr.Chatbot

### Dependencies

- @gradio/atoms@0.9.0
- @gradio/client@1.6.0
- @gradio/gallery@0.13.0
- @gradio/icons@0.8.0
- @gradio/markdown@0.10.0
- @gradio/plot@0.7.0
- @gradio/statustracker@0.8.0
- @gradio/theme@0.3.0
- @gradio/upload@0.13.0
- @gradio/utils@0.7.0
- @gradio/wasm@0.14.0

## 0.14.0-beta.9

### Fixes

- [#9600](https://github.com/gradio-app/gradio/pull/9600) [`9f71086`](https://github.com/gradio-app/gradio/commit/9f71086036339bfdd14f3aab29729041a01fc2d4) - Ensure undo/try shows for final bot message in gr.Chatbot.  Thanks @hannahblair!

## 0.14.0-beta.8

### Features

- [#9593](https://github.com/gradio-app/gradio/pull/9593) [`cc61fe7`](https://github.com/gradio-app/gradio/commit/cc61fe7047ac61779a61cce52c666400b9517daa) - Some more chatbot fixes.  Thanks @dawoodkhan82!
- [#9582](https://github.com/gradio-app/gradio/pull/9582) [`43a7f42`](https://github.com/gradio-app/gradio/commit/43a7f420d8ac34c7f7fa71d6e630a4c8618d3780) - Chatbot autoscroll.  Thanks @whitphx!
- [#9598](https://github.com/gradio-app/gradio/pull/9598) [`ffc33fa`](https://github.com/gradio-app/gradio/commit/ffc33facaec1bcc92add5892afb86b7b5ba037d4) - Fix markdown code copy/check button in gr.Chatbot.  Thanks @hannahblair!
- [#9499](https://github.com/gradio-app/gradio/pull/9499) [`17e6c84`](https://github.com/gradio-app/gradio/commit/17e6c84d6b11651cd03c1d47caec85de62030ea0) - Fix `gr.Chatbot` panels layout.  Thanks @hannahblair!

### Dependency updates

- @gradio/upload@0.13.0-beta.7
- @gradio/statustracker@0.8.0-beta.5
- @gradio/icons@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.5
- @gradio/image@0.16.0-beta.7
- @gradio/video@0.11.0-beta.7
- @gradio/markdown@0.10.0-beta.5
- @gradio/gallery@0.13.0-beta.7
- @gradio/plot@0.7.0-beta.6

## 0.14.0-beta.7

### Features

- [#9571](https://github.com/gradio-app/gradio/pull/9571) [`148345d`](https://github.com/gradio-app/gradio/commit/148345d107763754710505281ad70368ebc6f3ec) - Fix chatinterface embedding height issues.  Thanks @aliabid94!

### Dependency updates

- @gradio/video@0.11.0-beta.6
- @gradio/statustracker@0.8.0-beta.4
- @gradio/atoms@0.9.0-beta.4
- @gradio/client@1.6.0-beta.4
- @gradio/upload@0.13.0-beta.6
- @gradio/image@0.16.0-beta.6
- @gradio/gallery@0.13.0-beta.6
- @gradio/markdown@0.10.0-beta.4
- @gradio/plot@0.7.0-beta.5

## 0.14.0-beta.6

### Features

- [#9488](https://github.com/gradio-app/gradio/pull/9488) [`4e6a47f`](https://github.com/gradio-app/gradio/commit/4e6a47f5a29cb885d5bc01a79ca4cc45d298f0b1) - Fixes: Chatbot examples for custom chatbot + rename `suggestions` -> `examples`.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/upload@0.13.0-beta.5
- @gradio/statustracker@0.8.0-beta.3
- @gradio/video@0.11.0-beta.5
- @gradio/icons@0.8.0-beta.3
- @gradio/atoms@0.9.0-beta.3
- @gradio/markdown@0.10.0-beta.3
- @gradio/gallery@0.13.0-beta.5
- @gradio/plot@0.7.0-beta.4
- @gradio/image@0.16.0-beta.5

## 0.14.0-beta.5

### Dependency updates

- @gradio/statustracker@0.8.0-beta.2
- @gradio/upload@0.13.0-beta.4
- @gradio/markdown@0.10.0-beta.2
- @gradio/image@0.16.0-beta.4
- @gradio/video@0.11.0-beta.4
- @gradio/wasm@0.14.0-beta.3
- @gradio/plot@0.7.0-beta.3
- @gradio/gallery@0.13.0-beta.4

## 0.14.0-beta.4

### Features

- [#9453](https://github.com/gradio-app/gradio/pull/9453) [`56dbf77`](https://github.com/gradio-app/gradio/commit/56dbf77671012015efd3c745bc33e5074ab7158f) - Chatbot bug fixes.  Thanks @dawoodkhan82!

## 0.14.0-beta.3

### Dependency updates

- @gradio/upload@0.13.0-beta.3
- @gradio/video@0.11.0-beta.3
- @gradio/client@1.6.0-beta.3
- @gradio/gallery@0.13.0-beta.3
- @gradio/image@0.16.0-beta.3

## 0.14.0-beta.2

### Features

- [#9359](https://github.com/gradio-app/gradio/pull/9359) [`50c3a7f`](https://github.com/gradio-app/gradio/commit/50c3a7f1541f632853a96f3d979ebeef6ad82869) - Small tweak to how thoughts are shown in `gr.Chatbot`.  Thanks @abidlabs!
- [#9323](https://github.com/gradio-app/gradio/pull/9323) [`06babda`](https://github.com/gradio-app/gradio/commit/06babda0395fd3fbd323c1c3cb33704ecfd6deb0) - Disable liking user message in chatbot by default but make it configurable.  Thanks @freddyaboulton!
- [#8966](https://github.com/gradio-app/gradio/pull/8966) [`8e52b6a`](https://github.com/gradio-app/gradio/commit/8e52b6a3e75957462bc7fdbf6ff9c280084d5f08) - Chatbot Examples.  Thanks @dawoodkhan82!
- [#9261](https://github.com/gradio-app/gradio/pull/9261) [`73647a0`](https://github.com/gradio-app/gradio/commit/73647a07b0439efabe3dd218ff6c366ffa3b84a0) - Move icons into `IconButtonWrapper`.  Thanks @hannahblair!
- [#9316](https://github.com/gradio-app/gradio/pull/9316) [`4338f29`](https://github.com/gradio-app/gradio/commit/4338f29bce2430d765f20070d1823ecc19d940cb) - 9227 chatinterface retry bug.  Thanks @freddyaboulton!
- [#9313](https://github.com/gradio-app/gradio/pull/9313) [`1fef9d9`](https://github.com/gradio-app/gradio/commit/1fef9d9a26f0ebce4de18c486702661f6539b1c6) - Standardize `height` across components and add `max_height` and `min_height` parameters where appropriate.  Thanks @abidlabs!
- [#9339](https://github.com/gradio-app/gradio/pull/9339) [`4c8c6f2`](https://github.com/gradio-app/gradio/commit/4c8c6f2fe603081941c5fdc43f48a0632b9f31ad) - Ssr part 2.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.9.0-beta.2
- @gradio/gallery@0.13.0-beta.2
- @gradio/upload@0.13.0-beta.2
- @gradio/wasm@0.14.0-beta.2
- @gradio/markdown@0.10.0-beta.2
- @gradio/client@1.6.0-beta.2
- @gradio/icons@0.8.0-beta.2
- @gradio/statustracker@0.8.0-beta.2
- @gradio/utils@0.7.0-beta.2
- @gradio/plot@0.6.5-beta.2
- @gradio/image@0.16.0-beta.2
- @gradio/video@0.11.0-beta.2

## 0.14.0-beta.1

### Features

- [#9201](https://github.com/gradio-app/gradio/pull/9201) [`5492e74`](https://github.com/gradio-app/gradio/commit/5492e742b1f1fa618208cce523f50ad22a6e86f1) - Move buttons from chat_interface into Chatbot.  Thanks @freddyaboulton!
- [#9187](https://github.com/gradio-app/gradio/pull/9187) [`5bf00b7`](https://github.com/gradio-app/gradio/commit/5bf00b7524ebf399b48719120a49d15bb21bd65c) - make all component SSR compatible.  Thanks @pngwn!

### Dependency updates

- @gradio/video@0.11.0-beta.1
- @gradio/atoms@0.8.1-beta.1
- @gradio/icons@0.8.0-beta.1
- @gradio/statustracker@0.8.0-beta.1
- @gradio/utils@0.7.0-beta.1
- @gradio/client@1.6.0-beta.1
- @gradio/image@0.16.0-beta.1
- @gradio/upload@0.12.4-beta.1
- @gradio/markdown@0.9.4-beta.1
- @gradio/wasm@0.13.1-beta.1
- @gradio/theme@0.3.0-beta.1
- @gradio/gallery@0.13.0-beta.1
- @gradio/plot@0.6.5-beta.1

## 0.13.1

### Features

- [#9187](https://github.com/gradio-app/gradio/pull/9187) [`5bf00b7`](https://github.com/gradio-app/gradio/commit/5bf00b7524ebf399b48719120a49d15bb21bd65c) - make all component SSR compatible.  Thanks @pngwn!

### Fixes

- [#9163](https://github.com/gradio-app/gradio/pull/9163) [`2b6cbf2`](https://github.com/gradio-app/gradio/commit/2b6cbf25908e42cf027324e54ef2cc0baad11a91) - fix exports and generate types.  Thanks @pngwn!

### Dependency updates

- @gradio/utils@0.6.1
- @gradio/statustracker@0.7.6
- @gradio/atoms@0.8.1
- @gradio/icons@0.7.2
- @gradio/wasm@0.13.1
- @gradio/client@1.5.2
- @gradio/upload@0.12.4
- @gradio/markdown@0.9.4
- @gradio/gallery@0.12.2
- @gradio/theme@0.2.5
- @gradio/plot@0.6.5
- @gradio/image@0.15.1
- @gradio/video@0.10.4

## 0.13.0

### Features

- [#9013](https://github.com/gradio-app/gradio/pull/9013) [`5350f1f`](https://github.com/gradio-app/gradio/commit/5350f1feb20cb7458d188403f319c5087052f695) - Add copy all messages button to chatbot.  Thanks @hannahblair!
- [#9118](https://github.com/gradio-app/gradio/pull/9118) [`e1c404d`](https://github.com/gradio-app/gradio/commit/e1c404da1143fb52b659d03e028bdba1badf443d) - setup npm-previews of all packages.  Thanks @pngwn!
- [#9102](https://github.com/gradio-app/gradio/pull/9102) [`efdc323`](https://github.com/gradio-app/gradio/commit/efdc3231a7bde38cfe45d10086d0d36a24c1b9b4) - Initial SSR refactor.  Thanks @pngwn!

### Fixes

- [#9161](https://github.com/gradio-app/gradio/pull/9161) [`173c7b8`](https://github.com/gradio-app/gradio/commit/173c7b8624371d89c40eb667bc28b9955c61b063) - Chatbot Image size and list fixes.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/utils@0.6.0
- @gradio/upload@0.12.3
- @gradio/atoms@0.8.0
- @gradio/client@1.5.1
- @gradio/markdown@0.9.3
- @gradio/statustracker@0.7.5
- @gradio/theme@0.2.4
- @gradio/wasm@0.13.0
- @gradio/gallery@0.12.1
- @gradio/icons@0.7.1
- @gradio/plot@0.6.4
- @gradio/image@0.15.0
- @gradio/video@0.10.3

## 0.12.4

### Fixes

- [#8847](https://github.com/gradio-app/gradio/pull/8847) [`4d8a473`](https://github.com/gradio-app/gradio/commit/4d8a473632e388a312aee5c705b3c1f79853441b) - Refactor Chatinterface to use Chatbot instead of gr.State variables.  Thanks @freddyaboulton!

### Dependency updates

- @gradio/atoms@0.7.9
- @gradio/statustracker@0.7.4
- @gradio/client@1.5.0
- @gradio/gallery@0.12.0
- @gradio/icons@0.7.0
- @gradio/upload@0.12.2
- @gradio/markdown@0.9.2
- @gradio/plot@0.6.3
- @gradio/image@0.14.0
- @gradio/audio@0.13.2
- @gradio/video@0.10.2

## 0.12.3

### Dependency updates

- @gradio/atoms@0.7.8
- @gradio/icons@0.6.1
- @gradio/utils@0.5.2
- @gradio/statustracker@0.7.3
- @gradio/upload@0.12.1
- @gradio/image@0.13.1
- @gradio/video@0.10.1
- @gradio/audio@0.13.1
- @gradio/gallery@0.11.4
- @gradio/markdown@0.9.1
- @gradio/plot@0.6.2

## 0.12.2

### Fixes

- [#8865](https://github.com/gradio-app/gradio/pull/8865) [`2f630ab`](https://github.com/gradio-app/gradio/commit/2f630abf53ec493a3ff5e827b5951b26c74b7242) - Chatbot Examples Scroll Fix.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/audio@0.13.0
- @gradio/video@0.10.0
- @gradio/wasm@0.12.0
- @gradio/markdown@0.9.0
- @gradio/client@1.4.0
- @gradio/image@0.13.0
- @gradio/statustracker@0.7.2
- @gradio/upload@0.12.0
- @gradio/atoms@0.7.7
- @gradio/gallery@0.11.3
- @gradio/plot@0.6.1

## 0.12.1

### Features

- [#8766](https://github.com/gradio-app/gradio/pull/8766) [`2b4636e`](https://github.com/gradio-app/gradio/commit/2b4636e75cf728846253451b7104b724609a9cd1) - Fix width of assistant's chatbot bubble.  Thanks @pngwn!

## 0.12.0

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

### Fixes

- [#8758](https://github.com/gradio-app/gradio/pull/8758) [`26cdd0f`](https://github.com/gradio-app/gradio/commit/26cdd0ffe049ecfe751f3831cbdb4c04c0ecf934) - Revert chatbot styling.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.6
- @gradio/utils@0.5.1
- @gradio/statustracker@0.7.1
- @gradio/client@1.3.0
- @gradio/markdown@0.8.1
- @gradio/upload@0.11.5
- @gradio/image@0.12.2
- @gradio/icons@0.6.0
- @gradio/plot@0.6.0
- @gradio/audio@0.12.2
- @gradio/gallery@0.11.2
- @gradio/video@0.9.2

## 0.11.1

### Fixes

- [#8655](https://github.com/gradio-app/gradio/pull/8655) [`3896398`](https://github.com/gradio-app/gradio/commit/38963984800d58bfad81bc928f2d631cb4bac773) - Ensure copy button on chatbot shows when appropriate.  Thanks @pngwn!
- [#8631](https://github.com/gradio-app/gradio/pull/8631) [`9b8840a`](https://github.com/gradio-app/gradio/commit/9b8840ab5f712a6634b77df014083071fa253ba0) - Ensure chatbot messages are visible to screenreaders.  Thanks @hannahblair!

### Dependency updates

- @gradio/upload@0.11.4
- @gradio/client@1.2.1
- @gradio/gallery@0.11.1
- @gradio/image@0.12.1
- @gradio/audio@0.12.1
- @gradio/video@0.9.1

## 0.11.0

### Features

- [#8131](https://github.com/gradio-app/gradio/pull/8131) [`bb504b4`](https://github.com/gradio-app/gradio/commit/bb504b494947a287d6386e0e7ead3860c0f15223) - Gradio components in `gr.Chatbot()`.  Thanks @dawoodkhan82!
- [#8607](https://github.com/gradio-app/gradio/pull/8607) [`c7cd0a0`](https://github.com/gradio-app/gradio/commit/c7cd0a0e9aefe0e5ee5584df676f3cc69a403059) - Ensure chatbot background is consistent with other components.  Thanks @pngwn!
- [#8555](https://github.com/gradio-app/gradio/pull/8555) [`7fc7455`](https://github.com/gradio-app/gradio/commit/7fc7455553c04c52c8e25d520f3d67f1b5609637) - support html in chatbot.  Thanks @pngwn!

### Fixes

- [#8594](https://github.com/gradio-app/gradio/pull/8594) [`530f8a0`](https://github.com/gradio-app/gradio/commit/530f8a0b056b35dabe9bdd148e1ab7c4577f017d) - chatbot component tweaks.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.5
- @gradio/audio@0.12.0
- @gradio/gallery@0.11.0
- @gradio/image@0.12.0
- @gradio/plot@0.5.0
- @gradio/utils@0.5.0
- @gradio/video@0.9.0
- @gradio/icons@0.5.0
- @gradio/wasm@0.11.0
- @gradio/client@1.2.0
- @gradio/statustracker@0.7.0
- @gradio/markdown@0.8.0
- @gradio/upload@0.11.3

## 0.10.11

### Dependency updates

- @gradio/client@1.1.1
- @gradio/upload@0.11.2
- @gradio/audio@0.11.10
- @gradio/image@0.11.10
- @gradio/video@0.8.10

## 0.10.10

### Dependency updates

- @gradio/upload@0.11.1
- @gradio/client@1.1.0
- @gradio/audio@0.11.9
- @gradio/image@0.11.9
- @gradio/video@0.8.9

## 0.10.9

### Dependency updates

- @gradio/statustracker@0.6.0
- @gradio/client@1.0.0
- @gradio/upload@0.11.0
- @gradio/audio@0.11.8
- @gradio/image@0.11.8
- @gradio/video@0.8.8
- @gradio/markdown@0.7.6

## 0.10.8

### Features

- [#8377](https://github.com/gradio-app/gradio/pull/8377) [`341844f`](https://github.com/gradio-app/gradio/commit/341844f04efe0e7e512c7ca443f3f2b195a32fa7) - Click to preview images in chatbot.  Thanks @dawoodkhan82!

## 0.10.7

### Dependency updates

- @gradio/upload@0.10.7
- @gradio/client@0.20.1
- @gradio/audio@0.11.7
- @gradio/image@0.11.7
- @gradio/video@0.8.7

## 0.10.6

### Dependency updates

- @gradio/client@0.20.0
- @gradio/statustracker@0.6.0
- @gradio/audio@0.11.6
- @gradio/image@0.11.6
- @gradio/upload@0.10.6
- @gradio/video@0.8.6
- @gradio/markdown@0.7.6

## 0.10.5

### Features

- [#8311](https://github.com/gradio-app/gradio/pull/8311) [`35905c5`](https://github.com/gradio-app/gradio/commit/35905c5c8f7acbe669486ac8f57b6955328e4783) - Cleanup markdown styling.  Thanks @aliabid94!

### Dependency updates

- @gradio/utils@0.4.2
- @gradio/atoms@0.7.4
- @gradio/statustracker@0.5.5
- @gradio/upload@0.10.5
- @gradio/markdown@0.7.5
- @gradio/theme@0.2.3
- @gradio/client@0.19.4
- @gradio/audio@0.11.5
- @gradio/image@0.11.5
- @gradio/video@0.8.5

## 0.10.4

### Dependency updates

- @gradio/client@0.19.3
- @gradio/statustracker@0.5.4
- @gradio/audio@0.11.4
- @gradio/image@0.11.4
- @gradio/upload@0.10.4
- @gradio/video@0.8.4
- @gradio/markdown@0.7.4

## 0.10.3

### Dependency updates

- @gradio/upload@0.10.3
- @gradio/client@0.19.2
- @gradio/audio@0.11.3
- @gradio/image@0.11.3
- @gradio/video@0.8.3

## 0.10.2

### Dependency updates

- @gradio/statustracker@0.5.3
- @gradio/client@0.19.1
- @gradio/audio@0.11.2
- @gradio/image@0.11.2
- @gradio/markdown@0.7.3
- @gradio/video@0.8.2
- @gradio/upload@0.10.2

## 0.10.1

### Features

- [#8226](https://github.com/gradio-app/gradio/pull/8226) [`892181b`](https://github.com/gradio-app/gradio/commit/892181b4fdb13dd6048a620dd985d47bc3c26ed7) - chore(deps): update dependency @types/prismjs to v1.26.4.  Thanks @renovate!

### Dependency updates

- @gradio/atoms@0.7.3
- @gradio/statustracker@0.5.2
- @gradio/markdown@0.7.2
- @gradio/client@0.19.0
- @gradio/icons@0.4.1
- @gradio/audio@0.11.1
- @gradio/image@0.11.1
- @gradio/upload@0.10.1
- @gradio/video@0.8.1

## 0.10.0

### Features

- [#8121](https://github.com/gradio-app/gradio/pull/8121) [`f5b710c`](https://github.com/gradio-app/gradio/commit/f5b710c919b0ce604ea955f0d5f4faa91095ca4a) - chore(deps): update dependency eslint to v9.  Thanks @renovate!

### Dependency updates

- @gradio/atoms@0.7.2
- @gradio/client@0.18.0
- @gradio/upload@0.10.0
- @gradio/utils@0.4.1
- @gradio/statustracker@0.5.1
- @gradio/audio@0.11.0
- @gradio/image@0.11.0
- @gradio/video@0.8.0
- @gradio/markdown@0.7.1

## 0.9.0

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

### Fixes

- [#8066](https://github.com/gradio-app/gradio/pull/8066) [`624f9b9`](https://github.com/gradio-app/gradio/commit/624f9b9477f74a581a6c14119234f9efdfcda398) - make gradio dev tools a local dependency rather than bundling.  Thanks @pngwn!

### Dependency updates

- @gradio/atoms@0.7.1
- @gradio/client@0.17.0
- @gradio/audio@0.10.0
- @gradio/image@0.10.0
- @gradio/markdown@0.7.0
- @gradio/statustracker@0.5.0
- @gradio/video@0.7.0
- @gradio/upload@0.9.0
- @gradio/utils@0.4.0

## 0.8.3

### Features

- [#7998](https://github.com/gradio-app/gradio/pull/7998) [`06bdf0e`](https://github.com/gradio-app/gradio/commit/06bdf0eddf59bf79b6b4d1268fc9290955ef2490) - Restore chatbot formatting.  Thanks @aliabid94!

### Fixes

- [#8025](https://github.com/gradio-app/gradio/pull/8025) [`55ef4a5`](https://github.com/gradio-app/gradio/commit/55ef4a52c3d600344d8cf1a667f3f352c52c8e57) - Fixes Chatbot Image Sizing.  Thanks @dawoodkhan82!

### Dependency updates

- @gradio/utils@0.3.2
- @gradio/statustracker@0.4.12
- @gradio/theme@0.2.2
- @gradio/client@0.16.0
- @gradio/upload@0.8.5
- @gradio/atoms@0.7.0
- @gradio/icons@0.4.0
- @gradio/audio@0.9.12
- @gradio/image@0.9.12
- @gradio/video@0.6.12
- @gradio/markdown@0.6.10

## 0.8.2

### Dependency updates

- @gradio/utils@0.3.1
- @gradio/atoms@0.6.2
- @gradio/statustracker@0.4.11
- @gradio/upload@0.8.4
- @gradio/image@0.9.11
- @gradio/markdown@0.6.9
- @gradio/theme@0.2.1
- @gradio/client@0.15.1
- @gradio/video@0.6.11
- @gradio/audio@0.9.11

## 0.8.1

### Dependency updates

- @gradio/upload@0.8.3
- @gradio/client@0.15.0
- @gradio/audio@0.9.10
- @gradio/image@0.9.10
- @gradio/video@0.6.10

## 0.8.0

### Features

- [#7849](https://github.com/gradio-app/gradio/pull/7849) [`7af3cd7`](https://github.com/gradio-app/gradio/commit/7af3cd7ccb8cc556fd2b290af0bed1c7ec07d174) - Adds a `placeholder` argument to `gr.Chatbot`.  Thanks @abidlabs!

### Dependency updates

- @gradio/atoms@0.6.1
- @gradio/statustracker@0.4.10
- @gradio/icons@0.3.4
- @gradio/upload@0.8.2
- @gradio/audio@0.9.9
- @gradio/image@0.9.9
- @gradio/video@0.6.9
- @gradio/markdown@0.6.8

## 0.7.8

### Dependency updates

- @gradio/upload@0.8.1
- @gradio/statustracker@0.4.9
- @gradio/atoms@0.6.0
- @gradio/audio@0.9.8
- @gradio/image@0.9.8
- @gradio/video@0.6.8
- @gradio/markdown@0.6.7

## 0.7.7

### Dependency updates

- @gradio/client@0.14.0
- @gradio/upload@0.8.0
- @gradio/markdown@0.6.6
- @gradio/audio@0.9.7
- @gradio/image@0.9.7
- @gradio/video@0.6.7

## 0.7.6

### Dependency updates

- @gradio/upload@0.7.7
- @gradio/client@0.13.0
- @gradio/audio@0.9.6
- @gradio/image@0.9.6
- @gradio/video@0.6.6

## 0.7.5

### Patch Changes

- Updated dependencies [[`8181695`](https://github.com/gradio-app/gradio/commit/8181695e70187e8bc2bf7518697098c8d1b9843d)]:
  - @gradio/upload@0.7.6
  - @gradio/audio@0.9.5
  - @gradio/image@0.9.5
  - @gradio/video@0.6.5

## 0.7.4

### Features

- [#7528](https://github.com/gradio-app/gradio/pull/7528) [`eda33b3`](https://github.com/gradio-app/gradio/commit/eda33b3763897a542acf298e523fa493dc655aee) - Refactors `get_fetchable_url_or_file()` to remove it from the frontend. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.7.3

### Patch Changes

- Updated dependencies [[`98a2719`](https://github.com/gradio-app/gradio/commit/98a2719bfb9c64338caf9009891b6c6b0b33ea89)]:
  - @gradio/statustracker@0.4.8
  - @gradio/audio@0.9.3
  - @gradio/image@0.9.3
  - @gradio/markdown@0.6.5
  - @gradio/video@0.6.3

## 0.7.2

### Patch Changes

- Updated dependencies [[`f191786`](https://github.com/gradio-app/gradio/commit/f1917867916647d383b8d7ce15e0c17f2abbdec1)]:
  - @gradio/audio@0.9.2
  - @gradio/icons@0.3.3
  - @gradio/atoms@0.5.3
  - @gradio/image@0.9.2
  - @gradio/statustracker@0.4.7
  - @gradio/upload@0.7.4
  - @gradio/video@0.6.2
  - @gradio/markdown@0.6.4

## 0.7.1

### Patch Changes

- Updated dependencies [[`17fb116`](https://github.com/gradio-app/gradio/commit/17fb116492f951ab66e3a39b5fdfb598f5446b6f), [`065c5b1`](https://github.com/gradio-app/gradio/commit/065c5b163c4badb9d9cbd06d627fb4ba086003e7), [`32b317f`](https://github.com/gradio-app/gradio/commit/32b317f24e3d43f26684bb9f3964f31efd0ea556)]:
  - @gradio/markdown@0.6.3
  - @gradio/utils@0.3.0
  - @gradio/client@0.12.1
  - @gradio/atoms@0.5.2
  - @gradio/audio@0.9.1
  - @gradio/image@0.9.1
  - @gradio/statustracker@0.4.6
  - @gradio/upload@0.7.3
  - @gradio/video@0.6.1

## 0.7.0

### Features

- [#7183](https://github.com/gradio-app/gradio/pull/7183) [`49d9c48`](https://github.com/gradio-app/gradio/commit/49d9c48537aa706bf72628e3640389470138bdc6) - [WIP] Refactor file normalization to be in the backend and remove it from the frontend of each component. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.6.4

### Patch Changes

- Updated dependencies [[`e5344ba`](https://github.com/gradio-app/gradio/commit/e5344ba0cd63d21dbb525330bbc07ca2eca57832), [`572e360`](https://github.com/gradio-app/gradio/commit/572e360fff4a03c335b86e1a7517a44cb6af2bcd), [`ded5256`](https://github.com/gradio-app/gradio/commit/ded5256c4a39a84155b9c3d7f4e8e7060d798186), [`733ca26`](https://github.com/gradio-app/gradio/commit/733ca266bb1ba9049ed7309b8f0614199682e173), [`68a54a7`](https://github.com/gradio-app/gradio/commit/68a54a7a310d8d7072fdae930bf1cfdf12c45a7f), [`2e6672c`](https://github.com/gradio-app/gradio/commit/2e6672c815e39fd6af78353e66661100b9102cd4), [`fdd1521`](https://github.com/gradio-app/gradio/commit/fdd15213c24b9cbc58bbc1b6beb4af7c18f48557), [`200e251`](https://github.com/gradio-app/gradio/commit/200e2518e4d449aa82819a8d119e912bd1d95c15), [`c3e61e4`](https://github.com/gradio-app/gradio/commit/c3e61e4f70696a71aede67b65d28447eb67daf16), [`e3217b4`](https://github.com/gradio-app/gradio/commit/e3217b41862925a6a05f44070ac2bdabbeee6769), [`8dd6f4b`](https://github.com/gradio-app/gradio/commit/8dd6f4bc1901792f05cd59e86df7b1dbab692739)]:
  - @gradio/markdown@0.6.2
  - @gradio/upload@0.7.1
  - @gradio/audio@0.8.1
  - @gradio/image@0.8.0
  - @gradio/client@0.11.0
  - @gradio/utils@0.2.2
  - @gradio/video@0.5.1
  - @gradio/atoms@0.5.1
  - @gradio/statustracker@0.4.5

## 0.6.3

### Patch Changes

- Updated dependencies [[`5727b92`](https://github.com/gradio-app/gradio/commit/5727b92abc8a00a675bfc0a921b38de771af947b), [`ca8753b`](https://github.com/gradio-app/gradio/commit/ca8753bb3d829d0077f758ba8d0ddc866ff74d3d), [`bc2cdc1`](https://github.com/gradio-app/gradio/commit/bc2cdc1df95b38025486cf76df4a494b66d98585), [`c35fac0`](https://github.com/gradio-app/gradio/commit/c35fac049a44b14719509443c68690e7f23ce70d), [`c60ad4d`](https://github.com/gradio-app/gradio/commit/c60ad4d34ab5b56a89bf6796822977e51e7a4a32), [`13cb6af`](https://github.com/gradio-app/gradio/commit/13cb6af8b23be063d85b2c632f36afa37d874e5d), [`e8b2d8b`](https://github.com/gradio-app/gradio/commit/e8b2d8b2f81b7c4b2d107765f06eaf09a030f1df)]:
  - @gradio/utils@0.2.1
  - @gradio/markdown@0.6.1
  - @gradio/audio@0.8.0
  - @gradio/upload@0.7.0
  - @gradio/video@0.5.0
  - @gradio/atoms@0.5.0
  - @gradio/image@0.7.1
  - @gradio/statustracker@0.4.4

## 0.6.2

### Patch Changes

- Updated dependencies [[`3c3cf86`](https://github.com/gradio-app/gradio/commit/3c3cf8618a8cad1ef66a7f96664923d2c9f5e0e2), [`9cefd2e`](https://github.com/gradio-app/gradio/commit/9cefd2e90a1d0cc4d3e4e953fc5b9b1a7afb68dd), [`6be3c2c`](https://github.com/gradio-app/gradio/commit/6be3c2c47a616c904c8497d1fbef7a851c54d488), [`3f139c7`](https://github.com/gradio-app/gradio/commit/3f139c7c995f749562bb007d2a567bb167669de9)]:
  - @gradio/client@0.10.1
  - @gradio/image@0.7.0
  - @gradio/video@0.4.0
  - @gradio/upload@0.6.1
  - @gradio/audio@0.7.2

## 0.6.1

### Fixes

- [#6958](https://github.com/gradio-app/gradio/pull/6958) [`0f0498b`](https://github.com/gradio-app/gradio/commit/0f0498bf97a036efe47d01b47c4b26000d8d1df3) - Ensure Chatbot theme text size is set correctly. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.6.0

### Features

- [#6897](https://github.com/gradio-app/gradio/pull/6897) [`fb9c6ca`](https://github.com/gradio-app/gradio/commit/fb9c6cacd7ca4598c000f1f97d7d39a8c4463519) - Lite: Chatbot. Thanks [@whitphx](https://github.com/whitphx)!
- [#6900](https://github.com/gradio-app/gradio/pull/6900) [`4511d57`](https://github.com/gradio-app/gradio/commit/4511d57c46bf82c48e8e575040ff7dab528b8d51) - Fix the aria-label attrs in `gr.Chatbot()`. Thanks [@whitphx](https://github.com/whitphx)!

### Fixes

- [#6899](https://github.com/gradio-app/gradio/pull/6899) [`bd11d6e`](https://github.com/gradio-app/gradio/commit/bd11d6e570755405eac637f1ef71b8d7be09ff67) - Remove the styles on the audio elements in the Chatbot component. Thanks [@whitphx](https://github.com/whitphx)!

## 0.5.6

### Patch Changes

- Updated dependencies [[`d406855`](https://github.com/gradio-app/gradio/commit/d4068557953746662235d595ec435c42ceb24414)]:
  - @gradio/client@0.9.4
  - @gradio/upload@0.5.7

## 0.5.5

### Patch Changes

- Updated dependencies [[`846d52d`](https://github.com/gradio-app/gradio/commit/846d52d1c92d429077382ce494eea27fd062d9f6), [`828fb9e`](https://github.com/gradio-app/gradio/commit/828fb9e6ce15b6ea08318675a2361117596a1b5d), [`f3abde8`](https://github.com/gradio-app/gradio/commit/f3abde80884d96ad69b825020c46486d9dd5cac5), [`73268ee`](https://github.com/gradio-app/gradio/commit/73268ee2e39f23ebdd1e927cb49b8d79c4b9a144)]:
  - @gradio/markdown@0.6.0
  - @gradio/client@0.9.3
  - @gradio/statustracker@0.4.3
  - @gradio/atoms@0.4.1
  - @gradio/upload@0.5.6

## 0.5.4

### Patch Changes

- Updated dependencies [[`245d58e`](https://github.com/gradio-app/gradio/commit/245d58eff788e8d44a59d37a2d9b26d0f08a62b4)]:
  - @gradio/client@0.9.2
  - @gradio/upload@0.5.5

## 0.5.3

### Patch Changes

- Updated dependencies [[`5d51fbc`](https://github.com/gradio-app/gradio/commit/5d51fbce7826da840a2fd4940feb5d9ad6f1bc5a), [`34f9431`](https://github.com/gradio-app/gradio/commit/34f943101bf7dd6b8a8974a6131c1ed7c4a0dac0)]:
  - @gradio/upload@0.5.4
  - @gradio/client@0.9.1

## 0.5.2

### Features

- [#6399](https://github.com/gradio-app/gradio/pull/6399) [`053bec9`](https://github.com/gradio-app/gradio/commit/053bec98be1127e083414024e02cf0bebb0b5142) - Improve CSS token documentation in Storybook. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.5.1

### Fixes

- [#6574](https://github.com/gradio-app/gradio/pull/6574) [`2b625ad`](https://github.com/gradio-app/gradio/commit/2b625ad9403c3449b34a8a3da68ae48c4347c2db) - Ensure Chatbot messages are properly aligned when `rtl` is true. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#6572](https://github.com/gradio-app/gradio/pull/6572) [`206af31`](https://github.com/gradio-app/gradio/commit/206af31d7c1a31013364a44e9b40cf8df304ba50) - Improve like/dislike functionality. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.5.0

### Features

- [#6537](https://github.com/gradio-app/gradio/pull/6537) [`6d3fecfa4`](https://github.com/gradio-app/gradio/commit/6d3fecfa42dde1c70a60c397434c88db77289be6) - chore(deps): update all non-major dependencies. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.4.8

### Features

- [#6296](https://github.com/gradio-app/gradio/pull/6296) [`46f13f496`](https://github.com/gradio-app/gradio/commit/46f13f4968c8177e318c9d75f2eed1ed55c2c042) - chore(deps): update all non-major dependencies. Thanks [@renovate](https://github.com/apps/renovate)!

## 0.4.7

### Patch Changes

- Updated dependencies [[`9caddc17b`](https://github.com/gradio-app/gradio/commit/9caddc17b1dea8da1af8ba724c6a5eab04ce0ed8)]:
  - @gradio/atoms@0.3.0
  - @gradio/icons@0.3.0
  - @gradio/statustracker@0.4.0
  - @gradio/upload@0.5.0
  - @gradio/markdown@0.3.3

## 0.4.6

### Patch Changes

- Updated dependencies [[`2f805a7dd`](https://github.com/gradio-app/gradio/commit/2f805a7dd3d2b64b098f659dadd5d01258290521), [`f816136a0`](https://github.com/gradio-app/gradio/commit/f816136a039fa6011be9c4fb14f573e4050a681a)]:
  - @gradio/upload@0.4.2
  - @gradio/atoms@0.2.2
  - @gradio/icons@0.2.1
  - @gradio/markdown@0.3.2
  - @gradio/statustracker@0.3.2

## 0.4.5

### Fixes

- [#6386](https://github.com/gradio-app/gradio/pull/6386) [`e76a9e8fc`](https://github.com/gradio-app/gradio/commit/e76a9e8fcbbfc393298de2aa539f2b152c0d6400) - Fix Chatbot Pending Message Issues. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.4.4

### Patch Changes

- Updated dependencies [[`854b482f5`](https://github.com/gradio-app/gradio/commit/854b482f598e0dc47673846631643c079576da9c), [`f1409f95e`](https://github.com/gradio-app/gradio/commit/f1409f95ed39c5565bed6a601e41f94e30196a57)]:
  - @gradio/upload@0.4.0
  - @gradio/client@0.8.0

## 0.4.3

### Fixes

- [#6316](https://github.com/gradio-app/gradio/pull/6316) [`4b1011bab`](https://github.com/gradio-app/gradio/commit/4b1011bab03c0b6a09329e0beb9c1b17b2189878) - Maintain text selection in `Chatbot` button elements. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.4.2

### Patch Changes

- Updated dependencies [[`aaa55ce85`](https://github.com/gradio-app/gradio/commit/aaa55ce85e12f95aba9299445e9c5e59824da18e)]:
  - @gradio/upload@0.3.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`2ba14b284`](https://github.com/gradio-app/gradio/commit/2ba14b284f908aa13859f4337167a157075a68eb)]:
  - @gradio/client@0.7.1
  - @gradio/upload@0.3.1

## 0.4.0

### Features

- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - fix circular dependency with client + upload. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Clean root url. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Fix selectable prop in the backend. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Image v4. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Publish all components to npm. Thanks [@pngwn](https://github.com/pngwn)!
- [#5498](https://github.com/gradio-app/gradio/pull/5498) [`287fe6782`](https://github.com/gradio-app/gradio/commit/287fe6782825479513e79a5cf0ba0fbfe51443d7) - Custom components. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0-beta.9

### Features

- [#6143](https://github.com/gradio-app/gradio/pull/6143) [`e4f7b4b40`](https://github.com/gradio-app/gradio/commit/e4f7b4b409323b01aa01b39e15ce6139e29aa073) - fix circular dependency with client + upload. Thanks [@pngwn](https://github.com/pngwn)!
- [#6136](https://github.com/gradio-app/gradio/pull/6136) [`667802a6c`](https://github.com/gradio-app/gradio/commit/667802a6cdbfb2ce454a3be5a78e0990b194548a) - JS Component Documentation. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!
- [#6094](https://github.com/gradio-app/gradio/pull/6094) [`c476bd5a5`](https://github.com/gradio-app/gradio/commit/c476bd5a5b70836163b9c69bf4bfe068b17fbe13) - Image v4. Thanks [@pngwn](https://github.com/pngwn)!
- [#6135](https://github.com/gradio-app/gradio/pull/6135) [`bce37ac74`](https://github.com/gradio-app/gradio/commit/bce37ac744496537e71546d2bb889bf248dcf5d3) - Fix selectable prop in the backend. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.4.0-beta.8

### Features

- [#6016](https://github.com/gradio-app/gradio/pull/6016) [`83e947676`](https://github.com/gradio-app/gradio/commit/83e947676d327ca2ab6ae2a2d710c78961c771a0) - Format js in v4 branch. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

### Fixes

- [#6046](https://github.com/gradio-app/gradio/pull/6046) [`dbb7de5e0`](https://github.com/gradio-app/gradio/commit/dbb7de5e02c53fee05889d696d764d212cb96c74) - fix tests. Thanks [@pngwn](https://github.com/pngwn)!

## 0.4.0-beta.7

### Features

- [#5960](https://github.com/gradio-app/gradio/pull/5960) [`319c30f3f`](https://github.com/gradio-app/gradio/commit/319c30f3fccf23bfe1da6c9b132a6a99d59652f7) - rererefactor frontend files. Thanks [@pngwn](https://github.com/pngwn)!
- [#5938](https://github.com/gradio-app/gradio/pull/5938) [`13ed8a485`](https://github.com/gradio-app/gradio/commit/13ed8a485d5e31d7d75af87fe8654b661edcca93) - V4: Use beta release versions for '@gradio' packages. Thanks [@freddyaboulton](https://github.com/freddyaboulton)!

## 0.5.3

### Fixes

- [#5827](https://github.com/gradio-app/gradio/pull/5827) [`48e09ee88`](https://github.com/gradio-app/gradio/commit/48e09ee88799efa38a5cc9b1b61e462f72ec6093) - Quick fix: Chatbot change event. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.5.2

### Patch Changes

- Updated dependencies [[`e4a307ed6`](https://github.com/gradio-app/gradio/commit/e4a307ed6cde3bbdf4ff2f17655739addeec941e)]:
  - @gradio/theme@0.2.0
  - @gradio/utils@0.1.2
  - @gradio/atoms@0.1.4
  - @gradio/markdown@0.3.1
  - @gradio/statustracker@0.2.2
  - @gradio/upload@0.3.2

## 0.5.1

### Fixes

- [#5775](https://github.com/gradio-app/gradio/pull/5775) [`e2874bc3c`](https://github.com/gradio-app/gradio/commit/e2874bc3cb1397574f77dbd7f0408ed4e6792970) - fix pending chatbot message styling and ensure messages with value `None` don't render. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.5.0

### Features

- [#5699](https://github.com/gradio-app/gradio/pull/5699) [`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2) - Improve chatbot accessibility and UX. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5755](https://github.com/gradio-app/gradio/pull/5755) [`e842a561a`](https://github.com/gradio-app/gradio/commit/e842a561af4394f8109291ee5725bcf74743e816) - Fix new line issue in chatbot. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.4.1

### Patch Changes

- Updated dependencies [[`ee8eec1e5`](https://github.com/gradio-app/gradio/commit/ee8eec1e5e544a0127e0aa68c2522a7085b8ada5)]:
  - @gradio/markdown@0.2.2

## 0.4.0

### Features

- [#5671](https://github.com/gradio-app/gradio/pull/5671) [`6a36c3b78`](https://github.com/gradio-app/gradio/commit/6a36c3b786700600d3826ce1e0629cc5308ddd47) - chore(deps): update dependency @types/prismjs to v1.26.1. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5604](https://github.com/gradio-app/gradio/pull/5604) [`faad01f8e`](https://github.com/gradio-app/gradio/commit/faad01f8e10ef6d18249b1a4587477c59b74adb2) - Add `render_markdown` parameter to chatbot. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5593](https://github.com/gradio-app/gradio/pull/5593) [`88d43bd12`](https://github.com/gradio-app/gradio/commit/88d43bd124792d216da445adef932a2b02f5f416) - Fixes avatar image in chatbot being squashed. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.3.2

### Fixes

- [#5470](https://github.com/gradio-app/gradio/pull/5470) [`a4e010a9`](https://github.com/gradio-app/gradio/commit/a4e010a96f1d8a52b3ac645e03fe472b9c3cbbb1) - Fix share button position. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.3.1

### Patch Changes

- Updated dependencies [[`afac0006`](https://github.com/gradio-app/gradio/commit/afac0006337ce2840cf497cd65691f2f60ee5912)]:
  - @gradio/markdown@0.2.0
  - @gradio/statustracker@0.2.0
  - @gradio/theme@0.1.0
  - @gradio/utils@0.1.1
  - @gradio/atoms@0.1.2
  - @gradio/upload@0.2.1

## 0.3.0

### Highlights

#### Like/Dislike Button for Chatbot ([#5391](https://github.com/gradio-app/gradio/pull/5391) [`abf1c57d`](https://github.com/gradio-app/gradio/commit/abf1c57d7d85de0df233ee3b38aeb38b638477db))

Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Features

- [#5334](https://github.com/gradio-app/gradio/pull/5334) [`c5bf9138`](https://github.com/gradio-app/gradio/commit/c5bf91385a632dc9f612499ee01166ac6ae509a9) - Add chat bubble width param. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Fixes

- [#5304](https://github.com/gradio-app/gradio/pull/5304) [`05892302`](https://github.com/gradio-app/gradio/commit/05892302fb8fe2557d57834970a2b65aea97355b) - Adds kwarg to disable html sanitization in `gr.Chatbot()`. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!
- [#5366](https://github.com/gradio-app/gradio/pull/5366) [`0cc7e2dc`](https://github.com/gradio-app/gradio/commit/0cc7e2dcf60e216e0a30e2f85a9879ce3cb2a1bd) - Hide avatar when message none. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.2.2

### Fixes

- [#5319](https://github.com/gradio-app/gradio/pull/5319) [`3341148c`](https://github.com/gradio-app/gradio/commit/3341148c109b5458cc88435d27eb154210efc472) - Fix: wrap avatar-image in a div to clip its shape. Thanks [@Keldos-Li](https://github.com/Keldos-Li)!

## 0.2.1

### Patch Changes

- Updated dependencies [[`31996c99`](https://github.com/gradio-app/gradio/commit/31996c991d6bfca8cef975eb8e3c9f61a7aced19)]:
  - @gradio/markdown@0.1.1

## 0.2.0

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

### Features

- [#5215](https://github.com/gradio-app/gradio/pull/5215) [`fbdad78a`](https://github.com/gradio-app/gradio/commit/fbdad78af4c47454cbb570f88cc14bf4479bbceb) - Lazy load interactive or static variants of a component individually, rather than loading both variants regardless. This change will improve performance for many applications. Thanks [@pngwn](https://github.com/pngwn)!
- [#5112](https://github.com/gradio-app/gradio/pull/5112) [`1cefee7f`](https://github.com/gradio-app/gradio/commit/1cefee7fc05175aca23ba04b3a3fda7b97f49bf0) - chore(deps): update dependency marked to v7. Thanks [@renovate](https://github.com/apps/renovate)!
- [#5258](https://github.com/gradio-app/gradio/pull/5258) [`92282cea`](https://github.com/gradio-app/gradio/commit/92282cea6afdf7e9930ece1046d8a63be34b3cea) - Chatbot Avatar Images. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

### Fixes

- [#5242](https://github.com/gradio-app/gradio/pull/5242) [`2b397791`](https://github.com/gradio-app/gradio/commit/2b397791fe2059e4beb72937ff0436f2d4d28b4b) - Fix message text overflow onto copy button in `gr.Chatbot`. Thanks [@hannahblair](https://github.com/hannahblair)!
- [#5285](https://github.com/gradio-app/gradio/pull/5285) [`cdfd4217`](https://github.com/gradio-app/gradio/commit/cdfd42174a9c777eaee9c1209bf8e90d8c7791f2) - Tweaks to `icon` parameter in `gr.Button()`. Thanks [@abidlabs](https://github.com/abidlabs)!
- [#5122](https://github.com/gradio-app/gradio/pull/5122) [`3b805346`](https://github.com/gradio-app/gradio/commit/3b8053469aca6c7a86a6731e641e4400fc34d7d3) - Allows code block in chatbot to scroll horizontally. Thanks [@dawoodkhan82](https://github.com/dawoodkhan82)!

## 0.1.0

### Features

- [#5125](https://github.com/gradio-app/gradio/pull/5125) [`80be7a1c`](https://github.com/gradio-app/gradio/commit/80be7a1ca44c0adef1668367b2cf36b65e52e576) - chatbot conversation nodes can contain a copy button. Thanks [@fazpu](https://github.com/fazpu)!
- [#5137](https://github.com/gradio-app/gradio/pull/5137) [`22aa5eba`](https://github.com/gradio-app/gradio/commit/22aa5eba3fee3f14473e4b0fac29cf72fe31ef04) - Use font size `--text-md` for `<code>` in Chatbot messages. Thanks [@jaywonchung](https://github.com/jaywonchung)!

## 0.0.2

### Patch Changes

- Updated dependencies [[`41c83070`](https://github.com/gradio-app/gradio/commit/41c83070b01632084e7d29123048a96c1e261407)]:
  - @gradio/theme@0.0.2
  - @gradio/utils@0.0.2
  - @gradio/atoms@0.0.2
  - @gradio/upload@0.0.2