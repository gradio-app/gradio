<script lang="ts">
	import { onMount } from "svelte";
	import type { FileData } from "@gradio/client";
	import type { Viewer, ViewerDetails } from "@babylonjs/viewer";

	let BABYLON_VIEWER: typeof import("@babylonjs/viewer");

	let {
		value,
		display_mode,
		clear_color,
		camera_position,
		zoom_speed,
		pan_speed
	}: {
		value: FileData;
		display_mode: "solid" | "point_cloud" | "wireframe";
		clear_color: [number, number, number, number];
		camera_position: [number | null, number | null, number | null];
		zoom_speed: number;
		pan_speed: number;
	} = $props();

	let url = $derived(value.url);

	let canvas: HTMLCanvasElement;
	let viewer = $state<Viewer>();
	let viewerDetails = $state<Readonly<ViewerDetails>>();
	let mounted = $state(false);

	onMount(() => {
		let active = true;

		const initViewer = async (): Promise<void> => {
			BABYLON_VIEWER = await import("@babylonjs/viewer");
			const promiseViewer = await BABYLON_VIEWER.CreateViewerForCanvas(canvas, {
				clearColor: clear_color,
				useRightHandedSystem: true,
				animationAutoPlay: true,
				cameraAutoOrbit: { enabled: false },
				onInitialized: (details: any) => {
					viewerDetails = details;
				}
			});

			if (!active) {
				promiseViewer.dispose();
				return;
			}

			viewer = promiseViewer;
			mounted = true;
		};

		void initViewer();

		return () => {
			active = false;
			mounted = false;
			viewer?.dispose();
			viewer = undefined;
		};
	});

	$effect(() => {
		if (mounted) {
			void load_model(url);
		}
	});

	function setRenderingMode(pointsCloud: boolean, wireframe: boolean): void {
		if (!viewerDetails) return;
		viewerDetails.scene.forcePointsCloud = pointsCloud;
		viewerDetails.scene.forceWireframe = wireframe;
	}

	async function load_model(url: string | undefined): Promise<void> {
		const currentViewer = viewer;
		if (!currentViewer) return;

		if (url) {
			try {
				await currentViewer.loadModel(url, {
					pluginOptions: {
						obj: {
							importVertexColors: true
						}
					}
				});
			} catch (error) {
				if (mounted && currentViewer === viewer) {
					console.error(error);
				}
				return;
			}

			if (!mounted || currentViewer !== viewer) return;

			if (display_mode === "point_cloud") {
				setRenderingMode(true, false);
			} else if (display_mode === "wireframe") {
				setRenderingMode(false, true);
			} else {
				update_camera(camera_position, zoom_speed, pan_speed);
			}
		} else {
			currentViewer.resetModel();
		}
	}

	export function update_camera(
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
		if (!viewerDetails) return;
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
		if (viewerDetails && viewer) {
			viewer.resetCamera();
		}
	}
</script>

<canvas bind:this={canvas}></canvas>
