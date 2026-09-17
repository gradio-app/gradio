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
		data,
		oncamera_position
	}: {
		value: FileData;
		display_mode: "solid" | "point_cloud" | "wireframe";
		clear_color: [number, number, number, number];
		camera_position: [number | null, number | null, number | null];
		zoom_speed: number;
		pan_speed: number;
		/** Already-decoded bytes to load instead of fetching `value.url`. */
		data?: Uint8Array<ArrayBuffer>;
		oncamera_position?: (camera_position: [number, number, number]) => void;
	} = $props();

	let url = $derived(value.url);

	let canvas: HTMLCanvasElement;
	let viewer = $state<Viewer>();
	let viewerDetails = $state<Readonly<ViewerDetails>>();
	let mounted = $state(false);

	let load_generation = 0;
	let initialized_generation = -1;

	let settled_radians: [number, number, number] | null = null;
	let settled_degrees: [number, number, number] | null = null;
	let configured_position: [number | null, number | null, number | null] =
		camera_position;

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

		const generation = ++load_generation;

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
			if (generation !== load_generation) return;

			if (display_mode === "point_cloud") {
				setRenderingMode(true, false);
			} else if (display_mode === "wireframe") {
				setRenderingMode(false, true);
			}
			settled_radians = null;
			settled_degrees = null;
			initialized_generation = generation;
			apply_camera(configured_position, false);
		} else {
			settled_radians = null;
			settled_degrees = null;
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
		if (typeof source !== "string") return;
		if (!value.path.toLowerCase().endsWith(".obj")) return;

		const meshes = viewerDetails?.model?.assetContainer.meshes ?? [];
		if (has_drawable_geometry(meshes)) return;

		const points = await resolve_obj_point_cloud(source);
		// `value` can change while the file is in flight. Babylon aborts an
		// in-flight load on the next one, so loading here would undo the newer
		// model rather than the other way round.
		if (!points || !mounted || currentViewer !== viewer || source !== url)
			return;
		await currentViewer.loadModel(
			new File([points], "model.ply"),
			LOAD_OPTIONS
		);
	}

	function to_radians(degrees: number): number {
		return (degrees * Math.PI) / 180;
	}

	function to_degrees(radians: number): number {
		return (radians * 180) / Math.PI;
	}

	function same_position(
		a: [number, number, number],
		b: [number | null, number | null, number | null]
	): boolean {
		return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
	}

	export function update_camera(): void {
		const is_echo =
			settled_degrees !== null &&
			same_position(settled_degrees, camera_position);
		if (!is_echo) configured_position = camera_position;
		apply_camera(camera_position, is_echo);
	}

	function apply_camera(
		position: [number | null, number | null, number | null],
		is_echo: boolean
	): void {
		if (!viewerDetails) return;
		const camera = viewerDetails.camera;

		if (!is_echo) {
			if (position[0] !== null) {
				camera.alpha = to_radians(position[0]);
			}
			if (position[1] !== null) {
				camera.beta = to_radians(position[1]);
			}
			if (position[2] !== null) {
				camera.radius = position[2];
			}
			settled_degrees = [
				position[0] ?? to_degrees(camera.alpha),
				position[1] ?? to_degrees(camera.beta),
				position[2] ?? camera.radius
			];
			settled_radians = [camera.alpha, camera.beta, camera.radius];
		}

		camera.lowerRadiusLimit = 0.1;
		update_camera_sensibility();

		if (!is_echo && settled_degrees) {
			report_camera_position(settled_degrees);
		}
	}

	function update_camera_sensibility(): void {
		if (!viewerDetails) return;
		const camera = viewerDetails.camera;
		camera.wheelPrecision = 250 / (camera.radius * zoom_speed);
		camera.panningSensibility = (10000 * pan_speed) / camera.radius;
	}

	function report_camera_position(
		camera_position: [number, number, number]
	): void {
		if (initialized_generation !== load_generation) return;
		oncamera_position?.(camera_position);
	}

	function unmoved_degrees(index: 0 | 1, radians: number): number | null {
		if (!settled_radians || !settled_degrees) return null;
		return settled_radians[index] === radians ? settled_degrees[index] : null;
	}

	function update_camera_position(): void {
		if (!viewerDetails) return;
		const camera = viewerDetails.camera;
		const radians: [number, number, number] = [
			camera.alpha,
			camera.beta,
			camera.radius
		];
		if (settled_radians && same_position(radians, settled_radians)) return;
		settled_degrees = [
			unmoved_degrees(0, camera.alpha) ?? to_degrees(camera.alpha),
			unmoved_degrees(1, camera.beta) ?? to_degrees(camera.beta),
			camera.radius
		];
		settled_radians = radians;
		report_camera_position(settled_degrees);
	}

	$effect(() => {
		if (!viewerDetails) return;
		const camera = viewerDetails.camera;
		const observer = camera.onAfterCheckInputsObservable.add(() => {
			update_camera_sensibility();
			update_camera_position();
		});
		return () => camera.onAfterCheckInputsObservable.remove(observer);
	});

	export function reset_camera_position(): void {
		if (viewerDetails && viewer) {
			viewer.resetCamera();
		}
	}
</script>

<canvas bind:this={canvas}></canvas>
