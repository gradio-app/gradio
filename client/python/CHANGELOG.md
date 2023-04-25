# Upcoming Release

## New Features:

- Progress Updates from `gr.Progress()` can be accessed via `job.status().progress_data` by @freddyaboulton](https://github.com/freddyaboulton) in [PR 3924](https://github.com/gradio-app/gradio/pull/3924)

## Bug Fixes:

No changes to highlight.

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# 0.1.3

## New Features:

No changes to highlight.

## Bug Fixes:

- Fixed bug where `Video` components in latest gradio were not able to be deserialized by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3860](https://github.com/gradio-app/gradio/pull/3860)

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

No changes to highlight.

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

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