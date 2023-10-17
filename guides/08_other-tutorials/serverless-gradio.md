# Running Gradio Serverless (Entirely in Your Browser)

Gradio is a popular Python library for creating interactive and customizable machine learning interfaces. Traditionally, Gradio applications have relied on server-side infrastructure to run, which can be a hurdle for developers looking for a more serverless solution. 

Enter Gradio-lite (`@gradio/lite`), a library that leverages Pyodide to bring Gradio directly to your browser. In this blog post, we'll explore what `@gradio/lite` is, how it works share some example code, and discuss the benefits it offers for running Gradio applications.


## What is `@gradio/lite`?

`@gradio/lite` is a JavaScript library that enables you to run Gradio applications directly within your web browser. It achieves this by utilizing Pyodide, a Python runtime for WebAssembly, which allows Python code to be executed in the browser environment. With `@gradio/lite`, you can **write regular Python code for your Gradio applications**, and they will **run seamlessly in the browser** without the need for server-side infrastructure.


## How Does @gradio/lite Work?

@gradio/lite leverages Pyodide's capabilities to execute Python code in the browser. When you create a Gradio application using @gradio/lite, your Python code, including model loading and inference, is translated into JavaScript-compatible code and executed directly within the user's browser.

## Getting Started

All right, let's take a look at some code! (Need to flesh this out)

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite@0.3.2/dist/lite.css" />
	</head>
	
    <div id="gradio-app"></div>

	<script type="module">
			createGradioApp({
				target: document.getElementById("gradio-app"),
				requirements: ['transformers-js-py'],
				code: `
from transformers_js import import_transformers_js
import gradio as gr

transformers = await import_transformers_js()
pipeline = transformers.pipeline
pipe = await pipeline('sentiment-analysis')

async def classify(text):
	return await pipe(text)

demo = gr.Interface(classify, "textbox", "json")
demo.launch()
`
			});
		</script>
</html>
```


## Benefits of Using `@gradio/lite`

### 1. Serverless Deployment
The primary advantage of @gradio/lite is that it eliminates the need for server infrastructure. This simplifies deployment, reduces server-related costs, and makes it easier to share your Gradio applications with others.

### 2. Low Latency
By running in the browser, @gradio/lite offers low-latency interactions for users. There's no need for data to travel to and from a server, resulting in faster responses and a smoother user experience.

### 3. Privacy and Security
Since all processing occurs within the user's browser, @gradio/lite enhances privacy and security. User data remains on their device, providing peace of mind regarding data handling.

### 4. Seamless Integration
@gradio/lite easily integrates with your existing Python-based machine learning projects. You can transition your Gradio applications to the browser without significant code changes, maintaining consistency in your development workflow.

