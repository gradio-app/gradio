<script lang="ts">
	import { onMount } from "svelte";
	import type { FileData } from "@gradio/client";
	import type { Viewer, ViewerDetails } from "@babylonjs/viewer";
	import { Color4, PointsCloudSystem, Vector3 } from "@babylonjs/core";
	import type { Mesh } from "@babylonjs/core";
	import { load_obj_point_cloud, type PointCloudData } from "./point-cloud";

	let BABYLON_VIEWER: typeof import("@babylonjs/viewer");

	let {
		value,
		display_mode,
		clear_color,
		camera_position,
		zoom_speed,
		pan_speed,
		point_cloud = null
	}: {
		value: FileData;
		display_mode: "solid" | "point_cloud" | "wireframe";
		clear_color: [number, number, number, number];
		camera_position: [number | null, number | null, number | null];
		zoom_speed: number;
		pan_speed: number;
		point_cloud?: PointCloudData | null;
	} = $props();

	let url = $derived(value.url);

	let canvas: HTMLCanvasElement;
	let viewer = $state<Viewer>();
	let viewerDetails = $state<Readonly<ViewerDetails>>();
	let mounted = $state(false);
	let pointCloudSystem: PointsCloudSystem | undefined;
	let pointCloudMesh: Mesh | undefined;
	let loadToken = 0;

	onMount(() => {
		const initViewer = async (): Promise<void> => {
			BABYLON_VIEWER = await import("@babylonjs/viewer");
			BABYLON_VIEWER.CreateViewerForCanvas(canvas, {
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

	$effect(() => {
		if (mounted) {
			load_model(url);
		}
	});

	function setRenderingMode(pointsCloud: boolean, wireframe: boolean): void {
		if (!viewerDetails) return;
		viewerDetails.scene.forcePointsCloud = pointsCloud;
		viewerDetails.scene.forceWireframe = wireframe;
	}

	function clear_point_cloud(): void {
		pointCloudSystem?.dispose();
		pointCloudSystem = undefined;
		pointCloudMesh = undefined;
	}

	function is_obj_url(url: string): boolean {
		return url.toLowerCase().split(/[?#]/)[0].endsWith(".obj");
	}

	async function try_load_obj_point_cloud(
		url: string
	): Promise<PointCloudData | null> {
		try {
			return await load_obj_point_cloud(url);
		} catch {
			return null;
		}
	}

	async function render_point_cloud(
		point_cloud: PointCloudData,
		currentToken: number
	): Promise<void> {
		if (!viewerDetails || !viewer) return;

		viewer.resetModel();
		clear_point_cloud();

		const scene = viewerDetails.scene;
		const points = point_cloud.positions.length / 3;
		const system = new PointsCloudSystem("gradio-point-cloud", 2, scene, {
			updatable: false
		});

		system.addPoints(points, (particle: any, index: number) => {
			const position_index = index * 3;
			particle.position = new Vector3(
				point_cloud.positions[position_index],
				point_cloud.positions[position_index + 1],
				point_cloud.positions[position_index + 2]
			);

			if (point_cloud.colors) {
				const color_index = index * 4;
				particle.color = new Color4(
					point_cloud.colors[color_index],
					point_cloud.colors[color_index + 1],
					point_cloud.colors[color_index + 2],
					point_cloud.colors[color_index + 3]
				);
			}
		});

		pointCloudSystem = system;
		const mesh = await system.buildMeshAsync();
		if (currentToken !== loadToken) {
			system.dispose();
			return;
		}
		pointCloudMesh = mesh;

		const bounds = pointCloudMesh.getBoundingInfo().boundingBox;
		const center = Vector3.Center(bounds.minimumWorld, bounds.maximumWorld);
		const radius = Math.max(
			Vector3.Distance(bounds.minimumWorld, bounds.maximumWorld),
			1
		);

		viewerDetails.camera.setTarget(center);
		viewerDetails.camera.radius = radius * 1.5;
		update_camera(camera_position, zoom_speed, pan_speed);
	}

	async function load_model(url: string | undefined): Promise<void> {
		const currentToken = ++loadToken;
		if (viewer) {
			if (url) {
				clear_point_cloud();
				const parsedPointCloud =
					point_cloud ??
					(is_obj_url(url) ? await try_load_obj_point_cloud(url) : null);
				if (currentToken !== loadToken) return;
				if (parsedPointCloud) {
					await render_point_cloud(parsedPointCloud, currentToken);
					return;
				}

				viewer
					.loadModel(url, {
						pluginOptions: {
							obj: {
								importVertexColors: true
							}
						}
					})
					.then(() => {
						if (currentToken !== loadToken) return;
						if (display_mode === "point_cloud") {
							setRenderingMode(true, false);
						} else if (display_mode === "wireframe") {
							setRenderingMode(false, true);
						} else {
							update_camera(camera_position, zoom_speed, pan_speed);
						}
					});
			} else {
				clear_point_cloud();
				viewer.resetModel();
			}
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
