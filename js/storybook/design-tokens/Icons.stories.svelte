<script>
	// @ts-nocheck
	import { Meta, Story } from "@storybook/addon-svelte-csf";

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
		Dislike,
		Download,
		DropdownArrow,
		Edit,
		Erase,
		File,
		Info,
		Image,
		JSON,
		Like,
		LineChart,
		Maximise,
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
		Warning
	} from "../../icons/src";

	const icons = [
		{ name: "error", value: Error },
		{ name: "brush", value: Brush },
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
		{ name: "Dislike", value: Dislike },
		{ name: "Download", value: Download },
		{ name: "DropdownArrow", value: DropdownArrow },
		{ name: "Edit", value: Edit },
		{ name: "Erase", value: Erase },
		{ name: "File", value: File },
		{ name: "Info", value: Info },
		{ name: "Image", value: Image },
		{ name: "JSON", value: JSON },
		{ name: "Like", value: Like },
		{ name: "LineChart", value: LineChart },
		{ name: "Maximise", value: Maximise },
		{ name: "Music", value: Music },
		{ name: "Pause", value: Pause },
		{ name: "Play", value: Play },
		{ name: "Plot", value: Plot },
		{ name: "Remove", value: Remove },
		{ name: "Sketch", value: Sketch },
		{ name: "Square", value: Square },
		{ name: "Table", value: Table },
		{ name: "TextHighlight", value: TextHighlight },
		{ name: "Trash", value: Trash },
		{ name: "Tree", value: Tree },
		{ name: "Undo", value: Undo },
		{ name: "Video", value: Video },
		{ name: "Warning", value: Warning }
	];
</script>

<Meta title="Design System/Icons" />

<Story name="Icons">
	<div class="wrapper">
		<section>
			<h1>Icons</h1>
		</section>
		<div class="container">
			{#each icons as Icon}
				<div class="icon-wrapper">
					<div class="icon-name">{Icon.name}</div>
					<div
						style="display: flex; flex-direction: column; align-items: center; width: 50px; height: 50px;"
					>
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
		font-family: var(--font);
	}

	.icon-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.icon-name {
		font: var(--font-sans);
		color: var(--block-title-text-color);
		font-weight: var(--block-title-text-weight);
		font-size: var(--block-title-text-size);
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
		gap: 20px;
		grid-template-columns: repeat(6, 1fr);
		padding: 20px;
	}

	@media (max-width: 768px) {
		.container {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
