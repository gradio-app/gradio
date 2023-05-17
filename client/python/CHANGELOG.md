# Upcoming Release

## New Features:

## Bug Fixes:
- Fixes parameter names not showing underscores by [@abidlabs](https://github.com/abidlabs) in [PR 4230](https://github.com/gradio-app/gradio/pull/4230)
- Fixes issue in which state was not handled correctly if `serialize=False` by [@abidlabs](https://github.com/abidlabs) in [PR 4230](https://github.com/gradio-app/gradio/pull/4230)

## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

# 0.2.4

## Bug Fixes:
- Fixes missing serialization classes for several components: `Barplot`, `Lineplot`, `Scatterplot`, `AnnotatedImage`, `Interpretation` by [@abidlabs](https://github.com/abidlabs) in [PR 4167](https://github.com/gradio-app/gradio/pull/4167)

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

# 0.2.3

## New Features:

No changes to highlight.

## Bug Fixes:
- Fix example inputs for `gr.File(file_count='multiple')` output components by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4153](https://github.com/gradio-app/gradio/pull/4153)

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

# 0.2.2

## New Features:

No changes to highlight.

## Bug Fixes:

- Only send request to `/info` route if demo version is above `3.28.3` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4109](https://github.com/gradio-app/gradio/pull/4109)


## Other Changes:

- Fix bug in test from gradio 3.29.0 refactor by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 4138](https://github.com/gradio-app/gradio/pull/4138)


## Breaking Changes:

No changes to highlight.


# 0.2.1

## New Features:

No changes to highlight.

## Bug Fixes:

Removes extraneous `State` component info from the `Client.view_api()` method by [@abidlabs](https://github.com/freddyaboulton) in [PR 4107](https://github.com/gradio-app/gradio/pull/4107)

## Documentation Changes:

No changes to highlight.

## Testing and Infrastructure Changes:

Separates flaky tests from non-flaky tests by [@abidlabs](https://github.com/freddyaboulton) in [PR 4107](https://github.com/gradio-app/gradio/pull/4107)


## Breaking Changes:

No changes to highlight.

## Full Changelog:

No changes to highlight.

## Contributors Shoutout:

No changes to highlight.

# 0.1.4

## New Features:

- Progress Updates from `gr.Progress()` can be accessed via `job.status().progress_data` by @freddyaboulton](https://github.com/freddyaboulton) in [PR 3924](https://github.com/gradio-app/gradio/pull/3924)

## Bug Fixes:

- Fixed bug where unnamed routes where displayed with `api_name` instead of `fn_index` in `view_api` by [@freddyaboulton](https://github.com/freddyaboulton) in [PR 3972](https://github.com/gradio-app/gradio/pull/3972)

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