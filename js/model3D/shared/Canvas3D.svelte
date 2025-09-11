<script lang="ts">
	import { onMount } from "svelte";
	import type { FileData } from "@gradio/client";
	import type { Viewer, ViewerDetails } from "@babylonjs/viewer";

	let BABYLON_VIEWER: typeof import("@babylonjs/viewer");

	export let value: FileData;
	export let display_mode: "solid" | "point_cloud" | "wireframe";
	export let clear_color: [number, number, number, number];
	export let camera_position: [number | null, number | null, number | null];
	export let zoom_speed: number;
	export let pan_speed: number;

	$: url = value.url;

	let canvas: HTMLCanvasElement;
	let viewer: Viewer;
	let viewerDetails: Readonly<ViewerDetails>;
	let mounted = false;

	onMount(() => {
		const initViewer = async (): Promise<void> => {
			BABYLON_VIEWER = await import("@babylonjs/viewer");
			BABYLON_VIEWER.createViewerForCanvas(canvas, {
				clearColor: clear_color,
				useRightHandedSystem: true,
				animationAutoPlay: true,
				cameraAutoOrbit: { enabled: false },
				onInitialized: (details: any) => {
					viewerDetails = details;
				}
			}).then((promiseViewer: any) => {
				viewer = promiseViewer;
				mounted = true;
			});
		};

		initViewer();

		return () => {
			viewer?.dispose();
		};
	});

	$: mounted && load_model(url);

	function setRenderingMode(pointsCloud: boolean, wireframe: boolean): void {
		viewerDetails.scene.forcePointsCloud = pointsCloud;
		viewerDetails.scene.forceWireframe = wireframe;
	}

	function load_model(url: string | undefined): void {
		if (viewer) {
			if (url) {
				viewer
					.loadModel(url, {
						pluginOptions: {
							obj: {
								importVertexColors: true
							}
						}
					})
					.then(() => {
						if (display_mode === "point_cloud") {
							setRenderingMode(true, false);
						} else if (display_mode === "wireframe") {
							setRenderingMode(false, true);
						} else {
							update_camera(camera_position, zoom_speed, pan_speed);
						}
					});
			} else {
				viewer.resetModel();
			}
		}
	}

	export function update_camera(
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
		const camera = viewerDetails.camera;
		if (camera_position[0] !== null) {
			camera.alpha = (camera_position[0] * Math.PI) / 180;
		}
		if (camera_position[1] !== null) {
			camera.beta = (camera_position[1] * Math.PI) / 180;
		}
		if (camera_position[2] !== null) {
			camera.radius = camera_position[2];
		}
		camera.lowerRadiusLimit = 0.1;
		const updateCameraSensibility = (): void => {
			camera.wheelPrecision = 250 / (camera.radius * zoom_speed);
			camera.panningSensibility = (10000 * pan_speed) / camera.radius;
		};
		updateCameraSensibility();
		camera.onAfterCheckInputsObservable.add(updateCameraSensibility);
	}

	export function reset_camera_position(): void {
		if (viewerDetails) {
			viewer.resetCamera();
		}
	}
</script>

<canvas bind:this={canvas}></canvas>
