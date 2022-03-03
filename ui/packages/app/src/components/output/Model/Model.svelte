<script lang="ts">
	export let value: string;
	export let theme: string;

  componentDidMount() {
        const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);

        this.scene = new BABYLON.Scene(engine);
        this.scene.createDefaultCameraOrLight();

        const clearColor = this.props.value["clearColor"]
        this.scene.clearColor  = new BABYLON.Color3(clearColor[0], clearColor[1], clearColor[2]);

        this.addNewModel();

        engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            engine.resize();
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.addNewModel();
    }

    addNewModel() {
        // remove all existing models
        for (let mesh of this.scene.meshes) {
            mesh.dispose();
        }

        // add new model
        let base64_model_content = this.props.value["data"];
        let raw_content = BABYLON.Tools.DecodeBase64(base64_model_content);
        let blob = new Blob([raw_content]);
        let url = URL.createObjectURL(blob);
        BABYLON.SceneLoader.Append("", url, this.scene, () => {
            this.scene.createDefaultCamera(true, true, true);
        }, undefined, undefined, this.props.value["extension"]);
    }

    render() {
        if (this.props.value) {
            return (
                <div className="output_model">
                    <canvas id="renderCanvas"></canvas>
                    <a href={this.props.value["data"]} download={this.props.value["name"]} className="download_link">Download {this.props.value["name"]}</a>
                </div>
            )
        } else {
            return false;
        }
    }
</script>

<div
	class="output-image w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
	{theme}
>
	<div className="output_model_example">{value}</div>;

  <div className="output_model">
                    <canvas id="renderCanvas"></canvas>
                    <a href={this.props.value["data"]} download={value} className="download_link">Download {value}</a>
  </div>
</div>

<style lang="postcss">
</style>





// class ModelOutputExample extends ComponentExample {
//     render() {
//         return <div className="output_model_example">{this.props.value}</div>;
//     }
// }

// export {ModelOutput, ModelOutputExample};