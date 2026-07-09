---
"@gradio/client": patch
---

Fix a flash of the login page when server-side rendering an app whose `/info` endpoint is unreachable: `Client.connect` no longer rejects when fetching API info fails.
