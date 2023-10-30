# The Frontend 🌐⭐️

This guide will cover everything you need to know to implement your custom component's front-end.

Tip: Gradio components use svelte. Writing svelte is fun! If you're not familiar, check out the interactive [guide](https://learn.svelte.dev/tutorial/welcome-to-svelte)

## The directory structure 

The frontend code should have at the minimum three files:

* `Index.svelte`: This is the main export and where your component's layout and logic should live.
* `Example.svelte`: This is where the example view of the component is defined.

Feel free to add additional files and subdirectories. 
If you want to export any additional modules, remember to modify the `package.json` file

```json
"exports": {
    ".": "./Index.svelte",
    "./example": "./Example.svelte",
    "./package.json": "./package.json"
},
```

## The Index.svelte file

Your component should expose the following props that will be passed down from the parent Gradio application.

```ts
import type { LoadingStatus } from "@gradio/statustracker";
import type { Gradio } from "@gradio/utils";

export let gradio: Gradio<{
    event_1: never;
    event_2: never;
}>;

export let elem_id = "";
export let elem_classes: string[] = [];
export let scale: number | null = null;
export let min_width: number | undefined = undefined;
export let loading_status: LoadingStatus | undefined = undefined;
export let mode: "static" | "interactive";
```

* `elem_id` and `elem_classes` allow Gradio app developers to target your component with custom css and javascript from the python `Blocks` class.

* `scale` and `min_width` allow Gradio app developers to control how much space your component takes up in the UI.

* `loading_status` is used to display a loading status over the component when it is the output of an event.

* `mode` is how the parent Gradio app tells your component whether the `interactive` or `static` version should be displayed.

* `gradio`: The gradio object is created by the parent Gradio app. It stores some application-level configuration that will be useful in your component, like internationalization. You must use it to dispach events from your component.

A minimal `Index.svelte` file would look like:

```
<script lang="ts">
	import type { LoadingStatus } from "@gradio/statustracker";
    import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";

	export let gradio: Gradio<{
		event_1: never;
		event_2: never;
	}>;

    export let value = "";
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus | undefined = undefined;
    export let mode: "static" | "interactive";
</script>

<Block
	visible={true}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={false}
	padding={true}
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
		/>
	{/if}
    <p>{value}</p>
</Block>
```

## The Example.svelte file

The `Example.svelte` file should expose the following props:

```
    export let value: string;
    export let type: "gallery" | "table";
    export let selected = false;
```

* `value`: The example value that should be displayed.

* `type`: It is a variable that can be either "gallery" or "table" depending on how the examples are displayed. The "gallery" form is used when the examples correspond to a single input component, while the "table" form is used when a user has multiple input components, and the examples need to populate all of them. 

* `selected` You can also adjust how the examples are displayed if a user "selects" a particular example by using the selected variable.

This is the `Example.svelte` file for the code `Radio` component:

```
<script lang="ts">
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{value}
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>
```

## Handling Files

If your component deals with files, these files **should** be uploaded to the backend server. 
The `@gradio/upload` npm package provides the `upload_files`, `prepare_files`, and `normalise_file` utility functions to help you do this.

The `prepare_files` function will convert the browser's `File` datatype to gradio's internal `FileData` type.
You should use the `FileData` data in your component to keep track of uploaded files.

The `upload_files` function will upload an array of `FileData` values to the server.

The `normalise_file` function will generate the correct URL for your component to fetch the file from and set it to the `data` property of the `FileData.`

Tip: Be sure you call `normalise_file` whenever your files are updated!


Here's an example of loading files from an `<input>` element when its value changes.


```
<script lang="ts">

    import type { FileData } from "@gradio/upload";
    import {upload, prepare_files, normalise_file } from "@gradio/upload";
    export let root;
    export let value;
    let uploaded_files;

    $: value: normalise_file(uploaded_files, root)

    async function handle_upload(file_data: FileData[]): Promise<void> {
        await tick();
        uploaded_files = await upload(file_data, root);
    }

    async function loadFiles(files: FileList): Promise<void> {
        let _files: File[] = Array.from(files);
        if (!files.length) {
            return;
        }
        if (file_count === "single") {
            _files = [files[0]];
        }
        let file_data = await prepare_files(_files);
        await handle_upload(file_data);
    }

    async function loadFilesFromUpload(e: Event): Promise<void> {
		const target = e.target;

		if (!target.files) return;
		await loadFiles(target.files);
	}
</script>

<input
    type="file"
    on:change={loadFilesFromUpload}
    multiple={true}
/>
```

The component exposes a prop named `root`. 
This is passed down by the parent gradio app and it's the base url that the files will be uploaded to and fetched from.

For WASM support, you should get the upload function from the `Context` and pass that as the third parameter of the `upload` function.

```
<script lang="ts">
    import { getContext } from "svelte";
    const upload_fn = getContext<typeof upload_files>("upload_files");

    async function handle_upload(file_data: FileData[]): Promise<void> {
        await tick();
        await upload(file_data, root, upload_fn);
    }
</script>
```

## Leveraging Existing Gradio Components

You can save yourself some code by using Gradio's core components in your own custom component.
It will also make it a lot easier to match Gradio's design system.

<Freddy to point to docs here>



## Matching Gradio Core's Design System
<Hannah and Ali Abid to elaborate>
