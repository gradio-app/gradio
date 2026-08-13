<script lang="ts">
	import { onMount } from "svelte";
	import type { FileData } from "@gradio/client";
	import type { Viewer, ViewerDetails } from "@babylonjs/viewer";
	import { has_drawable_geometry, resolve_obj_point_cloud } from "./obj.js";

	let BABYLON_VIEWER: typeof import("@babylonjs/viewer");

	const LOAD_OPTIONS = {
		pluginOptions: {
			obj: {
				importVertexColors: true
			}
		}
	};

	let {
		value,
		display_mode,
		clear_color,
		camera_position,
		zoom_speed,
		pan_speed,
		data
	}: {
		value: FileData;
		display_mode: "solid" | "point_cloud" | "wireframe";
		clear_color: [number, number, number, number];
		camera_position: [number | null, number | null, number | null];
		zoom_speed: number;
		pan_speed: number;
		/** Already-decoded bytes to load instead of fetching `value.url`. */
		data?: Uint8Array<ArrayBuffer>;
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
			// Babylon picks its loader from the filename, so decoded bytes are
			// handed over as a named file rather than a bare buffer.
			void load_model(data ? new File([data], "model.ply") : url);
		}
	});

	function setRenderingMode(pointsCloud: boolean, wireframe: boolean): void {
		if (!viewerDetails) return;
		viewerDetails.scene.forcePointsCloud = pointsCloud;
		viewerDetails.scene.forceWireframe = wireframe;
	}

	async function load_model(source: string | File | undefined): Promise<void> {
		const currentViewer = viewer;
		if (!currentViewer) return;

		if (source) {
			try {
				await currentViewer.loadModel(source, LOAD_OPTIONS);
				if (mounted && currentViewer === viewer) {
					await load_as_point_cloud(currentViewer, source);
				}
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

	/**
	 * A face-less OBJ can load without error and leave nothing to draw, so it is
	 * reloaded as a point cloud. See obj.ts.
	 */
	async function load_as_point_cloud(
		currentViewer: Viewer,
		source: string | File
	): Promise<void> {
		if (typeof source !== "string" || !value.path.endsWith(".obj")) return;
		const meshes = viewerDetails?.model?.assetContainer.meshes ?? [];
		if (has_drawable_geometry(meshes)) return;

		const points = await resolve_obj_point_cloud(source);
		if (!points || !mounted || currentViewer !== viewer) return;
		await currentViewer.loadModel(
			new File([points], "model.ply"),
			LOAD_OPTIONS
		);
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
