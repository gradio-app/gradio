# @gradio/upload

## 0.3.3

### Patch Changes

- Updated dependencies [[`e70805d54`](https://github.com/gradio-app/gradio/commit/e70805d54cc792452545f5d8eccc1aa0212a4695)]:
  - @gradio/atoms@0.2.0

## 0.3.2

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.1.4

## 0.3.1

### Patch Changes

- Updated dependencies [[`8f0fed857`](https://github.com/gradio-app/gradio/commit/8f0fed857d156830626eb48b469d54d211a582d2)]:
  - @gradio/icons@0.2.0
  - @gradio/atoms@0.1.3

## 0.3.0

### Features

- [#5554](https://github.com/gradio-app/gradio/pull/5554) [`75ddeb390`](https://github.com/gradio-app/gradio/commit/75ddeb390d665d4484667390a97442081b49a423) - Accessibility Improvements. Thanks [@hannahblair](https://github.com/hannahblair)!

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.1.2

## 0.2.0

### Features

- [#5373](https://github.com/gradio-app/gradio/pull/5373) [`79d8f9d8`](https://github.com/gradio-app/gradio/commit/79d8f9d891901683c5a1b7486efb44eab2478c96) - Adds `height` and `zoom_speed` parameters to `Model3D` component, as well as a button to reset the camera position. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.1.0

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

- [#5216](https://github.com/gradio-app/gradio/pull/5216) [`4b58ea6d`](https://github.com/gradio-app/gradio/commit/4b58ea6d98e7a43b3f30d8a4cb6f379bc2eca6a8) - Update i18n tokens and locale files. Thanks [@hannahblair](https://github.com/hannahblair)!

### Fixes

- [#5285](https://github.com/gradio-app/gradio/pull/5285) [`cdfd4217`](https://github.com/gradio-app/gradio/commit/cdfd42174a9c777eaee9c1209bf8e90d8c7791f2) - Tweaks to `icon` parameter in `gr.Button()`. Thanks [@abidlabs](https://github.com/abidlabs)!

## 0.0.3

### Fixes

- [#5077](https://github.com/gradio-app/gradio/pull/5077) [`667875b2`](https://github.com/gradio-app/gradio/commit/667875b2441753e74d25bd9d3c8adedd8ede11cd) - Live audio streaming output

highlight:

#### Now supports loading streamed outputs

Allows users to use generators to stream audio out, yielding consecutive chunks of audio. Requires `streaming=True` to be set on the output audio.

```python
import gradio as gr
from pydub import AudioSegment

def stream_audio(audio_file):
    audio = AudioSegment.from_mp3(audio_file)
    i = 0
    chunk_size = 3000

    while chunk_size*i < len(audio):
        chunk = audio[chunk_size*i:chunk_size*(i+1)]
        i += 1
        if chunk:
            file = f"/tmp/{i}.mp3"
            chunk.export(file, format="mp3")
            yield file

demo = gr.Interface(
    fn=stream_audio,
    inputs=gr.Audio(type="filepath", label="Audio file to stream"),
    outputs=gr.Audio(autoplay=True, streaming=True),
)

demo.queue().launch()
```

From the backend, streamed outputs are served from the `/stream/` endpoint instead of the `/file/` endpoint. Currently just used to serve audio streaming output. The output JSON will have `is_stream`: `true`, instead of `is_file`: `true` in the file data object. Thanks [@aliabid94](https://github.com/aliabid94)!

## 0.0.2

### Patch Changes

- Updated dependencies []:
  - @gradio/atoms@0.0.2
