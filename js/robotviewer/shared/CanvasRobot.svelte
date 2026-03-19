<script lang="ts">
	import { onMount } from "svelte";
	import type { FileData } from "@gradio/client";

	let {
		value,
		joint_states = null,
		clear_color = [0, 0, 0, 0],
		camera_position = [null, null, null],
		zoom_speed = 1,
		pan_speed = 1,
		show_joint_names = false
	}: {
		value: FileData;
		joint_states?: Record<string, number> | null;
		clear_color?: [number, number, number, number];
		camera_position?: [number | null, number | null, number | null];
		zoom_speed?: number;
		pan_speed?: number;
		show_joint_names?: boolean;
	} = $props();

	let container: HTMLDivElement;
	let mounted = $state(false);

	let THREE: typeof import("three");
	let scene: import("three").Scene;
	let camera: import("three").PerspectiveCamera;
	let renderer: import("three").WebGLRenderer;
	let controls: any;
	let robot: any = null;
	let animationId: number = 0;
	let resizeObserver: ResizeObserver | null = null;

	let url = $derived(value?.url ?? null);

	onMount(() => {
		initScene();
		return cleanup;
	});

	async function initScene(): Promise<void> {
		THREE = await import("three");
		const { OrbitControls } = await import(
			"three/examples/jsm/controls/OrbitControls.js"
		);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		container.appendChild(renderer.domElement);

		scene = new THREE.Scene();
		const [r, g, b, a] = clear_color;
		if (a > 0) {
			scene.background = new THREE.Color(r, g, b);
		}

		const width = container.clientWidth || 400;
		const height = container.clientHeight || 400;
		camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000);
		camera.position.set(2, 2, 2);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.1;
		controls.zoomSpeed = zoom_speed;
		controls.panSpeed = pan_speed;

		// Lights
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(5, 10, 5);
		directionalLight.castShadow = true;
		scene.add(directionalLight);

		const hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.3);
		scene.add(hemisphereLight);

		// Ground grid
		const gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0xcccccc);
		scene.add(gridHelper);

		handleResize();
		resizeObserver = new ResizeObserver(handleResize);
		resizeObserver.observe(container);

		mounted = true;
		animate();

		if (url) {
			await loadRobot(url);
		}
	}

	function handleResize(): void {
		if (!renderer || !camera || !container) return;
		const width = container.clientWidth;
		const height = container.clientHeight;
		if (width === 0 || height === 0) return;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}

	function animate(): void {
		animationId = requestAnimationFrame(animate);
		controls?.update();
		if (renderer && scene && camera) {
			renderer.render(scene, camera);
		}
	}

	// React to URL changes
	let prevUrl: string | null = null;
	$effect(() => {
		if (mounted && url !== prevUrl) {
			prevUrl = url;
			if (url) {
				loadRobot(url);
			}
		}
	});

	// React to joint_states changes
	$effect(() => {
		if (robot && joint_states) {
			applyJointStates(joint_states);
		}
	});

	function applyJointStates(states: Record<string, number>): void {
		if (!robot) return;
		if (typeof robot.setJointValues === "function") {
			robot.setJointValues(states);
		}
	}

	async function loadRobot(robotUrl: string): Promise<void> {
		if (!THREE || !scene) return;

		// Remove existing robot
		if (robot) {
			scene.remove(robot);
			robot = null;
		}

		const ext = robotUrl.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

		if (ext === "urdf") {
			await loadURDF(robotUrl);
		} else if (ext === "xml" || ext === "mjcf") {
			await loadMJCF(robotUrl);
		}

		if (robot) {
			scene.add(robot);
			fitCameraToObject(robot);

			if (joint_states) {
				applyJointStates(joint_states);
			}
		}
	}

	async function loadURDF(robotUrl: string): Promise<void> {
		const URDFLoaderModule = await import("urdf-loader");
		const URDFLoader = URDFLoaderModule.default;
		const loader = new URDFLoader();

		// Resolve package:// URIs relative to the URDF URL
		const baseUrl = robotUrl.substring(0, robotUrl.lastIndexOf("/") + 1);
		loader.packages = (_pkg: string): string => baseUrl;

		return new Promise<void>((resolve, reject) => {
			loader.load(
				robotUrl,
				(result: any) => {
					robot = result;
					resolve();
				},
				undefined,
				(error: any) => {
					console.error("Failed to load URDF:", error);
					reject(error);
				}
			);
		});
	}

	async function loadMJCF(robotUrl: string): Promise<void> {
		const { parseMJCF } = await import("./mjcf-parser.js");
		const response = await fetch(robotUrl);
		const xmlText = await response.text();
		robot = parseMJCF(THREE, xmlText);
	}

	function fitCameraToObject(object: import("three").Object3D): void {
		if (!THREE || !camera || !controls) return;

		const box = new THREE.Box3().setFromObject(object);
		const size = new THREE.Vector3();
		const center = new THREE.Vector3();
		box.getSize(size);
		box.getCenter(center);

		const maxDim = Math.max(size.x, size.y, size.z);
		if (maxDim === 0) return;

		const fov = camera.fov * (Math.PI / 180);
		let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
		cameraDistance *= 1.5;

		camera.position.set(
			center.x + cameraDistance * 0.5,
			center.y + cameraDistance * 0.7,
			center.z + cameraDistance
		);
		controls.target.copy(center);
		controls.update();
	}

	function cleanup(): void {
		cancelAnimationFrame(animationId);
		resizeObserver?.disconnect();
		controls?.dispose();
		renderer?.dispose();
		if (renderer?.domElement && container?.contains(renderer.domElement)) {
			container.removeChild(renderer.domElement);
		}
	}
</script>

<div bind:this={container} class="canvas-container"></div>

<style>
	.canvas-container {
		width: 100%;
		height: 100%;
		min-height: 300px;
	}
	.canvas-container :global(canvas) {
		width: 100% !important;
		height: 100% !important;
		display: block;
	}
</style>
