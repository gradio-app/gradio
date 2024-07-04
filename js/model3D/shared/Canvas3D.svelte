<script lang="ts">
	import { onMount } from "svelte";
	import * as BABYLON from "babylonjs";
	import * as BABYLON_LOADERS from "babylonjs-loaders";
	import type { FileData } from "@gradio/client";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	$: {
		if (
			BABYLON_LOADERS.OBJFileLoader != undefined &&
			!BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS
		) {
			BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS = true;
		}
	}

	export let value: FileData;
	export let display_mode: "solid" | "point_cloud" | "wireframe";
	export let clear_color: [number, number, number, number];
	export let camera_position: [number | null, number | null, number | null];
	export let zoom_speed: number;
	export let pan_speed: number;

	$: url = value.url;

	/* URL resolution for the Wasm mode. */
	export let resolved_url: typeof url = undefined; // Exposed to be bound to the download link in the parent component.
	// The prop can be updated before the Promise from `resolve_wasm_src` is resolved.
	// In such a case, the resolved url for the old `url` has to be discarded,
	// This variable `latest_url` is used to pick up only the value resolved for the latest `url`.
	let latest_url: typeof url;
	$: {
		// In normal (non-Wasm) Gradio, the original `url` should be used immediately
		// without waiting for `resolve_wasm_src()` to resolve.
		// If it waits, a blank element is displayed until the async task finishes
		// and it leads to undesirable flickering.
		// So set `resolved_url` immediately above, and update it with the resolved values below later.
		resolved_url = url;

		if (url) {
			latest_url = url;
			const resolving_url = url;
			resolve_wasm_src(url).then((resolved) => {
				if (latest_url === resolving_url) {
					resolved_url = resolved ?? undefined;
				} else {
					resolved && URL.revokeObjectURL(resolved);
				}
			});
		}
	}

	/* BabylonJS engine and scene management */
	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;
	let engine: BABYLON.Engine;
	let point_cloud_system: BABYLON.PointsCloudSystem | null = null;
	let mounted = false;

	onMount(() => {
		// Initialize BabylonJS engine and scene
		engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);

		scene.createDefaultCameraOrLight();
		scene.useRightHandedSystem = true;
		scene.clearColor = scene.clearColor = new BABYLON.Color4(...clear_color);

		engine.runRenderLoop(() => {
			scene.render();
		});

		function onWindowResize(): void {
			engine.resize();
		}
		window.addEventListener("resize", onWindowResize);

		mounted = true;

		return () => {
			scene.dispose();
			engine.dispose();
			window.removeEventListener("resize", onWindowResize);
		};
	});

	$: mounted && load_model(resolved_url);

	function load_model(url: string | undefined): void {
		if (scene) {
			// Dispose of the previous model before loading a new one
			scene.meshes.forEach((mesh) => {
				mesh.dispose();
			});

			if (point_cloud_system) {
				point_cloud_system.dispose();
				point_cloud_system = null;
			}

			// Load the new model
			if (url) {
				BABYLON.SceneLoader.ShowLoadingScreen = false;
				BABYLON.SceneLoader.Append(
					url,
					"",
					scene,
					() => {
						if (display_mode === "point_cloud") {
							create_point_cloud(scene);
						} else if (display_mode === "wireframe") {
							create_wireframe(scene);
						} else {
							create_camera(scene, camera_position, zoom_speed, pan_speed);
						}
					},
					undefined,
					undefined,
					"." + value.path.split(".").pop()
				);
			}
		}
	}

	function create_camera(
		scene: BABYLON.Scene,
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
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
			helperCamera.panningSensibility =
				(10000 * pan_speed) / helperCamera.radius;
		};
		updateCameraSensibility();
		helperCamera.attachControl(true);
		helperCamera.onAfterCheckInputsObservable.add(updateCameraSensibility);
	}

	export function reset_camera_position(
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
		if (scene) {
			scene.removeCamera(scene.activeCamera!);
			create_camera(scene, camera_position, zoom_speed, pan_speed);
		}
	}

	function create_point_cloud(scene: BABYLON.Scene): void {
		const meshes = scene.meshes;
		const pointPositions: BABYLON.Vector3[] = [];

		meshes.forEach((mesh) => {
			if (mesh instanceof BABYLON.Mesh) {
				const positions = mesh.getVerticesData(
					BABYLON.VertexBuffer.PositionKind
				);
				if (positions) {
					for (let i = 0; i < positions.length; i += 3) {
						pointPositions.push(
							new BABYLON.Vector3(
								positions[i],
								positions[i + 1],
								positions[i + 2]
							)
						);
					}
				}
				mesh.setEnabled(false);
			}
		});

		point_cloud_system = new BABYLON.PointsCloudSystem(
			"point_cloud_system",
			1,
			scene
		);

		point_cloud_system.addPoints(
			pointPositions.length,
			(particle: BABYLON.CloudPoint, i: number) => {
				particle.position = pointPositions[i];
				particle.color = new BABYLON.Color4(
					Math.random(),
					Math.random(),
					Math.random(),
					1.0
				);
			}
		);

		point_cloud_system.buildMeshAsync().then((mesh) => {
			mesh.alwaysSelectAsActiveMesh = true;
			create_camera(scene, camera_position, zoom_speed, pan_speed);
		});
	}

	function create_wireframe(scene: BABYLON.Scene): void {
		scene.meshes.forEach((mesh) => {
			if (mesh instanceof BABYLON.Mesh) {
				mesh.material = new BABYLON.StandardMaterial(
					"wireframeMaterial",
					scene
				);
				mesh.material.wireframe = true;
			}
			create_camera(scene, camera_position, zoom_speed, pan_speed);
		});
	}
</script>

<canvas bind:this={canvas}></canvas>
