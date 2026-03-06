---
"gradio": patch
---

fix: bypass HTTP loopback for non-queued MCP tool calls, calling `blocks.process_api()` directly to reduce latency
