<script lang="ts">
	import { onMount } from "svelte";
	import type { FileData } from "@gradio/client";
	import type { Viewer, ViewerDetails } from "@babylonjs/viewer";

	let BABYLON_VIEWER: typeof import("@babylonjs/viewer");
	let BABYLON_CORE: typeof import("@babylonjs/core");

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
	let modelLoaded = $state(false);

	onMount(() => {
		const initViewer = async (): Promise<void> => {
			BABYLON_VIEWER = await import("@babylonjs/viewer");
			BABYLON_CORE = await import("@babylonjs/core");
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
		if (mounted && !modelLoaded) {
			loadModel(url);
		}
	});

	function setRenderingMode(pointsCloud: boolean, wireframe: boolean): void {
		if (!viewerDetails) return;
		viewerDetails.scene.forcePointsCloud = pointsCloud;
		viewerDetails.scene.forceWireframe = wireframe;
	}

	/**
	 * Check if loaded meshes have any indices (faces).
	 * If all meshes have zero indices, it's point cloud data.
	 */
	function checkForPointCloudData(): boolean {
		if (!viewerDetails) return false;
		const scene = viewerDetails.scene;
		let hasIndices = false;
		let totalVertices = 0;
		for (const mesh of scene.meshes) {
			if (mesh.getTotalVertices() > 0) {
				totalVertices += mesh.getTotalVertices();
				const indices = mesh.getIndices();
				if (indices && indices.length > 0) {
					hasIndices = true;
				}
			}
		}
		return totalVertices > 0 && !hasIndices;
	}

	/**
	 * Load a PLY point cloud file by parsing vertex data
	 * and creating a BabylonJS mesh with positions (no indices).
	 */
	async function loadPLYPointCloud(url: string): Promise<void> {
		if (!viewerDetails || !BABYLON_CORE) return;
		const scene = viewerDetails.scene;

		try {
			const response = await fetch(url);
			const buffer = await response.arrayBuffer();
			const { positions, colors } = parsePLYPointCloud(buffer);

			if (positions.length === 0) {
				console.error("No vertex positions found in PLY file");
				return;
			}

			const vertexData = new BABYLON_CORE.VertexData();
			vertexData.positions = positions;
			if (colors.length > 0) {
				vertexData.colors = colors;
			}

			const mesh = new BABYLON_CORE.Mesh("pointcloud", scene);
			vertexData.applyToMesh(mesh);

			scene.forcePointsCloud = true;
		} catch (e) {
			console.error("Failed to load PLY point cloud:", e);
		}
	}

	/**
	 * Parse a PLY file buffer and extract vertex positions and colors.
	 * Supports both ASCII and binary (little-endian) PLY formats.
	 */
	function parsePLYPointCloud(
		buffer: ArrayBuffer
	): { positions: number[]; colors: number[] } {
		const text = new TextDecoder("utf-8").decode(buffer);
		const headerEnd = text.indexOf("end_header");
		if (headerEnd === -1) {
			throw new Error("Invalid PLY file: no end_header found");
		}
		const header = text.substring(0, headerEnd);

		const formatMatch = header.match(
			/format (ascii|binary_little_endian|binary_big_endian) 1\.0/
		);
		const isBinary = formatMatch && formatMatch[1] !== "ascii";

		const vertexCountMatch = header.match(/element vertex (\d+)/);
		if (!vertexCountMatch) {
			throw new Error("Invalid PLY file: no vertex count");
		}
		const vertexCount = parseInt(vertexCountMatch[1], 10);

		const propLines = header
			.split("\n")
			.filter((l) => l.trim().startsWith("property "));
		const properties: {
			name: string;
			type: string;
			size: number;
			offset: number;
		}[] = [];
		const typeSizes: Record<string, number> = {
			char: 1,
			uchar: 1,
			short: 2,
			ushort: 2,
			int: 4,
			uint: 4,
			float: 4,
			double: 8
		};

		let offset = 0;
		for (const line of propLines) {
			const parts = line.trim().split(/\s+/);
			if (parts[1] === "list") continue;
			const type = parts[1];
			const name = parts[2];
			const size = typeSizes[type] || 4;
			properties.push({ name, type, size, offset });
			offset += size;
		}

		const xProp = properties.find((p) => p.name === "x");
		const yProp = properties.find((p) => p.name === "y");
		const zProp = properties.find((p) => p.name === "z");
		const rProp = properties.find(
			(p) => p.name === "red" || p.name === "r"
		);
		const gProp = properties.find(
			(p) => p.name === "green" || p.name === "g"
		);
		const bProp = properties.find(
			(p) => p.name === "blue" || p.name === "b"
		);

		if (!xProp || !yProp || !zProp) {
			throw new Error("PLY file missing x, y, or z properties");
		}

		const positions: number[] = [];
		const colors: number[] = [];

		function readValue(
			view: DataView,
			byteOffset: number,
			prop: { type: string; size: number }
		): number {
			switch (prop.type) {
				case "char":
					return view.getInt8(byteOffset);
				case "uchar":
					return view.getUint8(byteOffset);
				case "short":
					return view.getInt16(byteOffset, true);
				case "ushort":
					return view.getUint16(byteOffset, true);
				case "int":
					return view.getInt32(byteOffset, true);
				case "uint":
					return view.getUint32(byteOffset, true);
				case "float":
					return view.getFloat32(byteOffset, true);
				case "double":
					return view.getFloat64(byteOffset, true);
				default:
					return view.getFloat32(byteOffset, true);
			}
		}

		if (isBinary) {
			const dataStart =
				headerEnd + "end_header".length + 1;
			const stride = offset;
			const view = new DataView(buffer, dataStart);

			for (let i = 0; i < vertexCount; i++) {
				const baseOffset = i * stride;
				const x = readValue(
					view,
					baseOffset + xProp.offset,
					xProp
				);
				const y = readValue(
					view,
					baseOffset + yProp.offset,
					yProp
				);
				const z = readValue(
					view,
					baseOffset + zProp.offset,
					zProp
				);
				positions.push(x, y, z);

				if (rProp && gProp && bProp) {
					const r =
						readValue(
							view,
							baseOffset + rProp.offset,
							rProp
						) / 255;
					const g =
						readValue(
							view,
							baseOffset + gProp.offset,
							gProp
						) / 255;
					const b =
						readValue(
							view,
							baseOffset + bProp.offset,
							bProp
						) / 255;
					colors.push(r, g, b, 1);
				}
			}
		} else {
			const data = text
				.substring(headerEnd + "end_header".length + 1)
				.trim();
			const lines = data.split("\n");
			for (
				let i = 0;
				i < Math.min(vertexCount, lines.length);
				i++
			) {
				const vals = lines[i].trim().split(/\s+/);
				const x = parseFloat(vals[properties.indexOf(xProp)]);
				const y = parseFloat(vals[properties.indexOf(yProp)]);
				const z = parseFloat(vals[properties.indexOf(zProp)]);
				positions.push(x, y, z);

				if (rProp && gProp && bProp) {
					const rIdx = properties.indexOf(rProp);
					const gIdx = properties.indexOf(gProp);
					const bIdx = properties.indexOf(bProp);
					const r = parseFloat(vals[rIdx]) / 255;
					const g = parseFloat(vals[gIdx]) / 255;
					const b = parseFloat(vals[bIdx]) / 255;
					colors.push(r, g, b, 1);
				}
			}
		}

		return { positions, colors };
	}

	async function loadModel(url: string | undefined): Promise<void> {
		if (!viewer || !url) return;

		if (url.endsWith(".ply")) {
			// .ply point cloud files: load via BabylonJS custom geometry
			await loadPLYPointCloud(url);
			modelLoaded = true;
			update_camera(camera_position, zoom_speed, pan_speed);
			return;
		}

		// Standard model files (.obj, .glb, .stl, .gltf): use BabylonJS viewer
		viewer
			.loadModel(url, {
				pluginOptions: {
					obj: {
						importVertexColors: true
					}
				}
			})
			.then(() => {
				// Auto-detect point cloud data (no faces/indices)
				const isPC = checkForPointCloudData();
				if (display_mode === "point_cloud" || isPC) {
					setRenderingMode(true, false);
				} else if (display_mode === "wireframe") {
					setRenderingMode(false, true);
				} else {
					update_camera(camera_position, zoom_speed, pan_speed);
				}
				modelLoaded = true;
			});
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
