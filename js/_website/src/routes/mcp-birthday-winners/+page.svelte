<script lang="ts">
	import mcp_birthday_header from "$lib/assets/img/mcp-birthday-header.png";
	import modal_logo from "$lib/assets/img/modal-logo.png";
	import llamaindex_logo from "$lib/assets/img/llamaindex-logo.png";
	import openai_logo from "$lib/assets/img/openai-logo.png";
	import blaxel_logo from "$lib/assets/img/blaxel-logo.png";
	import hf_logo from "$lib/assets/logos/hf-logo.svg";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
</script>

<MetaTags
	title="MCP's 1st Birthday Hackathon Winners"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Announcing the winners of the MCP's 1st Birthday Hackathon."
/>

<img
	src={mcp_birthday_header}
	alt="MCP's 1st Birthday Hackathon"
	class="mx-auto mt-8"
	style="width: 80%"
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<h1
		class="mb-4 flex items-center text-2xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		Track 1: Building MCP <span class="ml-1 font-semibold"> Winners</span>
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/cite-before-act-mcp"
		target="_blank"
		rel="noopener noreferrer"
		class="flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-green-50 border border-green-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
			<span
				class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				>Best Overall</span
			> 🥇
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>🛡️ Cite-Before-Act MCP</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>bisonnetworking</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			Human-in-the-loop safety middleware for MCP servers. Require explicit
			approval before state-mutating operations.
		</div>
	</a>

	<div class="flex flex-col lg:flex-row gap-5">
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/MCEPTION"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
					>Best Enterprise</span
				>
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>🏭 MCEPTION</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>alihmaou</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				This server allows you to create and deploy other MCP servers on Hugging
				Face Spaces.
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/Finance-Portfolio-Intelligence-Platform"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-purple-50 border border-purple-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
					>Best Consumer</span
				>
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>Portfolio Intelligence Platform</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>BrianIsaac</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				AI-powered portfolio analysis with transparent multi-agent MCP
				orchestration
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/GameContextProtocol"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-orange-50 border border-orange-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
					>Best Creative</span
				>
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>🎮 GCP - Game Context Protocol</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>ArturoNereu</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				Build 3D scenes and games with natural language.
			</div>
		</a>
	</div>
</div>
<!-- -->

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<h1
		class="mb-4 flex items-center text-2xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		Track 2: MCP in Action <span class="ml-1 font-semibold"> Winners</span>
	</h1>

	<h1
		class="mb-4 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		Enterprise Category
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/Vehicle-Diagnostic-Assistant"
		target="_blank"
		rel="noopener noreferrer"
		class="flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-green-50 border border-green-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
			<span
				class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
			></span>
			🥇
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>Vehicle Diagnostic Assistant 🚗 🛠️</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>castlebbs & stargarnet</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			AI agent that connects to your car via an embedded MCP server to provide
			real-time diagnostics and insights.
		</div>
	</a>

	<div class="flex flex-col lg:flex-row gap-5">
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/devrel-agent-gradio"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🥈
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>DevRel Campaign Generator</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>chenglu</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				AI-Powered Content for Developer Relations.
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/datapass"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-purple-50 border border-purple-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🥉
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>DataPass</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>waroca</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				Your pass to private datasets.
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/fleetmind-in-action"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-orange-50 border border-orange-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🏅
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>🚛 FleetMind AI Agent</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>mashrur950</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				Autonomous fleet management powered by AI
			</div>
		</a>
	</div>

	<h1
		class="mb-4 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		Consumer Category
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/MCP-Blockly"
		target="_blank"
		rel="noopener noreferrer"
		class="flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-green-50 border border-green-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
			<span
				class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
			></span>
			🥇
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>MCP Blockly</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>owenkaplinsky</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			AI that makes MCP servers with block-code.
		</div>
	</a>

	<div class="flex flex-col lg:flex-row gap-5">
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/Drone-Control-MCP-Server"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🥈
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>🚁 Drone Control MCP Server</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>akirahrkw</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				Control your drone using MQTT commands through the MCP server
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/directors-cut"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-purple-50 border border-purple-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🥉
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>🎬 Director's Cut - Autonomous Video Editor</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>tyb343 & sahiltanna7 & nikunj30</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				The autonomous multi-agent system that transforms any YouTube video into
				viral vertical content. Zero editing skills. Five AI agents. One click.
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/snowman-ai"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-orange-50 border border-orange-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🏅
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>☃️ Snowman AI</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>nextmarte</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				Autonomous Literature Review Agent powered by LangGraph + Gradio MCP
				Server
			</div>
		</a>
	</div>

	<h1
		class="mb-4 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		Creative Category
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/vidzly"
		target="_blank"
		rel="noopener noreferrer"
		class="flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-green-50 border border-green-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
			<span
				class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
			></span>
			🥇
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>🎬 Vidzly - Your AI-Powered Short Video Creator</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300">
			tthhanh & tiena2cva & Nlag & Daphneee17</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			Transform raw footage into viral-ready content in seconds. No skills
			required. No expensive gear needed. Just your vision and our AI.
		</div>
	</a>

	<div class="flex flex-col lg:flex-row gap-5">
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/the-emergent-show"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🥈
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>📺 The Emergent Show</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>inventwithdean</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				The Emergent Show is a fully autonomous Live Show where the Host, TV
				Crew, Guard, Audience, and Guests are all AI Agents.
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/reachy-beat-bot"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-purple-50 border border-purple-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🥉
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>Reachy Mini Choreography Generator</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>TwinPeaksTownie</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				An MCP tool that generates music from text prompts and creates
				synchronized dance choreography for Reachy Mini robots.
			</div>
		</a>
		<a
			href="https://huggingface.co/spaces/MCP-1st-Birthday/mythforge"
			target="_blank"
			rel="noopener noreferrer"
			class="shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-orange-50 border border-orange-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow lg:ml-2 lg:flex-[1] my-8"
		>
			<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
				<span
					class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				></span> 🏅
			</div>
			<div
				class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
			>
				<span>✧ MYTHFORGE ✧ - The Living Mythology Engine</span>
			</div>
			<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
				>hetanshwaghela</code
			>
			<div
				class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
			>
				An AI-powered mythology world generator that creates complete,
				interconnected mythological universes from a single seed concept using
				Gemini, LlamaIndex, and Gradio.
			</div>
		</a>
	</div>
</div>
<!-- -->

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<h1
		class="mb-4 flex items-center text-2xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		Special Awards <span class="ml-1 font-semibold"> Winners</span>
	</h1>

	<h1
		class="mb-8 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		<img src={modal_logo} alt="Modal Labs Logo" class="w-10 mr-2" />
		Modal Innovation Award
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/legacy_code_modernizer"
		target="_blank"
		rel="noopener noreferrer"
		class="mb-8 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-green-50 border border-green-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-1 right-0 mr-4" style="font-size: 2.5rem;">
			🏅
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>🤖 Legacy Code Modernizer</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>naazimsnh02</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			An autonomous AI agent that modernizes legacy codebases through
			intelligent planning, reasoning, and execution using Model Context
			Protocol (MCP) tools.
		</div>
	</a>

	<h1
		class="mb-8 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		<img src={llamaindex_logo} alt="LlamaIndex Logo" class="w-8 mr-2" />
		LlamaIndex Category Award <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/DungeonMaster-AI"
		target="_blank"
		rel="noopener noreferrer"
		class="mb-4 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-1 right-0 mr-4" style="font-size: 2.5rem;">
			🏅
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>DungeonMaster AI</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>bhupesh-sf</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			Your AI-Powered D&D 5e Game Master with Voice Narration
		</div>
	</a>

	<h1
		class="mb-4 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		<img src={openai_logo} alt="OpenAI Logo" class="w-20 mr-2 dark:invert" />
		Category Awards <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/Brand-Identity-Generator"
		target="_blank"
		rel="noopener noreferrer"
		class="mb-4 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-purple-50 border border-purple-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
			<span
				class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				>Best API Integration</span
			>
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>🖼️ AutoBrand Studio</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>omarash2016 & ABO4SAMRA & Mohamed-Hosny</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			An Autonomous Branding Agent that generates brand identity kits, including
			logos, color palettes, social media content, and summarizes market
			insights — all using MCP tools and autonomous reasoning.
		</div>
	</a>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/dental-chatgpt-app"
		target="_blank"
		rel="noopener noreferrer"
		class="mb-8 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-yellow-50 border border-yellow-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-0 right-0 mr-4" style="font-size: 2.5rem;">
			<span
				class="text-xl font-light p-1 rounded-md text-gray-700 dark:text-gray-200"
				>Best ChatGPT App</span
			>
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>🦷 Complete Dental AI Suite</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>Wildstash</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			7 Specialized MCP Tools for ChatGPT Integration
		</div>
	</a>

	<h1
		class="mb-8 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		<img src={blaxel_logo} alt="Blaxel Logo" class="w-7 mr-2" />
		Blaxel Choice Award <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/BlaxML-Agent"
		target="_blank"
		rel="noopener noreferrer"
		class="mb-4 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-orange-50 border border-orange-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-1 right-0 mr-4" style="font-size: 2.5rem;">
			🏅
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>BlaxML Agent</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>aniketppanchal</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			Autonomous Machine Learning MCP server powered by Blaxel
		</div>
	</a>

	<h1
		class="mb-8 flex items-center text-xl align-middle font-light text-gray-900 dark:text-gray-100 right-0"
	>
		<img src={hf_logo} alt="Hugging Face Logo" class="w-7 mr-2" />
		Community Choice Award <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<a
		href="https://huggingface.co/spaces/MCP-1st-Birthday/anim-lab-ai"
		target="_blank"
		rel="noopener noreferrer"
		class="mb-4 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden rounded-xl bg-orange-50 border border-orange-200 dark:bg-gray-800 dark:border-gray-700 px-3 pb-4 lg:pt-6 hover:shadow-alternate shadow-none transition-shadow align-middle lg:flex-[1.4]"
	>
		<div class="lg:absolute top-1 right-0 mr-4" style="font-size: 2.5rem;">
			🏅
		</div>
		<div
			class="relative mb-2 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100"
		>
			<span>Anim Lab AI</span>
		</div>
		<code class="font-light text-md mb-2 text-gray-500 dark:text-gray-300"
			>ovi054</code
		>
		<div
			class="relative pr-4 text-lg font-light text-gray-600 dark:text-gray-200"
		>
			Equip AI Agents with the power to visualize complex logic using Manim
		</div>
	</a>
</div>
