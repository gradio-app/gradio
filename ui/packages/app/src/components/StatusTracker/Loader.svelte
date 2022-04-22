<script lang="ts">
	import { onMount } from "svelte";
	import { spring } from "svelte/motion";

	const top = spring([0, 0]);
	const bottom = spring([0, 0]);

	let dismounted: boolean;

	function animate(): Promise<void> {
		return new Promise(async (res) => {
			await Promise.all([top.set([125, 140]), bottom.set([-125, -140])]);

			await Promise.all([top.set([-125, 140]), bottom.set([125, -140])]);

			await Promise.all([top.set([-125, 0]), bottom.set([125, -0])]);

			await Promise.all([top.set([125, 0]), bottom.set([-125, 0])]);

			res();
		});
	}

	async function run() {
		await animate();
		console.log(dismounted);
		if (!dismounted) run();
	}

	async function loading() {}

	onMount(async () => {
		await Promise.all([top.set([125, 0]), bottom.set([-125, 0])]);

		run();
		return () => (dismounted = true);
	});
</script>

<div class="m-12" style="transform: translateY(3rem)">
	<svg
		class="text-xl"
		width="7em"
		height="7em"
		viewBox="-1200 -1200 3000 3000"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g style="transform: translate({$top[0]}px, {$top[1]}px);">
			<path
				d="M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z"
				fill="#FF7C00"
				fill-opacity="0.4"
			/>
			<path
				d="M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z"
				fill="#FF7C00"
			/>
			<path
				d="M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z"
				fill="#FF7C00"
				fill-opacity="0.4"
			/>
			<path
				d="M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z"
				fill="#FF7C00"
			/>
		</g>
		<g style="transform: translate({$bottom[0]}px, {$bottom[1]}px);">
			<path
				d="M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z"
				fill="#FF7C00"
				fill-opacity="0.4"
			/>
			<path
				d="M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z"
				fill="#FF7C00"
			/>
			<path
				d="M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z"
				fill="#FF7C00"
				fill-opacity="0.4"
			/>
			<path
				d="M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z"
				fill="#FF7C00"
			/>
		</g>
	</svg>
</div>
