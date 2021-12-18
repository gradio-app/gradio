import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";

class ModelOutput extends BaseComponent {
    componentDidMount() {
        const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);

        const scene = new BABYLON.Scene(engine);
        scene.createDefaultCameraOrLight();

        let base64_model_content = this.props.value["data"];
        let raw_content = BABYLON.Tools.DecodeBase64(base64_model_content);
        let blob = new Blob([raw_content]);
        let url = URL.createObjectURL(blob);
        BABYLON.SceneLoader.Append("", url, scene, function () {
            scene.createDefaultCamera(true, true, true);
        }, undefined, undefined, ".glb");

        engine.runRenderLoop(function () {
            scene.render();
        });

        window.addEventListener("resize", function () {
            engine.resize();
        });
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
