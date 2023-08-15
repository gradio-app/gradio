---
"gradio": patch
---

fix:Improve audio streaming

This PR improves audio streaming in two ways:

1. Proper audio streaming with WAV files. We now do the proper processing to stream out wav files as a single stream of audio without any cracks in the seams.
2. Audio streaming with bytes. Stream any audio type by yielding out bytes, and it should work flawlessly.
