<script context="module">
	import { Story } from "@storybook/addon-svelte-csf";
	import {
		Error,
		Brush,
		Camera,
		Chart,
		Chat,
		Check,
		Circle,
		Clear,
		Code,
		Color,
		Community,
		Copy,
		Download,
		DropdownArrow,
		Edit,
		Erase,
		File,
		Info,
		Image,
		JSON,
		LineChart,
		Maximize,
		Music,
		Pause,
		Play,
		Plot,
		Remove,
		Sketch,
		Square,
		Table,
		TextHighlight,
		Trash,
		Tree,
		Undo,
		Video,
		Warning,
		ArrowUp,
		ArrowDown,
		Plus,
		Settings,
		Upload,
		Microphone,
		Send
	} from "../../../js/icons/src";

	export const meta = {
		title: "Design System/Icons"
	};

	const icons = [
		{ name: "ArrowUp", value: ArrowUp },
		{ name: "ArrowDown", value: ArrowDown },
		{ name: "Brush", value: Brush },
		{ name: "Camera", value: Camera },
		{ name: "Chart", value: Chart },
		{ name: "Chat", value: Chat },
		{ name: "Check", value: Check },
		{ name: "Circle", value: Circle },
		{ name: "Clear", value: Clear },
		{ name: "Code", value: Code },
		{ name: "Color", value: Color },
		{ name: "Community", value: Community },
		{ name: "Copy", value: Copy },
		{ name: "Download", value: Download },
		{ name: "DropdownArrow", value: DropdownArrow },
		{ name: "Edit", value: Edit },
		{ name: "Erase", value: Erase },
		{ name: "Error", value: Error },
		{ name: "File", value: File },
		{ name: "Image", value: Image },
		{ name: "Info", value: Info },
		{ name: "JSON", value: JSON },
		{ name: "LineChart", value: LineChart },
		{ name: "Maximize", value: Maximize },
		{ name: "Microphone", value: Microphone },
		{ name: "Music", value: Music },
		{ name: "Pause", value: Pause },
		{ name: "Play", value: Play },
		{ name: "Plot", value: Plot },
		{ name: "Plus", value: Plus },
		{ name: "Remove", value: Remove },
		{ name: "Send", value: Send },
		{ name: "Settings", value: Settings },
		{ name: "Sketch", value: Sketch },
		{ name: "Square", value: Square },
		{ name: "Table", value: Table },
		{ name: "TextHighlight", value: TextHighlight },
		{ name: "Trash", value: Trash },
		{ name: "Tree", value: Tree },
		{ name: "Undo", value: Undo },
		{ name: "Upload", value: Upload },
		{ name: "Video", value: Video },
		{ name: "Warning", value: Warning }
	];
</script>

<Story name="Icons">
	<div class="wrapper">
		<section>
			<h1>Icons</h1>
		</section>
		<div class="container">
			{#each icons as Icon}
				<div class="icon-wrapper">
					<div class="icon-name">{Icon.name}</div>
					<div class="icon-display">
						<Icon.value />
					</div>
				</div>
			{/each}
		</div>
	</div>
</Story>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: var(--font-sans, system-ui, sans-serif);
	}

	.icon-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16px;
		border-radius: 8px;
		background: #f8f9fa;
	}

	.icon-wrapper:hover {
		background: #e9ecef;
	}

	.icon-name {
		font-size: 12px;
		color: #374151;
		font-weight: 500;
		margin-bottom: 8px;
	}

	.icon-display {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		color: #374151;
	}

	section {
		background: #fb923c;
		height: 50px;
		width: 90%;
		display: flex;
		align-items: center;
		border-radius: 15px;
		padding: 50px;
		margin: 20px;
	}

	section h1 {
		color: white;
		font-weight: 700;
		font-size: 3em;
	}

	.container {
		display: grid;
		gap: 16px;
		grid-template-columns: repeat(6, 1fr);
		padding: 20px;
		width: 90%;
	}

	@media (max-width: 768px) {
		.container {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
