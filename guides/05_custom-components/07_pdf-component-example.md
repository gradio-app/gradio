# Case Study: A Component to Display PDFs

Let's work through an example of building a custom gradio component for displaying PDF files.
This component will come in handy for showcasing [document question answering](https://huggingface.co/models?pipeline_tag=document-question-answering&sort=trending) models, which typically work on PDF input.

## Step 0: Prerequisites
Make sure you have gradio 4.0 installed.
As of the time of publication, the latest release is 4.1.1.

## Step 1: Creating the custom component

Navigate to a directory of your choosing and run the following command:

```bash
gradio cc create MyPDF
```

This will create a subdirectory called `mypdf` in your current working directory.
If you open it in your code editor, it will look like this:

![directory structure](https://gradio-builds.s3.amazonaws.com/assets/pdf-guide/CodeStructure.png)

Tip: For this demo we are not templating off a current gradio component. But you can see the list of available templates with `gradio cc show` and then pass the template name to the `--template` option, e.g. `gradio cc create <Name> --template <foo>`

## Step 2: Frontend - modify package.json

We're going to use the [pdfjs](https://mozilla.github.io/pdf.js/) javascript library to display the pdfs in the frontend. 
Let's start off by adding it to our frontend project's dependencies, as well as adding a couple of other projects we'll need.

In the `dependencies` key, remove `svelte-json-view` and add the following dependencies: `@gradio/client`, `@gradio/upload`, `@gradio/icons`, `@gradio/button`, and `pdfjs-dist`.
Also make sure you add `pdfjs-dist` in `devDependencies`.

The complete `package.json` should look like this:

```json
{
  "name": "gradio_mypdf",
  "version": "0.2.0",
  "description": "Gradio component for displaying PDFs",
  "type": "module",
  "author": "",
  "license": "ISC",
  "private": false,
  "main_changeset": true,
  "exports": {
    ".": "./Index.svelte",
    "./example": "./Example.svelte",
    "./package.json": "./package.json"
  },
  "devDependencies": {
    "pdfjs-dist": "3.11.174"
  },
  "dependencies": {
    "@gradio/atoms": "0.2.0",
    "@gradio/statustracker": "0.3.0",
    "@gradio/utils": "0.2.0",
    "@gradio/client": "0.7.1",
    "@gradio/upload": "0.3.2",
    "@gradio/icons": "0.2.0",
    "@gradio/button": "0.2.3",
    "pdfjs-dist": "3.11.174"
  }
}
```

Tip: I'm using the latest version of the `@gradio/` packages as of the time of writing. You can find the latest version by going to the gradio javascript package documentation [here](https://www.gradio.app/main/docs/js/atoms). Its recommended you use the same versions as me as the API can change.

Whenever you modify the dependencies for either your frontend or backend projects, run the install command:

```bash
gradio cc install
```

Navigate to `Index.svelte` and delete mentions of `JSONView`

```ts
import { JsonView } from "@zerodevx/svelte-json-view";
```

```ts
<JsonView json={value} />
```

## Step 3: Frontend - Launching the Dev Server

Run the `dev` command to launch the development server.
This will open the demo in `demo/app.py` in an environment where changes to the `frontend` and `backend` directories will reflect instantaneously in the launched app.

After launching the dev server, you should see a link printed to your console that says `Frontend Server (Go here): ... `.
 
![](https://gradio-builds.s3.amazonaws.com/assets/pdf-guide/dev_server_terminal.png)

You should see the following:

![](https://gradio-builds.s3.amazonaws.com/assets/pdf-guide/frontend_start.png)



Its not impressive yet but we're ready to start coding!

## Step 4: Frontend - The basic skeleton

We're going to start off by first writing the skeleton of our frontend and then adding the pdf rendering logic.
Add the imports and expose the following properties.

You may get some warnings from your code editor that some props are not used. That's ok.

Tip: We want our frontend to dispatch `change` and `upload` events when the underlying PDF changes or is updated. That's what this line means: `Gradio<{change: never; upload: never;}>;`

```ts
    import { tick } from "svelte";
    import type { Gradio } from "@gradio/utils";
    import { Block, BlockLabel } from "@gradio/atoms";
    import { File } from "@gradio/icons";
    import { StatusTracker } from "@gradio/statustracker";
    import type { LoadingStatus } from "@gradio/statustracker";
    import type { FileData } from "@gradio/client";
    import { normalise_file } from "@gradio/client";
    import { Upload, ModifyUpload } from "@gradio/upload";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: FileData | null = null;
	export let container = true;
	export let scale: number | null = null;
	export let root: string;
	export let height: number | null = 500;
	export let label: string;
	export let proxy_url: string;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: never;
		upload: never;
	}>;

    let _value = value;
    let old_value = _value;
```

We want our frontend component to let users upload a PDF document if there isn't one already loaded. If it is loaded, we want to display it underneath a "clear" button that lets our users upload a new document. 
We're going to use the `Upload` and `ModifyUpload` components that come with the `@gradio/upload` package.
Underneath the `</script>` tag, delete all the current code and add the following:

```ts
<Block {visible} {elem_id} {elem_classes} {container} {scale} {min_width}>
    {#if loading_status}
        <StatusTracker
            autoscroll={gradio.autoscroll}
            i18n={gradio.i18n}
            {...loading_status}
        />
    {/if}
    <BlockLabel
        show_label={label !== null}
        Icon={File}
        float={value === null}
        label={label || "File"}
    />
    {#if _value}
        <ModifyUpload i18n={gradio.i18n} absolute />
    {:else}
        <Upload
            filetype={"application/pdf"}
            file_count="single"
            {root}
        >
            Upload your PDF
        </Upload>
    {/if}
</Block>
```

You should see the following when you navigate to your app after saving your current changes:

![](https://gradio-builds.s3.amazonaws.com/assets/pdf-guide/frontend_1.png)

## Step 5: Frontend - Nicer Upload Text

The `Upload your PDF` text looks a bit small and barebones. 
Lets customize it!

Create a new file called `PdfUploadText.svelte` and copy the following code.
Its creating a new div to display our "upload text" with some custom styling.

Tip: Notice that we're leveraging Gradio core's existing css variables here: `var(--size-60)` and `var(--body-text-color-subdued)`


```ts
<script lang="ts">
	import { Upload as UploadIcon } from "@gradio/icons";
	export let hovered = false;

</script>

<div class="wrap">
	<span class="icon-wrap" class:hovered><UploadIcon /> </span>
    Drop PDF
    <span class="or">- or -</span>
    Click to Upload
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: var(--size-60);
		color: var(--block-label-text-color);
		line-height: var(--line-md);
		height: 100%;
		padding-top: var(--size-3);
	}

	.or {
		color: var(--body-text-color-subdued);
		display: flex;
	}

	.icon-wrap {
		width: 30px;
		margin-bottom: var(--spacing-lg);
	}

	@media (--screen-md) {
		.wrap {
			font-size: var(--text-lg);
		}
	}

	.hovered {
		color: var(--color-accent);
	}
</style>
```

Now import `PdfUploadText.svelte` in your `<script>` and pass it to the `Upload` component!

```ts
	import PdfUploadText from "./PdfUploadText.svelte";

...

    <Upload
        filetype={"application/pdf"}
        file_count="single"
        {root}
    >
        <PdfUploadText />
    </Upload>
```

After saving your code, the frontend should now look like this:

![](https://gradio-builds.s3.amazonaws.com/assets/pdf-guide/better_upload.png)

## Step 6: PDF Rendering logic

This is the most advanced javascript part.
It took me a while to figure it out!
Do not worry if you have trouble, the important thing is to not be discouraged 💪
Ask for help in the gradio discord if you need and ask for help.

With that out of the way, let's start off by importing `pdfjs` and loading the code of the pdf worker from the mozilla cdn.

```ts
	import pdfjsLib from "pdfjs-dist";
    ...
    pdfjsLib.GlobalWorkerOptions.workerSrc =  "https://cdn.bootcss.com/pdf.js/3.11.174/pdf.worker.js";
```

Also create the following variables:

```ts
    let pdfDoc;
    let numPages = 1;
    let currentPage = 1;
    let canvasRef;
```

Now, we will use `pdfjs` to render a given page of the PDF onto an `html` document.
Add the following code to `Index.svelte`

Tip: The `$:` syntax in svelte is how you declare statements to be reactive. Whenever any of the inputs of the statement change, svelte will automatically re-run that statement.

```ts
    async function get_doc(value: FileData) {
        const loadingTask = pdfjsLib.getDocument(value.url);
        pdfDoc = await loadingTask.promise;
        numPages = pdfDoc.numPages;
        render_page();
    }

    function render_page() {
    // Render a specific page of the PDF onto the canvas
        pdfDoc.getPage(currentPage).then(page => {
            const ctx  = canvasRef.getContext('2d')
            ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
            let viewport = page.getViewport({ scale: 1 });
            let scale = height / viewport.height;
            viewport = page.getViewport({ scale: scale });

            const renderContext = {
                canvasContext: ctx,
                viewport,
            };
            canvasRef.width = viewport.width;
            canvasRef.height = viewport.height;
            page.render(renderContext);
        });
    }

    // Compute the url to fetch the file from the backend\
    // whenever a new value is passed in.
    $: _value = normalise_file(value, root, proxy_url);

    // If the value changes, render the PDF of the currentPage
    $: if(JSON.stringify(old_value) != JSON.stringify(_value)) {
        if (_value){
            get_doc(_value);
        }
        old_value = _value;
        gradio.dispatch("change");
    }
```

