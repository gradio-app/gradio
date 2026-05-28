---
"gradio": patch
---

fix:Convert audio to int16 for all formats in `audio_to_file` so non-WAV outputs (mp3, flac, ogg) no longer encode as noise
