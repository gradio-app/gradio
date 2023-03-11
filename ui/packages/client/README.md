# `@gradio/client`

A javascript client to call Gradio APIs.

**usage**

```ts
import { client } from "@gradio/client";

const app = client();

const prediction = app.predict(endpoint, payload);

// listen for predictions
prediction.on("data", (event: { data: Array<unknown>; type: "data" }) => {});

// listen for status updates
prediction.on("status", (event: { data: Status; type: "data" }) => {});

interface Status {
	status: "pending" | "error" | "complete" | "generating";
	size: number;
	position?: number;
	eta?: number;
	message?: string;
	progress?: Array<{
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}>;
}

// stop listening
prediction.off("data");

// cancel a prediction if it is a generator
prediction.cancel();

// chainable
const prediction_two = app
	.predict(endpoint, payload)
	.on("data", data_callback)
	.on("status", status_callback);
```
