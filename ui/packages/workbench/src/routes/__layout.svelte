<script>
	import "../app.css";
	import * as _ from "@gradio/theme";
	import Nav from "./_Nav.svelte";
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600&family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<h1
	class="font-semibold px-6 py-2 border-b flex items-center text-orange-500 bg-gradient-to-r from-orange-50 to-white border-orange-50"
>
	<svg
		class="mr-2"
		width="1em"
		height="1em"
		viewBox="0 0 510 502"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
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
	</svg>

	workbench
</h1>
<div class="flex pt-6">
	<Nav />

	<main class="gradio-bg px-6 w-full">
		<div class="gradio-interface">
			<slot />
		</div>
	</main>
</div>
