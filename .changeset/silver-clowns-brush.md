---
"gradio": patch
---

fix:Improve audio streaming

- Proper audio streaming with WAV files. We now do the proper processing to stream out wav files as a single stream of audio without any cracks in the seams.
- Audio streaming with bytes. Stream any audio type by yielding out bytes, and it should work flawlessly.
