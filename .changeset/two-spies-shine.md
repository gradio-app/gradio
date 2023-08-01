---
"@gradio/app": minor
"gradio": minor
"gradio_client": minor
---

highlight:

#### Better Code Snippet for Streaming API Routes

Previously, the `View API` page would always use the `predict` method of the python client. However, this would only return the first output for routes that stream results.

API routes that stream results will now use the `submit` method as opposed to `predict`. This also highlights the new `wait` method of the python client, which lets block until a job is finished

```python
from gradio_client import Client

client = Client("http://localhost:7860/")
# This api route streams outputs
result = client.submit(
				1,	# int | float (numeric value between 1 and 10) in 'steps' Slider component
				api_name="/predict"
)
result.wait(timeout=None)

# Get the final output. outputs() returns a list of all streamed results.
print(result.outputs()[-1])
```