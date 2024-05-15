# Building Serverless Machine Learning Apps with Gradio-Lite and Transformers.js

Tags: SERVERLESS, BROWSER, PYODIDE, TRANSFORMERS

Gradio and [Transformers](https://huggingface.co/docs/transformers/index) are a powerful combination for building machine learning apps with a web interface. Both libraries have serverless versions that can run entirely in the browser: [Gradio-Lite](./gradio-lite) and [Transformers.js](https://huggingface.co/docs/transformers.js/index).
In this document, we will introduce how to create a serverless machine learning application using Gradio-Lite and Transformers.js.
You will just write Python code within a static HTML file and host it without setting up a server-side Python runtime.


## Libraries Used

### Gradio-Lite

Gradio-Lite is the serverless version of Gradio, allowing you to build serverless web UI applications by embedding Python code within HTML. For a detailed introduction to Gradio-Lite itself, please read [this Guide](./gradio-lite).

### Transformers.js and Transformers.js.py

Transformers.js is the JavaScript version of the Transformers library that allows you to run machine learning models entirely in the browser.
Since Transformers.js is a JavaScript library, it cannot be directly used from the Python code of Gradio-Lite applications. To address this, we use a wrapper library called [Transformers.js.py](https://github.com/whitphx/transformers.js.py).
The name Transformers.js.py may sound unusual, but it represents the necessary technology stack for using Transformers.js from Python code within a browser environment. The regular Transformers library is not compatible with browser environments.

## Sample Code

Here's an example of how to use Gradio-Lite and Transformers.js together.
Please create an HTML file and paste the following code:

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css" />
	</head>
	<body>
		<gradio-lite>
import gradio as gr
from transformers_js_py import pipeline

pipe = await pipeline('sentiment-analysis')

demo = gr.Interface.from_pipeline(pipe)

demo.launch()

			<gradio-requirements>
transformers-js-py
			</gradio-requirements>
		</gradio-lite>
	</body>
</html>
```

Here is a running example of the code above (after the app has loaded, you could disconnect your Internet connection and the app will still work since its running entirely in your browser):

<gradio-lite shared-worker>
import gradio as gr
from transformers_js_py import pipeline
<!-- --->
pipe = await pipeline('sentiment-analysis')
<!-- --->
demo = gr.Interface.from_pipeline(pipe)
<!-- --->
demo.launch()
<gradio-requirements>
transformers-js-py
</gradio-requirements>
</gradio-lite>

And you you can open your HTML file in a browser to see the Gradio app running!

The Python code inside the `<gradio-lite>` tag is the Gradio application code. For more details on this part, please refer to [this article](./gradio-lite).
The `<gradio-requirements>` tag is used to specify packages to be installed in addition to Gradio-Lite and its dependencies. In this case, we are using Transformers.js.py (`transformers-js-py`), so it is specified here.

Let's break down the code:

`pipe = await pipeline('sentiment-analysis')` creates a Transformers.js pipeline.
In this example, we create a sentiment analysis pipeline.
For more information on the available pipeline types and usage, please refer to the [Transformers.js documentation](https://huggingface.co/docs/transformers.js/index).

`demo = gr.Interface.from_pipeline(pipe)` creates a Gradio app instance. By passing the Transformers.js.py pipeline to `gr.Interface.from_pipeline()`, we can create an interface that utilizes that pipeline with predefined input and output components.

Finally, `demo.launch()` launches the created app.

## Customizing the Model or Pipeline

You can modify the line `pipe = await pipeline('sentiment-analysis')` in the sample above to try different models or tasks.

For example, if you change it to `pipe = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment')`, you can test the same sentiment analysis task but with a different model. The second argument of the `pipeline` function specifies the model name.
If it's not specified like in the first example, the default model is used. For more details on these specs, refer to the [Transformers.js documentation](https://huggingface.co/docs/transformers.js/index).

<gradio-lite shared-worker>
import gradio as gr
from transformers_js_py import pipeline
<!-- --->
pipe = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment')
<!-- --->
demo = gr.Interface.from_pipeline(pipe)
<!-- --->
demo.launch()
<gradio-requirements>
transformers-js-py
</gradio-requirements>
</gradio-lite>

As another example, changing it to `pipe = await pipeline('image-classification')` creates a pipeline for image classification instead of sentiment analysis.
In this case, the interface created with `demo = gr.Interface.from_pipeline(pipe)` will have a UI for uploading an image and displaying the classification result. The `gr.Interface.from_pipeline` function automatically creates an appropriate UI based on the type of pipeline.

<gradio-lite shared-worker>
import gradio as gr
from transformers_js_py import pipeline
<!-- --->
pipe = await pipeline('image-classification')
<!-- --->
demo = gr.Interface.from_pipeline(pipe)
<!-- --->
demo.launch()
<gradio-requirements>
transformers-js-py
</gradio-requirements>
</gradio-lite>

<br>

**Note**: If you use an audio pipeline, such as `automatic-speech-recognition`, you will need to put `transformers-js-py[audio]` in your `<gradio-requirements>` as there are additional requirements needed to process audio files.

## Customizing the UI

Instead of using `gr.Interface.from_pipeline()`, you can define the user interface using Gradio's regular API.
Here's an example where the Python code inside the `<gradio-lite>` tag has been modified from the previous sample:

```html
<html>
	<head>
		<script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css" />
	</head>
	<body>
		<gradio-lite>
import gradio as gr
from transformers_js_py import pipeline

pipe = await pipeline('sentiment-analysis')

async def fn(text):
	result = await pipe(text)
	return result

demo = gr.Interface(
	fn=fn,
	inputs=gr.Textbox(),
	outputs=gr.JSON(),
)

demo.launch()

			<gradio-requirements>
transformers-js-py
			</gradio-requirements>
		</gradio-lite>
	</body>
</html>
```

In this example, we modified the code to construct the Gradio user interface manually so that we could output the result as JSON.

<gradio-lite shared-worker>
import gradio as gr
from transformers_js_py import pipeline
<!-- --->
pipe = await pipeline('sentiment-analysis')
<!-- --->
async def fn(text):
	result = await pipe(text)
	return result
<!-- --->
demo = gr.Interface(
	fn=fn,
	inputs=gr.Textbox(),
	outputs=gr.JSON(),
)
<!-- --->
demo.launch()
<gradio-requirements>
transformers-js-py
</gradio-requirements>
</gradio-lite>

## Conclusion

By combining Gradio-Lite and Transformers.js (and Transformers.js.py), you can create serverless machine learning applications that run entirely in the browser.

Gradio-Lite provides a convenient method to create an interface for a given Transformers.js pipeline, `gr.Interface.from_pipeline()`.
This method automatically constructs the interface based on the pipeline's task type.

Alternatively, you can define the interface manually using Gradio's regular API, as shown in the second example.

By using these libraries, you can build and deploy machine learning applications without the need for server-side Python setup or external dependencies.
