# Getting Started with the Gradio JavaScript client

Tags: CLIENT, API, SPACES

The Gradio JavaScript client makes it very easy to use any Gradio app as an API. As an example, consider this [Hugging Face Space that transcribes audio files](https://huggingface.co/spaces/abidlabs/whisper) that are recorded from the microphone.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/whisper-screenshot.jpg)

Using the `@gradio/client` library, we can easily use the Gradio as an API to transcribe audio files programmatically.

Here's the entire code to do it:

```js
import { client } from "@gradio/client";

const response = await fetch(
  "https://github.com/audio-samples/audio-samples.github.io/raw/master/samples/wav/ted_speakers/SalmanKhan/sample-1.wav"
);
const audio_file = await response.blob();

const app = await client("abidlabs/whisper");
const transcription = await app.predict("/predict", [audio_file]);

console.log(transcription.data);
// [ "I said the same phrase 30 times." ]
```

The Gradio client works with any hosted Gradio app, whether it be an image generator, a text summarizer, a stateful chatbot, a tax calculator, or anything else! The Gradio Client is mostly used with apps hosted on [Hugging Face Spaces](https://hf.space), but your app can be hosted anywhere, such as your own server.

**Prequisites**: To use the Gradio client, you do _not_ need to know the `gradio` library in great detail. However, it is helpful to have general familiarity with Gradio's concepts of input and output components.

## Installation

The lightweight `@gradio/client` package can be installed from the npm registry with a package manager of your choice and support node version 18 and above:

```bash
npm i @gradio/client
```

## Connecting to a running Gradio App

Start by connecting instantiating a `client` instance and connecting it to a Gradio app that is running on Hugging Face Spaces or generally anywhere on the web.

## Connecting to a Hugging Face Space

```js
import { client } from "@gradio/client";

const app = client("abidlabs/en2fr"); // a Space that translates from English to French
```

You can also connect to private Spaces by passing in your HF token with the `hf_token` property of the options parameter. You can get your HF token here: https://huggingface.co/settings/tokens

```js
import { client } from "@gradio/client";

const app = client("abidlabs/my-private-space", { hf_token="hf_..." })
```

## Duplicating a Space for private use

While you can use any public Space as an API, you may get rate limited by Hugging Face if you make too many requests. For unlimited usage of a Space, simply duplicate the Space to create a private Space, and then use it to make as many requests as you'd like!

The `@gradio/client` exports another function, `duplicate`, to make this process simple (you'll need to pass in your [Hugging Face token](https://huggingface.co/settings/tokens)).

`duplicate` is almost identical to `client`, the only difference is under the hood:

```js
import { client } from "@gradio/client";

const response = await fetch(
  "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
);
const audio_file = await response.blob();

const app = await duplicate("abidlabs/whisper", { hf_token: "hf_..." });
const transcription = app.predict("/predict", [audio_file]);
```

If you have previously duplicated a Space, re-running `duplicate` will _not_ create a new Space. Instead, the client will attach to the previously-created Space. So it is safe to re-run the `duplicate` method multiple times with the same space.

**Note:** if the original Space uses GPUs, your private Space will as well, and your Hugging Face account will get billed based on the price of the GPU. To minimize charges, your Space will automatically go to sleep after 5 minutes of inactivity. You can also set the hardware using the `hardware` and `timeout` properties of `duplicate`'s options object like this:

```js
import { client } from "@gradio/client";

const app = await duplicate("abidlabs/whisper", {
  hf_token: "hf_...",
  timeout: 60,
  hardware: "a10g-small",
});
```

## Connecting a general Gradio app

If your app is running somewhere else, just provide the full URL instead, including the "http://" or "https://". Here's an example of making predictions to a Gradio app that is running on a share URL:

```js
import { client } from "@gradio/client";

const app = client("https://bec81a83-5b5c-471e.gradio.live");
```

## Inspecting the API endpoints

Once you have connected to a Gradio app, you can view the APIs that are available to you by calling the `client`'s `view_api` method.

For the Whisper Space, we can do this:

```js
import { client } from "@gradio/client";

const app = await client("abidlabs/whisper");

const app_info = await app.view_info();

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

## Making a prediction

The simplest way to make a prediction is simply to call the `.predict()` method with the appropriate arguments:

```js
import { client } from "@gradio/client";

const app = await client("abidlabs/en2fr");
const result = await app.predict("/predict", ["Hello"]);
```

If there are multiple parameters, then you should pass them as an array to `.predict()`, like this:

```js
import { client } from "@gradio/client";

const app = await client("gradio/calculator");
const result = await app.predict("/predict", [4, "add", 5]);
```

For certain inputs, such as images, you should pass in a `Buffer`, `Blob` or `File` depending on what is most convenient. In node, this would be a `Buffer` or `Blob`; in a browser environment, this would be a `Blob` or `File`.

```js
import { client } from "@gradio/client";

const response = await fetch(
  "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
);
const audio_file = await response.blob();

const app = await client("abidlabs/whisper");
const result = await client.predict("/predict", [audio_file]);
```

## Using events

If the API you are working with can return results over time, or you wish to access information about the status of a job, you can use the event interface for more flexibility. This is especially useful for iterative endpoints or generator endpoints that will produce a series of values over time as discreet responses.

```js
import { client } from "@gradio/client";

function log_result(payload) {
  const {
    data: [translation],
  } = payload;

  console.log(`The translated result is: ${translation}`);
}

const app = await client("abidlabs/en2fr");
const job = app.submit("/predict", ["Hello"]);

job.on("data", log_result);
```

## Status

The event interface also allows you to get the status of the running job by listening to the `"status"` event. This returns an object with the following attributes: `status` (a human readbale status of the current job, `"pending" | "generating" | "complete" | "error"`), `code` (the detailed gradio code for the job), `position` (the current position of this job in the queue), `queue_size` (the total queue size), `eta` (estimated time this job will complete), `success` (a boolean representing whether the job completed successfully), and `time` ( as `Date` object detailing the time that the status was generated).

```js
import { client } from "@gradio/client";

function log_status(status) {
  console.log(
    `The current status for this job is: ${JSON.stringify(status, null, 2)}.`
  );
}

const app = await client("abidlabs/en2fr");
const job = app.submit("/predict", ["Hello"]);

job.on("status", log_status);
```

## Cancelling Jobs

The job instance also has a `.cancel()` method that cancels jobs that have been queued but not started. For example, if you run:

```js
import { client } from "@gradio/client";

const app = await client("abidlabs/en2fr");
const job_one = app.submit("/predict", ["Hello"]);
const job_two = app.submit("/predict", ["Friends"]);

job_one.cancel();
job_two.cancel();
```

If the first job has started processing, then it will not be canceled but the client will no longer listen for updates (throwing away the job). If the second job has not yet started, it will be successfully canceled and removed from the queue.

## Generator Endpoints

Some Gradio API endpoints do not return a single value, rather they return a series of values. You can listen for these values in real time using the event interface:

```js
import { client } from "@gradio/client";

const app = await client("gradio/count_generator");
const job = app.submit(0, [9]);

job.on("data", (data) => console.log(data));
```

This will log out the values as they are generated by the endpoint.

You can also cancel jobs that that have iterative outputs, in which case the job will finish immediately.

```js
import { client } from "@gradio/client";

const app = await client("gradio/count_generator");
const job = app.submit(0, [9]);

job.on("data", (data) => console.log(data));

setTimeout(() => {
  job.cancel();
}, 3000);
```
