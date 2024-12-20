# Getting Started with the Gradio JavaScript Client

Tags: CLIENT, API, SPACES

The Gradio JavaScript Client makes it very easy to use any Gradio app as an API. As an example, consider this [Hugging Face Space that transcribes audio files](https://huggingface.co/spaces/abidlabs/whisper) that are recorded from the microphone.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/whisper-screenshot.jpg)

Using the `@gradio/client` library, we can easily use the Gradio as an API to transcribe audio files programmatically.

Here's the entire code to do it:

```js
import { Client, handle_file } from "@gradio/client";

const response = await fetch(
	"https://github.com/audio-samples/audio-samples.github.io/raw/master/samples/wav/ted_speakers/SalmanKhan/sample-1.wav"
);
const audio_file = await response.blob();

const app = await Client.connect("abidlabs/whisper");
const transcription = await app.predict("/predict", [handle_file(audio_file)]);

console.log(transcription.data);
// [ "I said the same phrase 30 times." ]
```

The Gradio Client works with any hosted Gradio app, whether it be an image generator, a text summarizer, a stateful chatbot, a tax calculator, or anything else! The Gradio Client is mostly used with apps hosted on [Hugging Face Spaces](https://hf.space), but your app can be hosted anywhere, such as your own server.

**Prequisites**: To use the Gradio client, you do _not_ need to know the `gradio` library in great detail. However, it is helpful to have general familiarity with Gradio's concepts of input and output components.

## Installation via npm

Install the @gradio/client package to interact with Gradio APIs using Node.js version >=18.0.0 or in browser-based projects. Use npm or any compatible package manager:

```bash
npm i @gradio/client
```

This command adds @gradio/client to your project dependencies, allowing you to import it in your JavaScript or TypeScript files.

## Installation via CDN

For quick addition to your web project, you can use the jsDelivr CDN to load the latest version of @gradio/client directly into your HTML:

```html
<script type="module">
	import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
	...
</script>
```

Be sure to add this to the `<head>` of your HTML. This will install the latest version but we advise hardcoding the version in production. You can find all available versions [here](https://www.jsdelivr.com/package/npm/@gradio/client). This approach is ideal for experimental or prototying purposes, though has some limitations. A complete example would look like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <script type="module">
        import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";
        const client = await Client.connect("abidlabs/en2fr");
        const result = await client.predict("/predict", {
            text: "My name is Hannah"
        });
        console.log(result);
    </script>
</head>
</html>
```

## Connecting to a running Gradio App

Start by connecting instantiating a `client` instance and connecting it to a Gradio app that is running on Hugging Face Spaces or generally anywhere on the web.

## Connecting to a Hugging Face Space

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/en2fr"); // a Space that translates from English to French
```

You can also connect to private Spaces by passing in your HF token with the `hf_token` property of the options parameter. You can get your HF token here: https://huggingface.co/settings/tokens

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/my-private-space", { hf_token: "hf_..." })
```

## Duplicating a Space for private use

While you can use any public Space as an API, you may get rate limited by Hugging Face if you make too many requests. For unlimited usage of a Space, simply duplicate the Space to create a private Space, and then use it to make as many requests as you'd like! You'll need to pass in your [Hugging Face token](https://huggingface.co/settings/tokens)).

`Client.duplicate` is almost identical to `Client.connect`, the only difference is under the hood:

```js
import { Client, handle_file } from "@gradio/client";

const response = await fetch(
	"https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
);
const audio_file = await response.blob();

const app = await Client.duplicate("abidlabs/whisper", { hf_token: "hf_..." });
const transcription = await app.predict("/predict", [handle_file(audio_file)]);
```

If you have previously duplicated a Space, re-running `Client.duplicate` will _not_ create a new Space. Instead, the client will attach to the previously-created Space. So it is safe to re-run the `Client.duplicate` method multiple times with the same space.

**Note:** if the original Space uses GPUs, your private Space will as well, and your Hugging Face account will get billed based on the price of the GPU. To minimize charges, your Space will automatically go to sleep after 5 minutes of inactivity. You can also set the hardware using the `hardware` and `timeout` properties of `duplicate`'s options object like this:

```js
import { Client } from "@gradio/client";

const app = await Client.duplicate("abidlabs/whisper", {
	hf_token: "hf_...",
	timeout: 60,
	hardware: "a10g-small"
});
```

## Connecting a general Gradio app

If your app is running somewhere else, just provide the full URL instead, including the "http://" or "https://". Here's an example of making predictions to a Gradio app that is running on a share URL:

```js
import { Client } from "@gradio/client";

const app = Client.connect("https://bec81a83-5b5c-471e.gradio.live");
```

## Connecting to a Gradio app with auth

If the Gradio application you are connecting to [requires a username and password](/guides/sharing-your-app#authentication), then provide them as a tuple to the `auth` argument of the `Client` class:

```js
import { Client } from "@gradio/client";

Client.connect(
  space_name,
  { auth: [username, password] }
)
```


## Inspecting the API endpoints

Once you have connected to a Gradio app, you can view the APIs that are available to you by calling the `Client`'s `view_api` method.

For the Whisper Space, we can do this:

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/whisper");

const app_info = await app.view_api();

console.log(app_info);
```

And we will see the following:

```json
{
	"named_endpoints": {
		"/predict": {
			"parameters": [
				{
					"label": "text",
					"component": "Textbox",
					"type": "string"
				}
			],
			"returns": [
				{
					"label": "output",
					"component": "Textbox",
					"type": "string"
				}
			]
		}
	},
	"unnamed_endpoints": {}
}
```

This shows us that we have 1 API endpoint in this space, and shows us how to use the API endpoint to make a prediction: we should call the `.predict()` method (which we will explore below), providing a parameter `input_audio` of type `string`, which is a url to a file.

We should also provide the `api_name='/predict'` argument to the `predict()` method. Although this isn't necessary if a Gradio app has only 1 named endpoint, it does allow us to call different endpoints in a single app if they are available. If an app has unnamed API endpoints, these can also be displayed by running `.view_api(all_endpoints=True)`.

## The "View API" Page

As an alternative to running the `.view_api()` method, you can click on the "Use via API" link in the footer of the Gradio app, which shows us the same information, along with example usage. 

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/view-api.png)

The View API page also includes an "API Recorder" that lets you interact with the Gradio UI normally and converts your interactions into the corresponding code to run with the JS Client.


## Making a prediction

The simplest way to make a prediction is simply to call the `.predict()` method with the appropriate arguments:

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/en2fr");
const result = await app.predict("/predict", ["Hello"]);
```

If there are multiple parameters, then you should pass them as an array to `.predict()`, like this:

```js
import { Client } from "@gradio/client";

const app = await Client.connect("gradio/calculator");
const result = await app.predict("/predict", [4, "add", 5]);
```

For certain inputs, such as images, you should pass in a `Buffer`, `Blob` or `File` depending on what is most convenient. In node, this would be a `Buffer` or `Blob`; in a browser environment, this would be a `Blob` or `File`.

```js
import { Client, handle_file } from "@gradio/client";

const response = await fetch(
	"https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
);
const audio_file = await response.blob();

const app = await Client.connect("abidlabs/whisper");
const result = await app.predict("/predict", [handle_file(audio_file)]);
```

## Using events

If the API you are working with can return results over time, or you wish to access information about the status of a job, you can use the iterable interface for more flexibility. This is especially useful for iterative endpoints or generator endpoints that will produce a series of values over time as discrete responses.

```js
import { Client } from "@gradio/client";

function log_result(payload) {
	const {
		data: [translation]
	} = payload;

	console.log(`The translated result is: ${translation}`);
}

const app = await Client.connect("abidlabs/en2fr");
const job = app.submit("/predict", ["Hello"]);

for await (const message of job) {
	log_result(message);
}
```

## Status

The event interface also allows you to get the status of the running job by instantiating the client with the `events` options passing `status` and `data` as an array:


```ts
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/en2fr", {
	events: ["status", "data"]
});
```

This ensures that status messages are also reported to the client.

`status`es are returned as an object with the following attributes: `status` (a human readbale status of the current job, `"pending" | "generating" | "complete" | "error"`), `code` (the detailed gradio code for the job), `position` (the current position of this job in the queue), `queue_size` (the total queue size), `eta` (estimated time this job will complete), `success` (a boolean representing whether the job completed successfully), and `time` ( as `Date` object detailing the time that the status was generated).

```js
import { Client } from "@gradio/client";

function log_status(status) {
	console.log(
		`The current status for this job is: ${JSON.stringify(status, null, 2)}.`
	);
}

const app = await Client.connect("abidlabs/en2fr", {
	events: ["status", "data"]
});
const job = app.submit("/predict", ["Hello"]);

for await (const message of job) {
	if (message.type === "status") {
		log_status(message);
	}
}
```

## Cancelling Jobs

The job instance also has a `.cancel()` method that cancels jobs that have been queued but not started. For example, if you run:

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/en2fr");
const job_one = app.submit("/predict", ["Hello"]);
const job_two = app.submit("/predict", ["Friends"]);

job_one.cancel();
job_two.cancel();
```

If the first job has started processing, then it will not be canceled but the client will no longer listen for updates (throwing away the job). If the second job has not yet started, it will be successfully canceled and removed from the queue.

## Generator Endpoints

Some Gradio API endpoints do not return a single value, rather they return a series of values. You can listen for these values in real time using the iterable interface:

```js
import { Client } from "@gradio/client";

const app = await Client.connect("gradio/count_generator");
const job = app.submit(0, [9]);

for await (const message of job) {
	console.log(message.data);
}
```

This will log out the values as they are generated by the endpoint.

You can also cancel jobs that that have iterative outputs, in which case the job will finish immediately.

```js
import { Client } from "@gradio/client";

const app = await Client.connect("gradio/count_generator");
const job = app.submit(0, [9]);

for await (const message of job) {
	console.log(message.data);
}

setTimeout(() => {
	job.cancel();
}, 3000);
```
