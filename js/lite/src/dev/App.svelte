<script lang="ts">
	import type { create as createType } from "..";
	// @ts-ignore
	const create: typeof createType = globalThis.createGradioApp;
	type CreateOptions = Parameters<typeof create>[0];

	import { onMount, onDestroy } from "svelte";

	interface EditorFile {
		name: string;
		content: string | ArrayBufferView;
	}
	let editorFiles: EditorFile[] = [
		{
			name: "app.py",
			content: `
import gradio as gr


def fn(x):
    return x

demo = gr.Interface(
    fn=fn,
    inputs=gr.Textbox(),
    outputs=gr.Textbox(),
)

demo.launch()
`
		},
		{
			name: "greeting.py",
			content: `
def hi(name):
    return "Hi " + name + "!"`
		}
	];
	let entrypoint = editorFiles[0].name;

	$: files = editorFiles.reduce<NonNullable<CreateOptions["files"]>>(
		(acc, file) => {
			acc[file.name] = {
				data: file.content
			};
			return acc;
		},
		{}
	);

	let requirements_txt = "";

	function parse_requirements(text: string): string[] {
		return text
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0 && !line.startsWith("#"));
	}

	const requirements = parse_requirements(requirements_txt);

	let controller: ReturnType<typeof create>;
	onMount(() => {
		controller = create({
			target: document.getElementById("gradio-app")!,
			files,
			entrypoint,
			requirements,
			sharedWorkerMode: true,
			info: true,
			container: true,
			isEmbed: false,
			initialHeight: "300px",
			eager: false,
			themeMode: null,
			autoScroll: false,
			controlPageTitle: false,
			appMode: true,
			playground: false,
			layout: null
		});
		controller.addEventListener("modules-auto-loaded", (event) => {
			const packages = (event as CustomEvent).detail as { name: string }[];
			const packageNames = packages.map((pkg) => pkg.name);
			requirements_txt +=
				"\n" + packageNames.map((line) => line + "  # auto-loaded").join("\n");
		});
	});
	onDestroy(() => {
		controller.unmount();
	});

	function execute(): void {
		console.debug("exec_button.onclick");
		editorFiles.forEach((file) => {
			controller.write(file.name, file.content, {});
		});
		controller.run_file(entrypoint);
		console.debug("Rerun finished");
	}

	function install(): void {
		console.debug("install_button.onclick");
		const requirements = parse_requirements(requirements_txt);
		console.debug("requirements", requirements);
		controller.install(requirements);
		console.debug("Install finished");
	}

	let new_file_name = "";
	function add_file(): void {
		controller.write(new_file_name, "", {});
		editorFiles = editorFiles.concat({
			name: new_file_name,
			content: ""
		});
		new_file_name = "";
	}

	function delete_file(delete_file_name: string): void {
		controller.unlink(delete_file_name);
		editorFiles = editorFiles.filter((file) => file.name !== delete_file_name);
	}
</script>

<div class="container">
	<div class="panel">
		When the SharedWorker mode is enabled, access the URL below (for Chrome) and
		click the "inspect" link of the worker to show the console log emitted from
		the worker.
		<pre><code>chrome://inspect/#workers</code></pre>
	</div>
	<div class="panel">
		<h2>Files</h2>

		{#each editorFiles as file (file.name)}
			<div class="file-cell">
				<div class="cell-header">
					<h3 class="cell-title">{file.name}</h3>
					<div>
						<label>
							<input
								type="radio"
								name="entrypoint"
								bind:group={entrypoint}
								value={file.name}
							/>
							Set as an entrypoint file
						</label>
						<button on:click={() => delete_file(file.name)}>Delete</button>
					</div>
				</div>
				<textarea class="code-edit" bind:value={file.content} />
			</div>
		{/each}
		<button on:click={execute}>Execute</button>

		<div>
			<h3>Create a new file</h3>
			<input type="text" bind:value={new_file_name} />
			<button on:click={add_file}>Create</button>
		</div>
	</div>

	<div class="panel">
		<h2>Install requirements</h2>
		<textarea class="code-edit" bind:value={requirements_txt} />
		<button on:click={install}>Install</button>
	</div>
</div>

<style>
	.container {
		height: 100%;
		overflow: scroll;
	}

	.panel {
		padding: 8px;
		box-sizing: border-box;
	}

	.panel .file-cell {
		width: 100%;
	}

	.cell-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.cell-title {
		font-size: medium;
		font-weight: bold;
		margin: 0;
		padding: 0;
	}

	.code-edit {
		width: 100%;
		height: 200px;
		box-sizing: border-box;
	}
</style>
