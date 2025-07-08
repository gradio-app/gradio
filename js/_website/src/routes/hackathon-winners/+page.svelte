<script lang="ts">
	import hackathon_header from "$lib/assets/img/hackathon-header.png";
	import LLMGameHub from "$lib/assets/img/LLMGameHub.png";
	import SentinelOne from "$lib/assets/img/sentinel.png";
	import Geocalc from "$lib/assets/img/geocalc.png";
	import DocMCP from "$lib/assets/img/doc-mcp.png";
	import VisualWorkflowBuilder from "$lib/assets/img/workflow.png";
	import ChessTools from "$lib/assets/img/chess.png";
	import Consilium from "$lib/assets/img/consilium.png";
	import MMORPG from "$lib/assets/img/mmorpg.png";
	import modal_logo from "$lib/assets/img/modal-logo.png";
	import sambanova_logo from "$lib/assets/img/sambanova-logo.png";
	import mistral_logo from "$lib/assets/img/mistral-logo.png";
	import llamaindex_logo from "$lib/assets/img/llamaindex-logo.png";
	import shallowcoderesearch from "$lib/assets/img/shallowcoderesearch.png";
	import instagramcaption from "$lib/assets/img/instagramcaption.png";
	import nasaspaceexplorer from "$lib/assets/img/nasaspaceexplorer.png";
	import opensorus from "$lib/assets/img/opensorus.png";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
</script>

<MetaTags
	title="Gradio Hackathon Winners"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Announcing the winners of the Gradio Agents & MCP Hackathon."
/>

<img
	src={hackathon_header}
	alt="Gradio Hackathon Winners"
	class="mx-auto"
	style="width: 80%"
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		🤖 Agent Track <span class="ml-1 font-semibold"> Winners</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/LLMGameHub"
			target="_blank"
			class="from-green-100 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle lg:mr-2 lg:flex-[1.4]"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2.5rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$2,500</span
				> 🥇
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>🎮 LLMGameHub</span>
			</div>
			<code class="font-light text-md mb-2">gsavin & kikikita</code>
			<div class="relative pr-4 text-lg font-light">
				Your personal visual novel. Craft your own adventures with an AI-powered
				game master!
			</div>

			<img
				src={LLMGameHub}
				alt="LLMGameHub UI Screenshot"
				class="m-2 mt-3 p-5"
			/>
		</a>
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/Sentinel_One"
			target="_blank"
			class="from-blue-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 lg:ml-2 lg:flex-[1] self-start my-8"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2.5rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$500</span
				> 🥈
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>🛰️ Sentinel One</span>
			</div>
			<code class="font-light text-md mb-2"
				>Paul Barbaste, Tristan Darrigol & Clément Peponnet</code
			>
			<div class="relative pr-4 text-lg font-light">
				Climate risk evaluation multiagents. Instantly analyze climate risks
				from any location.
			</div>

			<img
				src={SentinelOne}
				alt="Sentinel One UI Screenshot"
				class="m-2 mt-3 p-5"
			/>
		</a>
	</div>

	<a
		href="https://huggingface.co/spaces/Agents-MCP-Hackathon/cs-agent"
		target="_blank"
		class="from-blue-50 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle my-8"
	>
		<div
			class="lg:absolute top-0 right-0 mr-4 text-gray-500"
			style="font-size: 2.5rem;"
		>
			<span class="text-xl font-semibold p-1 rounded-md">Honorable Mention</span
			>
		</div>
		<div class="relative mb-2 flex items-center text-lg font-semibold">
			<span>💬 cs-agent</span>
		</div>
		<code class="font-light text-md mb-2">karenwky</code>
		<div class="relative pr-4 text-lg font-light">
			Smart Customer Support Triage Agent
		</div>
	</a>
</div>
<!-- -->

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		🛠️ MCP Track <span class="ml-1 font-semibold"> Winners</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/geocalc-mcp"
			target="_blank"
			class="from-orange-100 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle lg:mr-2 lg:flex-[1.4]"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2.5rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$2,500</span
				> 🥇
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>🌍 Geocalc MCP Server</span>
			</div>
			<code class="font-light text-md mb-2">renzoide</code>
			<div class="relative pr-4 text-lg font-light">
				A collection of tools for geographic calculations.
			</div>
			<img src={Geocalc} alt="GeoCalc UI Screenshot" class="m-2 mt-3 p-5" />
		</a>
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/doc-mcp"
			target="_blank"
			class="from-yellow-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 lg:ml-2 lg:flex-[1] self-start my-8"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2.5rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$500</span
				> 🥈
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>📚 Doc-MCP</span>
			</div>
			<code class="font-light text-md mb-2">mdabidhussain</code>
			<div class="relative pr-4 text-lg font-light">
				Documentation RAG system. Transform GitHub documentation repositories
				into accessible MCP servers.
			</div>
			<img src={DocMCP} alt="Doc-MCP UI Screenshot" class="m-2 mt-3 p-5" />
		</a>
	</div>

	<a
		href="https://huggingface.co/spaces/Agents-MCP-Hackathon/Spotify-mcp"
		target="_blank"
		class="from-yellow-50 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle my-8"
	>
		<div
			class="lg:absolute top-0 right-0 mr-4 text-gray-500"
			style="font-size: 2.5rem;"
		>
			<span class="text-xl font-semibold p-1 rounded-md">Honorable Mention</span
			>
		</div>
		<div class="relative mb-2 flex items-center text-lg font-semibold">
			<span>🎵 Spotify MCP</span>
		</div>
		<code class="font-light text-md mb-2">lenpanda</code>
		<div class="relative pr-4 text-lg font-light">
			Manage your Spotify experience, from authentication to playlist management
			and music playback control.
		</div>
	</a>
</div>
<!-- -->

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		🧱 Custom Component Track <span class="ml-1 font-semibold"> Winners</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_workflowbuilder"
			target="_blank"
			class="from-purple-100 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle lg:mr-2 lg:flex-[1.4]"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2.5rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$2,500</span
				> 🥇
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>🎨 Visual Workflow Builder</span>
			</div>
			<code class="font-light text-md mb-2">jayavibhav</code>
			<div class="relative pr-4 text-lg font-light">
				Create sophisticated workflows with drag and drop simplicity.
			</div>

			<img
				src={VisualWorkflowBuilder}
				alt="Visual Workflow Builder UI Screenshot"
				class="m-2 mt-3 p-5"
			/>
		</a>
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/chess-mcp-server"
			target="_blank"
			class="from-pink-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 lg:ml-2 lg:flex-[1] self-start my-8"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2.5rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$500</span
				> 🥈
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>♟️ Chess Tools</span>
			</div>
			<code class="font-light text-md mb-2">czakop</code>
			<div class="relative pr-4 text-lg font-light">
				Specialized MCP server tailored for chess, designed to enhance
				interactions by providing structured chess-related information and
				analysis.
			</div>

			<img
				src={ChessTools}
				alt="Chess Tools UI Screenshot"
				class="m-2 mt-3 p-5"
			/>
		</a>
	</div>

	<a
		href="https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_consilium_roundtable"
		target="_blank"
		class="from-pink-50 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle my-8"
	>
		<div
			class="lg:absolute top-0 right-0 mr-4 text-gray-500"
			style="font-size: 2.5rem;"
		>
			<span class="text-xl font-semibold p-1 rounded-md">Honorable Mention</span
			>
		</div>
		<div class="relative mb-2 flex items-center text-lg font-semibold">
			<span>🎭 Consilium Roundtable </span>
		</div>
		<code class="font-light text-md mb-2">azettl</code>
		<div class="relative pr-4 text-lg font-light">
			The roundtable for artificial minds
		</div>
	</a>

	<a
		href="https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_agent_inspector"
		target="_blank"
		class="from-pink-50 flex-grow shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle my-8"
	>
		<div
			class="lg:absolute top-0 right-0 mr-4 text-gray-500"
			style="font-size: 2.5rem;"
		>
			<span class="text-xl font-semibold p-1 rounded-md">Honorable Mention</span
			>
		</div>
		<div class="relative mb-2 flex items-center text-lg font-semibold">
			<span>🕵️ Agent Inspector</span>
		</div>
		<code class="font-light text-md mb-2">p3nguknight & Francois Lancelot</code>
		<div class="relative pr-4 text-lg font-light">
			Whether you're building, testing, or fine-tuning your agent, Agent
			Inspector helps you understand what's happening under the hood.
		</div>
	</a>
</div>
<!-- -->

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		🎁 Special Awards <span class="ml-1 font-semibold"> Winners</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/consilium_mcp"
			target="_blank"
			class="from-green-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle lg:mr-2"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2rem;"
			>
				<span class="text-xl font-semibold text-gray-500">
					Community Choice
				</span>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$500</span
				>
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>🎭 Consilium</span>
			</div>
			<code class="font-light text-md mb-2">azettl</code>
			<div class="relative pr-4 text-lg font-light">
				Multi-AI Expert Consensus Platform
			</div>
			<img src={Consilium} alt="Consilium UI Screenshot" class="m-2 mt-3 p-5" />
		</a>
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/MMORPG_AI_NPC_MCP_CLIENT_SERVER"
			target="_blank"
			class="from-blue-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 lg:ml-2"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2rem;"
			>
				<span class="text-xl font-semibold text-gray-500">
					Most Innovative
				</span>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$500</span
				>
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>🎮 MMORPG with MCP Integration</span>
			</div>
			<code class="font-light text-md mb-2">Chris4K</code>
			<div class="relative pr-4 text-lg font-light">
				Modern Multiplayer Online Role-Playing Game.
			</div>
			<img src={MMORPG} alt="MMORPG UI Screenshot" class="m-2 mt-3 p-5" />
		</a>
	</div>
</div>

<!-- -->

<div class="container mx-auto px-4 relative pt-8 mb-0 mt-8">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		<img src={modal_logo} alt="Modal Labs Logo" class="w-10 mr-2" />
		Modal Labs Choice Award <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/ShallowCodeResearch"
			target="_blank"
			class="from-orange-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$5000</span
				>
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>Shallow Research Code Assistant Hub</span>
			</div>
			<code class="font-light text-md mb-2">HallD</code>
			<div class="relative pr-4 text-lg font-light">
				Streamlined interface for AI-assisted research and code generation
			</div>
			<img
				src={shallowcoderesearch}
				alt="ShallowCodeResearch UI Screenshot"
				class="m-2 mt-3 p-5"
			/>
		</a>
	</div>
</div>

<!--  -->
<div class="container mx-auto px-4 relative pt-8 mb-0 mt-8">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		<img src={sambanova_logo} alt="Sambanova Logo" class="w-10 mr-2" />
		Sambanova Choice Award <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/caption-creator-pro"
			target="_blank"
			class="from-purple-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$500</span
				>
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>📱 INSTAGRAM CAPTION GENERATOR</span>
			</div>
			<code class="font-light text-md mb-2">GChilukala</code>
			<div class="relative pr-4 text-lg font-light">
				Advanced AI-Powered Instagram Caption Generator with SambaNova
				Integration
			</div>
			<img
				src={instagramcaption}
				alt="Instagram Caption Generator UI Screenshot"
				class="m-2 mt-3 p-5"
			/>
		</a>
	</div>
</div>

<!--  -->
<div class="container mx-auto px-4 relative pt-8 mb-0 mt-8">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		<img src={mistral_logo} alt="Mistral Logo" class="w-10 mr-2" />
		Mistral Choice Award <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/OpenSorus"
			target="_blank"
			class="from-green-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$2000 API Credits</span
				>
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>OpenSorus</span>
			</div>
			<code class="font-light text-md mb-2">halfacupoftea</code>
			<div class="relative pr-4 text-lg font-light">
				AI Maintainer Agent for GitHub Issues
			</div>
			<img src={opensorus} alt="OpenSorus UI Screenshot" class="m-2 mt-3 p-5" />
		</a>
	</div>
</div>

<!--  -->
<div class="container mx-auto px-4 relative pt-8 mb-0 mt-8">
	<h1 class="mb-4 flex items-center text-2xl align-middle font-light right-0">
		<img src={llamaindex_logo} alt="LlamaIndex Logo" class="w-10 mr-2" />
		LlamaIndex Choice Award <span class="ml-1 font-semibold"> Winner</span>
	</h1>

	<div class="flex flex-col lg:flex-row gap-5 mt-8">
		<a
			href="https://huggingface.co/spaces/Agents-MCP-Hackathon/nasa-space-explorer"
			target="_blank"
			class="from-blue-100 shadow-alternate hover:scale-[1.02] group group relative flex flex-col overflow-hidden md:first:row-span-3 rounded-xl bg-gradient-to-r px-3 pb-4 lg:pt-6 hover:shadow-alternate to-white shadow-none transition-shadow dark:from-gray-850 align-middle"
		>
			<div
				class="lg:absolute top-0 right-0 mr-4 text-green-500"
				style="font-size: 2rem;"
			>
				<span class="text-xl font-semibold bg-green-100 p-1 rounded-md"
					>$1,000</span
				>
			</div>
			<div class="relative mb-2 flex items-center text-lg font-semibold">
				<span>🚀 NASA Space Explorer Assistant</span>
			</div>
			<code class="font-light text-md mb-2">ClementeH</code>
			<div class="relative pr-4 text-lg font-light">
				MCP-powered space data access + AI Chat Assistant
			</div>
			<img
				src={nasaspaceexplorer}
				alt="NASA Space Explorer Assistant UI Screenshot"
				class="m-2 mt-3 p-5"
			/>
		</a>
	</div>
</div>

<style>
	.quick-link {
		transition: transform 0.1s ease-in-out;
	}
</style>
