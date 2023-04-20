# JavaScript Gradio client

A javascript (and typescript) client to call Gradio APIs.

## Installation

The Gradio JavaScript client is available on npm as `@gradio/client`. You can install it as below:

```sh
pnpm add @gradio/client
# or npm i @gradio/client
```

## Usage

The JavaScript Gradio Client exposes 2 named imports, `client` and `duplicate`.

### `client`

The client function connects to the API of a hosted Gradio space and returns an object that allows you to make calls to that API.

The simplest example looks like this:

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const result = await app.predict(payload);
```

This function accaepts two parameters: `source` and `options`:

#### `source`

This is the url or name of the gradio app whose API you wish to connect to. This parameter is required and should always be a string. For example:

```ts
client("user/space-name");
```

#### `options`

The options object can optionally be passed a second parameter. This object has two properties, `hf_token` and `status_callback`.

##### `hf_token`

This should be a hugging face personal access token and is required if you wish to make calls to a private gradio api. This option is optional and should be a string starting with `"hf_"`.

Example:

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name", { hf_token: "hf_..." });
```

##### `status_callback`

This should be a function which will notify your of the status of a space if it is not running. If the gradio API you are connecting to is awake and running or is not hosted on hugginface space then this function will do nothing.

**Additional context**

Applications hosted on Hugginface spaces can be in a number of different states, as this is a GitOps tool and will rebuild when new changes are pushed to the repository, they have various building, running and error states. If a space is not 'running' then the function passed as the `status_callback` will notify you of the current state of the space and the status of the space as it changes. Spaces that are building or sleeping can take longer than usual to respond, so you can use this information to give users feedback about the progress of their action.

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
}

type SpaceStatus = SpaceStatusNormal | SpaceStatusError;
```

The gradio client returns an object with a number of utility methods and properties:

#### `predict`

The `predict` method allows you to call an api endpoint and get a prediction:

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const result = await app.predict(payload);
```

#### `submit`

The submit method provides a more flexible way to call a gradio enpoint, providing you with status updates about the current progress of the prediction as well as supporting more complex endpoints types.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const result = app
	.submit(payload)
	.on("data", (data) => console.log(data))
	.on("status", (status) => console.log(status));
```

#### `info`

The `info` method provides details about the api you are connected too. It returns a javascript object of all named enpoints, unnamed endpoints and what values they accept and return.

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
const api_info = await app.info();
```

#### `config`

The `config` property contain the configuration for the gradio app you are connected to. This object may contain useful meta information about the application

```ts
import { client } from "@gradio/client";

const app = await client("user/space-name");
console.log(app.config);
```
