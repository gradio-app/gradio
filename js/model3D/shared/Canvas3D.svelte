<script lang="ts">
	import { onMount } from "svelte";
	import type { FileData } from "@gradio/client";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";
	import type { Viewer, ViewerDetails } from "@babylonjs/viewer";

	let BABYLON_VIEWER: typeof import("@babylonjs/viewer");

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

	$: mounted && load_model(resolved_url);

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

	function update_camera(
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
		viewer.resetCamera();
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

	export function reset_camera_position(
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
		if (viewerDetails) {
			update_camera(camera_position, zoom_speed, pan_speed);
		}
	}
</script>

<canvas bind:this={canvas}></canvas>
