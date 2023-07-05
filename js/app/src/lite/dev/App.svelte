<script lang="ts">
	import type { create as createType } from ".."
	// @ts-ignore
	const create: typeof createType = globalThis.createGradioApp
	import { onMount, onDestroy } from "svelte"

	let code: string = `import gradio as gr

def greet(name):
    return "Hello " + name + "!"

def upload_file(files):
    file_paths = [file.name for file in files]
    return file_paths

with gr.Blocks(theme=gr.themes.Soft()) as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

    gr.File()

    file_output = gr.File()
    upload_button = gr.UploadButton("Click to Upload a File", file_types=["image", "video"], file_count="multiple")
    upload_button.upload(upload_file, upload_button, file_output)

demo.launch()`

		let requirements_txt = "";

		function parse_requirements(text: string) {
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
				files: {
					"images/logo.png": {
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/guides/assets/logo.png"
					}
				},
				code,
				requirements,
				info: true,
				container: true,
				isEmbed: false,
				initialHeight: "300px",
				eager: false,
				themeMode: null,
				autoScroll: false,
				controlPageTitle: false,
				appMode: true
			});
		})
		onDestroy(() => {
			controller.unmount();
		})

		function handleExecClick () {
			console.debug("exec_button.onclick");
			controller.run_code(code);
			console.debug("Rerun finished")
		}

		function handleInstallClick() {
			console.debug("install_button.onclick");
			const requirements = parse_requirements(requirements_txt)
			console.debug("requirements", requirements)
			controller.install(requirements);
			console.debug("Install finished")
		}
</script>

<div class="container">
	<div class="panel left">
		<textarea bind:value={code}></textarea>
		<button on:click={handleExecClick}>Execute</button>
	</div>

	<div class="panel right">
		<textarea bind:value={requirements_txt}></textarea>
		<button on:click={handleInstallClick}>Install</button>
	</div>
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: row;
	}
	.panel {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.panel textarea {
		flex-grow: 1;
	}
	.right {
		width: 300px;
	}
	.left {
		flex-grow: 1;
	}
</style>
