## JavaScript Client Library

Interact with Gradio APIs using our JavaScript (and TypeScript) client.


## Installation

The Gradio JavaScript Client is available on npm as `@gradio/client`. You can install it as below:

```shell
npm i @gradio/client
```

Or, you can include it directly in your HTML via the jsDelivr CDN:

```shell
<script src="https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js"></script>
```

## Usage

The JavaScript Gradio Client exposes the Client class, `Client`, along with various other utility functions. `Client` is used to initialise and establish a connection to, or duplicate, a Gradio app. 

### `Client`

The Client function connects to the API of a hosted Gradio space and returns an object that allows you to make calls to that API.

The simplest example looks like this:

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const result = await app.predict("/predict");
```

This function accepts two arguments: `source` and `options`:

#### `source`

This is the url or name of the gradio app whose API you wish to connect to. This parameter is required and should always be a string. For example:

```ts
Client.connect("user/space-name");  
```

#### `options`

The options object can optionally be passed a second parameter. This object has two properties, `hf_token` and `status_callback`.

##### `hf_token`

This should be a Hugging Face personal access token and is required if you wish to make calls to a private gradio api. This option is optional and should be a string starting with `"hf_"`.

Example:

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name", { hf_token: "hf_..." });
```

##### `status_callback`

This should be a function which will notify you of the status of a space if it is not running. If the gradio API you are connecting to is not awake and running or is not hosted on Hugging Face space then this function will do nothing.

**Additional context**

Applications hosted on Hugging Face spaces can be in a number of different states. As spaces are a GitOps tool and will rebuild when new changes are pushed to the repository, they have various building, running and error states. If a space is not 'running' then the function passed as the `status_callback` will notify you of the current state of the space and the status of the space as it changes. Spaces that are building or sleeping can take longer than usual to respond, so you can use this information to give users feedback about the progress of their action.

```ts
import { Client, type SpaceStatus } from "@gradio/client";

const app = await Client.connect("user/space-name", {
	// The space_status parameter does not need to be manually annotated, this is just for illustration.
	space_status: (space_status: SpaceStatus) => console.log(space_status)
});
```

```ts
interface SpaceStatusNormal {
	status: "sleeping" | "running" | "building" | "error" | "stopped";
	detail:
		| "SLEEPING"
		| "RUNNING"
		| "RUNNING_BUILDING"
		| "BUILDING"
		| "NOT_FOUND";
	load_status: "pending" | "error" | "complete" | "generating";
	message: string;
}

interface SpaceStatusError {
	status: "space_error";
	detail: "NO_APP_FILE" | "CONFIG_ERROR" | "BUILD_ERROR" | "RUNTIME_ERROR";
	load_status: "error";
	message: string;
	discussions_enabled: boolean;

type SpaceStatus = SpaceStatusNormal | SpaceStatusError;
```

The gradio client returns an object with a number of methods and properties:

#### `predict`

The `predict` method allows you to call an api endpoint and get a prediction result:

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const result = await app.predict("/predict");
```

`predict` accepts two parameters, `endpoint` and `payload`. It returns a promise that resolves to the prediction result.

##### `endpoint`

This is the endpoint for an api request and is required. The default endpoint for a `gradio.Interface` is `"/predict"`. Explicitly named endpoints have a custom name. The endpoint names can be found on the "View API" page of a space.

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const result = await app.predict("/predict");
```

##### `payload`

The `payload` argument is generally required but this depends on the API itself. If the API endpoint depends on values being passed in then the argument is required for the API request to succeed. The data that should be passed in is detailed on the "View API" page of a space, or accessible via the `view_api()` method of the client.

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const result = await app.predict("/predict", {
	input: 1,
	word_1: "Hello",
	word_2: "friends"
});
```

#### `submit`

The `submit` method provides a more flexible way to call an API endpoint, providing you with status updates about the current progress of the prediction as well as supporting more complex endpoint types.

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const submission = app.submit("/predict", { name: "Chewbacca" });
```

The `submit` method accepts the same [`endpoint`](#endpoint) and [`payload`](#payload) arguments as `predict`.

The `submit` method does not return a promise and should not be awaited, instead it returns an async iterator with a  `cancel` method.

##### Accessing values

Iterating the submission allows you to access the events related to the submitted API request. There are two types of events that can be listened for: `"data"` updates and `"status"` updates. By default only the `"data"` event is reported, but you can listen for the `"status"` event by manually passing the events you care about when instantiating the client:

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name", {
	events: ["data", "status"]
});
```

`"data"` updates are issued when the API computes a value, the callback provided as the second argument will be called when such a value is sent to the client. The shape of the data depends on the way the API itself is constructed. This event may fire more than once if that endpoint supports emmitting new values over time.

`"status` updates are issued when the status of a request changes. This information allows you to offer feedback to users when the queue position of the request changes, or when the request changes from queued to processing.

The status payload look like this:

```ts
interface Status {
	queue: boolean;
	code?: string;
	success?: boolean;
	stage: "pending" | "error" | "complete" | "generating";
	size?: number;
	position?: number;
	eta?: number;
	message?: string;
	progress_data?: Array<{
		progress: number | null;
		index: number | null;
		length: number | null;
		unit: string | null;
		desc: string | null;
	}>;
	time?: Date;
}
```

Usage looks like this:

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const submission = app
	.submit("/predict", { name: "Chewbacca" })

	for await (const msg of submission) {
		if (msg.type === "data") {
			console.log(msg.data);
		}

		if (msg.type === "status") {
			console.log(msg);
		}
	}
```


##### `cancel`

Certain types of gradio function can run repeatedly and in some cases indefinitely. the `cancel` method will stop such an endpoints and prevent the API from issuing additional updates.

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const submission = app
	.submit("/predict", { name: "Chewbacca" })


// later

submission.cancel();
```

#### `view_api`

The `view_api` method provides details about the API you are connected to. It returns a JavaScript object of all named endpoints, unnamed endpoints and what values they accept and return. This method does not accept arguments.

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
const api_info = await app.view_api();

console.log(api_info);
```

#### `config`

The `config` property contains the configuration for the gradio application you are connected to. This object may contain useful meta information about the application.

```ts
import { Client } from "@gradio/client";

const app = await Client.connect("user/space-name");
console.log(app.config);
```

### `duplicate`

The duplicate function will attempt to duplicate the space that is referenced and return an instance of `client` connected to that space. If the space has already been duplicated then it will not create a new duplicate and will instead connect to the existing duplicated space. The huggingface token that is passed in will dictate the user under which the space is created.

`duplicate` accepts the same arguments as `client` with the addition of a `private` options property dictating whether the duplicated space should be private or public. A huggingface token is required for duplication to work.

```ts
import { Client } from "@gradio/client";

const app = await Client.duplicate("user/space-name", {
	hf_token: "hf_..."
});
```

This function accepts two arguments: `source` and `options`:

#### `source`

The space to duplicate and connect to. [See `client`'s `source` parameter](#source).

#### `options`

Accepts all options that `client` accepts, except `hf_token` is required. [See `client`'s `options` parameter](#source).

`duplicate` also accepts one additional `options` property.

##### `private`

This is an optional property specific to `duplicate`'s options object and will determine whether the space should be public or private. Spaces duplicated via the `duplicate` method are public by default.

```ts
import { Client } from "@gradio/client";

const app = await Client.duplicate("user/space-name", {
	hf_token: "hf_...",
	private: true
});
```

##### `timeout`

This is an optional property specific to `duplicate`'s options object and will set the timeout in minutes before the duplicated space will go to sleep.

```ts
import { Client } from "@gradio/client";

const app = await Client.duplicate("user/space-name", {
	hf_token: "hf_...",
	private: true,
	timeout: 5
});
```

##### `hardware`

This is an optional property specific to `duplicate`'s options object and will set the hardware for the duplicated space. By default the hardware used will match that of the original space. If this cannot be obtained it will default to `"cpu-basic"`. For hardware upgrades (beyond the basic CPU tier), you may be required to provide [billing information on Hugging Face](https://huggingface.co/settings/billing).

Possible hardware options are:

- `"cpu-basic"`
- `"cpu-upgrade"`
- `"cpu-xl"`
- `"t4-small"`
- `"t4-medium"`
- `"a10g-small"`
- `"a10g-large"`
- `"a10g-largex2"`
- `"a10g-largex4"`
- `"a100-large"`
- `"zero-a10g"`
- `"h100"`
- `"h100x8"`

```ts
import { Client } from "@gradio/client";

const app = await Client.duplicate("user/space-name", {
	hf_token: "hf_...",
	private: true,
	hardware: "a10g-small"
});
```

### `handle_file(file_or_url: File | string | Blob | Buffer)`

This utility function is used to simplify the process of handling file inputs for the client.

Gradio APIs expect a special file datastructure that references a location on the server. These files can be manually uploaded but figuring what to do with different file types can be difficult depending on your environment.

This function will handle files regardless of whether or not they are local files (node only), URLs, Blobs, or Buffers. It will take in a reference and handle it accordingly,uploading the file where appropriate and generating the correct data structure for the client.

The return value of this function can be used anywhere in the input data where a file is expected:

```ts
import { handle_file } from "@gradio/client";

const app = await Client.connect("user/space-name");
const result = await app.predict("/predict", {
	single: handle_file(file),
	flat: [handle_file(url), handle_file(buffer)],
	nested: {
		image: handle_file(url),
		layers: [handle_file(buffer)]
	},
	deeply_nested: {
		image: handle_file(url),
		layers: [{
			layer1: handle_file(buffer),
			layer2: handle_file(buffer)
		}]
	}
});
```

#### filepaths

`handle_file` can be passed a local filepath which it will upload to the client server and return a reference that the client can understand. 

This only works in a node environment.

Filepaths are resolved relative to the current working directory, not the location of the file that calls `handle_file`.

```ts
import { handle_file } from "@gradio/client";

// not uploaded yet
const file_ref = handle_file("path/to/file");

const app = await Client.connect("user/space-name");

// upload happens here
const result = await app.predict("/predict", {
	file: file_ref,
});
```

#### URLs

`handle_file` can be passed a URL which it will convert into a reference that the client can understand.

```ts
import { handle_file } from "@gradio/client";

const url_ref = handle_file("https://example.com/file.png");

const app = await Client.connect("user/space-name");
const result = await app.predict("/predict", {
	url: url_ref,
});
```

#### Blobs

`handle_file` can be passed a Blob which it will upload to the client server and return a reference that the client can understand.

The upload is not initiated until predict or submit are called.

```ts
import { handle_file } from "@gradio/client";

// not uploaded yet
const blob_ref = handle_file(new Blob(["Hello, world!"]));

const app = await Client.connect("user/space-name");

// upload happens here
const result = await app.predict("/predict", {
	blob: blob_ref,
});
```

#### Buffers

`handle_file` can be passed a Buffer which it will upload to the client server and return a reference that the client can understand.

```ts
import { handle_file } from "@gradio/client";
import { readFileSync } from "fs";

// not uploaded yet
const buffer_ref = handle_file(readFileSync("file.png"));

const app = await Client.connect("user/space-name");

// upload happens here
const result = await app.predict("/predict", {
	buffer: buffer_ref,
});
```