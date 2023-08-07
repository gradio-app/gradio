---
"@gradio/app": minor
"gradio": minor
"gradio_client": minor
---

highlight:

#### Client.predict will now return the final output for streaming endpoints

### This is a breaking change (for gradio_client only)!

Previously, `Client.predict` would only return the first output of an endpoint that streamed results. This was causing confusion for developers that wanted to call these streaming demos via the client.

We realize that developers using the client don't know the internals of whether a demo streams or not, so we're changing the behavior of predict to match developer expectations. 

Using `Client.predict` will now return the final output of a streaming endpoint. This will make it even easier to use gradio apps via the client.