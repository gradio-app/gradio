## JavaScript Client Library

A javascript (and typescript) client to call Gradio APIs.

## Installation

The Gradio JavaScript client is available on npm as `@gradio/client`. You can install it as below:

```sh
npm i @gradio/client
```

## Usage

The JavaScript Gradio Client exposes two named imports, `client` and `duplicate`.

### `client`

The client function connects to the API of a hosted Gradio space and returns an object that allows you to make calls to that API.

The simplest example looks like this:

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const result = await app.predict("/predict");
```

This function accepts two arguments: `source` and `options`:

#### `source`

This is the url or name of the gradio app whose API you wish to connect to. This parameter is required and should always be a string. For example:

```ts
client("user/space-name");
```

#### `options`

The options object can optionally be passed a second parameter. This object has two properties, `hf_token` and `status_callback`.

##### `hf_token`

This should be a Hugging Face personal access token and is required if you wish to make calls to a private gradio api. This option is optional and should be a string starting with `"hf_"`.

Example:

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name", { hf_token: "hf_..." });
```

##### `status_callback`

This should be a function which will notify your of the status of a space if it is not running. If the gradio API you are connecting to is awake and running or is not hosted on Hugging Face space then this function will do nothing.

**Additional context**

Applications hosted on Hugging Face spaces can be in a number of different states. As spaces are a GitOps tool and will rebuild when new changes are pushed to the repository, they have various building, running and error states. If a space is not 'running' then the function passed as the `status_callback` will notify you of the current state of the space and the status of the space as it changes. Spaces that are building or sleeping can take longer than usual to respond, so you can use this information to give users feedback about the progress of their action.

```ts
import { client, type SpaceStatus } from "@gradio/client";

const app = await client("user/space-name", {
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
import { client } from "@gradio/client";

const app = await client("user/space-name");
const result = await app.predict("/predict");
```

`predict` accepts two parameters, `endpoint` and `payload`. It returns a promise that resolves to the prediction result.

##### `endpoint`

This is the endpoint for an api request and is required. The default endpoint for a `gradio.Interface` is `"/predict"`. Explicitly named endpoints have a custom name. The endpoint names can be found on the "View API" page of a space.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const result = await app.predict("/predict");
```

##### `payload`

The `payload` argument is generally optional but this depends on the API itself. If the API endpoint depends on values being passed in then it is required for the API request to succeed. The data that should be passed in is detailed on the "View API" page of a space, or accessible via the `view_api()` method of the client.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const result = await app.predict("/predict", [1, "Hello", "friends"]);
```

#### `submit`

The `submit` method provides a more flexible way to call an API endpoint, providing you with status updates about the current progress of the prediction as well as supporting more complex endpoint types.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const submission = app.submit("/predict", payload);
```

The `submit` method accepts the same [`endpoint`](#endpoint) and [`payload`](#payload) arguments as `predict`.

The `submit` method does not return a promise and should not be awaited, instead it returns an object with a `on`, `off`, and `cancel` methods.

##### `on`

The `on` method allows you to subscribe to events related to the submitted API request. There are two types of event that can be subscribed to: `"data"` updates and `"status"` updates.

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

Usage of these subscribe callback looks like this:

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const submission = app
	.submit("/predict", payload)
	.on("data", (data) => console.log(data))
	.on("status", (status: Status) => console.log(status));
```

##### `off`

The `off` method unsubscribes from a specific event of the submitted job and works similarly to `document.removeEventListener`; both the event name and the original callback must be passed in to successfully unsubscribe:

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const handle_data = (data) => console.log(data);

const submission = app.submit("/predict", payload).on("data", handle_data);

// later
submission.off("/predict", handle_data);
```

##### `destroy`

The `destroy` method will remove all subscriptions to a job, regardless of whether or not they are `"data"` or `"status"` events. This is a convenience method for when you do not want to unsubscribe use the `off` method.

```js
import { client } from "@gradio/client";

const app = await client("user/space-name");
const handle_data = (data) => console.log(data);

const submission = app.submit("/predict", payload).on("data", handle_data);

// later
submission.destroy();
```

##### `cancel`

Certain types of gradio function can run repeatedly and in some cases indefinitely. the `cancel` method will stop such an endpoints and prevent the API from issuing additional updates.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const submission = app
	.submit("/predict", payload)
	.on("data", (data) => console.log(data));

// later

submission.cancel();
```

#### `view_api`

The `view_api` method provides details about the API you are connected to. It returns a JavaScript object of all named endpoints, unnamed endpoints and what values they accept and return. This method does not accept arguments.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const api_info = await app.view_api();

console.log(api_info);
```

#### `config`

The `config` property contains the configuration for the gradio application you are connected to. This object may contain useful meta information about the application.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
console.log(app.config);
```

### `duplicate`

The duplicate function will attempt to duplicate the space that is referenced and return an instance of `client` connected to that space. If the space has already been duplicated then it will not create a new duplicate and will instead connect to the existing duplicated space. The huggingface token that is passed in will dictate the user under which the space is created.

`duplicate` accepts the same arguments as `client` with the addition of a `private` options property dictating whether the duplicated space should be private or public. A huggingface token is required for duplication to work.

```ts
import { duplicate } from "@gradio/client";

const app = await duplicate("user/space-name", {
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
import { duplicate } from "@gradio/client";

const app = await duplicate("user/space-name", {
	hf_token: "hf_...",
	private: true
});
```

##### `timeout`

This is an optional property specific to `duplicate`'s options object and will set the timeout in minutes before the duplicated space will go to sleep.

```ts
import { duplicate } from "@gradio/client";

const app = await duplicate("user/space-name", {
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
- `"t4-small"`
- `"t4-medium"`
- `"a10g-small"`
- `"a10g-large"`
- `"a100-large"`

```ts
import { duplicate } from "@gradio/client";

const app = await duplicate("user/space-name", {
	hf_token: "hf_...",
	private: true,
	hardware: "a10g-small"
});
```
