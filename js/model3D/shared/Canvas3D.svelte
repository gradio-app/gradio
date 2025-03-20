<script lang="ts">
	import { onMount } from "svelte";
	import * as BABYLON_VIEWER from "@babylonjs/viewer";
	import type { FileData } from "@gradio/client";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";

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
	let viewer: BABYLON_VIEWER.Viewer;
	let viewerDetails: Readonly<BABYLON_VIEWER.ViewerDetails>;
	let mounted = false;

	onMount(() => {
		// Initialize BabylonJS viewer
		BABYLON_VIEWER.createViewerForCanvas(canvas, 
			{
				clearColor: clear_color, 
				useRightHandedSystem: true,
				cameraAutoOrbit: {enabled: false},
				onInitialized:(details: Readonly<BABYLON_VIEWER.ViewerDetails>)=>{
					viewerDetails = details;
				}
		}).then((promiseViewer: BABYLON_VIEWER.Viewer) =>{
			viewer = promiseViewer;
			mounted = true;
		});
		
		return () => {
			viewer.dispose();
		};
	});

	$: mounted && load_model(resolved_url);

	function setRenderingMode(pointsCloud: boolean, wireframe: boolean): void {
		viewerDetails.scene.forcePointsCloud = pointsCloud;
		viewerDetails.scene.forceWireframe = wireframe;
	}

	function load_model(url: string | undefined): void {
		if (viewer) {
			viewer.loadModel(url!, 
			{
				pluginOptions: {
					obj: {
					importVertexColors: true,
					},
				}
			}
			).then(()=>{
				if (display_mode === "point_cloud") {
					setRenderingMode(true, false);
				} else if (display_mode === "wireframe") {
					setRenderingMode(false, true);
				} else {
					update_camera(camera_position, zoom_speed, pan_speed);
				}
			});
		}
	}

	function update_camera(
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
		const camera = viewerDetails.camera;
		if (camera_position[0] !== null) {
			camera.alpha = BABYLON.Tools.ToRadians(camera_position[0]);
		}
		if (camera_position[1] !== null) {
			camera.beta = BABYLON.Tools.ToRadians(camera_position[1]);
		}
		if (camera_position[2] !== null) {
			camera.radius = camera_position[2];
		}
		camera.lowerRadiusLimit = 0.1;
		const updateCameraSensibility = (): void => {
			camera.wheelPrecision = 250 / (camera.radius * zoom_speed);
			camera.panningSensibility =
				(10000 * pan_speed) / camera.radius;
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
