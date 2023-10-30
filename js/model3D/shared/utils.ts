import type { FileData } from "@gradio/client";
import * as BABYLON from "babylonjs";

const create_camera = (
	scene: BABYLON.Scene,
	camera_position: [number | null, number | null, number | null],
	zoom_speed: number,
	pan_speed: number
): void => {
	scene.createDefaultCamera(true, true, true);
	var helperCamera = scene.activeCamera! as BABYLON.ArcRotateCamera;
	if (camera_position[0] !== null) {
		helperCamera.alpha = BABYLON.Tools.ToRadians(camera_position[0]);
	}
	if (camera_position[1] !== null) {
		helperCamera.beta = BABYLON.Tools.ToRadians(camera_position[1]);
	}
	if (camera_position[2] !== null) {
		helperCamera.radius = camera_position[2];
	}
	helperCamera.lowerRadiusLimit = 0.1;
	const updateCameraSensibility = (): void => {
		helperCamera.wheelPrecision = 250 / (helperCamera.radius * zoom_speed);
		helperCamera.panningSensibility = (10000 * pan_speed) / helperCamera.radius;
	};
	updateCameraSensibility();
	helperCamera.attachControl(true);
	helperCamera.onAfterCheckInputsObservable.add(updateCameraSensibility);
};

export const add_new_model = (
	canvas: HTMLCanvasElement,
	scene: BABYLON.Scene,
	engine: BABYLON.Engine,
	value: FileData | null,
	clear_color: [number, number, number, number],
	camera_position: [number | null, number | null, number | null],
	zoom_speed: number,
	pan_speed: number
): BABYLON.Scene => {
	if (scene && !scene.isDisposed && engine) {
		scene.dispose();
		engine.dispose();
	}

	engine = new BABYLON.Engine(canvas, true);
	scene = new BABYLON.Scene(engine);
	scene.createDefaultCameraOrLight();
	scene.clearColor = scene.clearColor = new BABYLON.Color4(...clear_color);

	engine.runRenderLoop(() => {
		scene.render();
	});

	window.addEventListener("resize", () => {
		engine.resize();
	});

	if (!value) return scene;
	let url: string;

	url = value.url!;

	BABYLON.SceneLoader.ShowLoadingScreen = false;
	BABYLON.SceneLoader.Append(
		url,
		"",
		scene,
		() => create_camera(scene, camera_position, zoom_speed, pan_speed),
		undefined,
		undefined,
		"." + value.path.split(".")[1]
	);
	return scene;
};

export const reset_camera_position = (
	scene: BABYLON.Scene,
	camera_position: [number | null, number | null, number | null],
	zoom_speed: number,
	pan_speed: number
): void => {
	scene.removeCamera(scene.activeCamera!);
	create_camera(scene, camera_position, zoom_speed, pan_speed);
};
