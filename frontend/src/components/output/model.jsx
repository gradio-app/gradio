import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";

class ModelOutput extends BaseComponent {
    constructor(props) {
        super(props);
        this.scene = null;
    }

    componentDidMount() {
        const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);

        this.scene = new BABYLON.Scene(engine);
        this.scene.createDefaultCameraOrLight();

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
                </div>
            )
        } else {
            return false;
        }
    }
}

class ModelOutputExample extends ComponentExample {
    render() {
        return <div className="output_model_example">{this.props.value}</div>;
    }
}

export {ModelOutput, ModelOutputExample};
