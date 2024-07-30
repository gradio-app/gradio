# The Frontend 🌐⭐️

This guide will cover everything you need to know to implement your custom component's frontend.

Tip: Gradio components use Svelte. Writing Svelte is fun! If you're not familiar with it, we recommend checking out their interactive [guide](https://learn.svelte.dev/tutorial/welcome-to-svelte).

## The directory structure 

The frontend code should have, at minimum, three files:

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

```typescript
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

* `elem_id` and `elem_classes` allow Gradio app developers to target your component with custom CSS and JavaScript from the Python `Blocks` class.

* `scale` and `min_width` allow Gradio app developers to control how much space your component takes up in the UI.

* `loading_status` is used to display a loading status over the component when it is the output of an event.

* `mode` is how the parent Gradio app tells your component whether the `interactive` or `static` version should be displayed.

* `gradio`: The `gradio` object is created by the parent Gradio app. It stores some application-level configuration that will be useful in your component, like internationalization. You must use it to dispatch events from your component.

A minimal `Index.svelte` file would look like:

```svelte
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

```typescript
    export let value: string;
    export let type: "gallery" | "table";
    export let selected = false;
    export let index: number;
```

* `value`: The example value that should be displayed.

* `type`: This is a variable that can be either `"gallery"` or `"table"` depending on how the examples are displayed. The `"gallery"` form is used when the examples correspond to a single input component, while the `"table"` form is used when a user has multiple input components, and the examples need to populate all of them. 

* `selected`: You can also adjust how the examples are displayed if a user "selects" a particular example by using the selected variable.

* `index`: The current index of the selected value.

* Any additional props your "non-example" component takes!

This is the `Example.svelte` file for the code `Radio` component:

```svelte
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
The `@gradio/client` npm package provides the `upload` and `prepare_files` utility functions to help you do this.

The `prepare_files` function will convert the browser's `File` datatype to gradio's internal `FileData` type.
You should use the `FileData` data in your component to keep track of uploaded files.

The `upload` function will upload an array of `FileData` values to the server.

Here's an example of loading files from an `<input>` element when its value changes.


```svelte
<script lang="ts">
    import { upload, prepare_files, type FileData } from "@gradio/client";
    export let root;
    export let value;
    let uploaded_files;

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
This is passed down by the parent gradio app and it represents the base url that the files will be uploaded to and fetched from.

For WASM support, you should get the upload function from the `Context` and pass that as the third parameter of the `upload` function.

```typescript
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

Most of Gradio's frontend components are published on [npm](https://www.npmjs.com/), the javascript package repository.
This means that you can use them to save yourself time while incorporating common patterns in your component, like uploading files.
For example, the `@gradio/upload` package has `Upload` and `ModifyUpload` components for properly uploading files to the Gradio server. 
Here is how you can use them to create a user interface to upload and display PDF files.

```svelte
<script>
	import { type FileData, Upload, ModifyUpload } from "@gradio/upload";
	import { Empty, UploadText, BlockLabel } from "@gradio/atoms";
</script>

<BlockLabel Icon={File} label={label || "PDF"} />
{#if value === null && interactive}
    <Upload
        filetype="application/pdf"
        on:load={handle_load}
        {root}
        >
        <UploadText type="file" i18n={gradio.i18n} />
    </Upload>
{:else if value !== null}
    {#if interactive}
        <ModifyUpload i18n={gradio.i18n} on:clear={handle_clear}/>
    {/if}
    <iframe title={value.orig_name || "PDF"} src={value.data} height="{height}px" width="100%"></iframe>
{:else}
    <Empty size="large"> <File/> </Empty>	
{/if}
```

You can also combine existing Gradio components to create entirely unique experiences.
Like rendering a gallery of chatbot conversations. 
The possibilities are endless, please read the documentation on our javascript packages [here](https://gradio.app/main/docs/js).
We'll be adding more packages and documentation over the coming weeks!

## Matching Gradio Core's Design System

You can explore our component library via Storybook. You'll be able to interact with our components and see them in their various states.

For those interested in design customization, we provide the CSS variables consisting of our color palette, radii, spacing, and the icons we use - so you can easily match up your custom component with the style of our core components. This Storybook will be regularly updated with any new additions or changes.

[Storybook Link](https://gradio.app/main/docs/js/storybook)

## Custom configuration

If you want to make use of the vast vite ecosystem, you can use the `gradio.config.js` file to configure your component's build process. This allows you to make use of tools like tailwindcss, mdsvex, and more.

Currently, it is possible to configure the following:

Vite options:
- `plugins`: A list of vite plugins to use.

Svelte options:
- `preprocess`: A list of svelte preprocessors to use.
- `extensions`: A list of file extensions to compile to `.svelte` files.
- `build.target`: The target to build for, this may be necessary to support newer javascript features. See the [esbuild docs](https://esbuild.github.io/api/#target) for more information.

The `gradio.config.js` file should be placed in the root of your component's `frontend` directory. A default config file is created for you when you create a new component. But you can also create your own config file, if one doesn't exist, and use it to customize your component's build process.

### Example for a Vite plugin

Custom components can use Vite plugins to customize the build process. Check out the [Vite Docs](https://vitejs.dev/guide/using-plugins.html) for more information. 

Here we configure [TailwindCSS](https://tailwindcss.com), a utility-first CSS framework. Setup is easiest using the version 4 prerelease. 

```
npm install tailwindcss@next @tailwindcss/vite@next
```

In `gradio.config.js`:

```typescript
import tailwindcss from "@tailwindcss/vite";
export default {
    plugins: [tailwindcss()]
};
```

Then create a `style.css` file with the following content:

```css
@import "tailwindcss";
```

Import this file into `Index.svelte`. Note, that you need to import the css file containing `@import` and cannot just use a `<style>` tag and use `@import` there. 

```svelte
<script lang="ts">
[...]
import "./style.css";
[...]
</script>
```

### Example for Svelte options

In `gradio.config.js` you can also specify a some Svelte options to apply to the Svelte compilation. In this example we will add support for [`mdsvex`](https://mdsvex.pngwn.io), a Markdown preprocessor for Svelte. 

In order to do this we will need to add a [Svelte Preprocessor](https://svelte.dev/docs/svelte-compiler#preprocess) to the `svelte` object in `gradio.config.js` and configure the [`extensions`](https://github.com/sveltejs/vite-plugin-svelte/blob/HEAD/docs/config.md#config-file) field. Other options are not currently supported.

First, install the `mdsvex` plugin:

```bash
npm install mdsvex
```

Then add the following to `gradio.config.js`:

```typescript
import { mdsvex } from "mdsvex";

export default {
    svelte: {
        preprocess: [
            mdsvex()
        ],
        extensions: [".svelte", ".svx"]
    }
};
```

Now we can create `mdsvex` documents in our component's `frontend` directory and they will be compiled to `.svelte` files.

```md
<!-- HelloWorld.svx -->

<script lang="ts">
    import { Block } from "@gradio/atoms";

    export let title = "Hello World";
</script>

<Block label="Hello World">

# {title}

This is a markdown file.

</Block>
```

We can then use the `HelloWorld.svx` file in our components:

```svelte
<script lang="ts">
    import HelloWorld from "./HelloWorld.svx";
</script>

<HelloWorld />
```

## Conclusion

You now how to create delightful frontends for your components!

