<script lang="ts">
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	export let label: string;
	export let show_label = true;
	export let interactive = true;
	export let path: string[] = ["path"];
	export let server: {
		ls: (arg0: string[]) => Promise<[string[], string[]]>;
	};
	export let value: string[] | null = null;
	$: selected = value && value.length ? value[-1] : null;
	let type: "file" | "folder" | "any" = "any";
	let loading = false;
	let contents: [string[], string[]] = [[], []];
	const refreshContents = async () => {
		loading = true;
		try {
			contents = await server.ls(path);
		} finally {
			loading = false;
		}
		value = null;
		selected = null;
	};
	$: [folders, files] = contents;
	$: path, refreshContents();
	$: console.log(selected)
</script>

<BlockLabel
	{show_label}
	float={false}
	Icon={File}
	label={label || "File Explorer"}
/>
<div class="container" class:loading>
	<div class="full-path">
		{#each path as level}
			<button
				class="path-level"
				on:click={() => {
					path = path.slice(0, path.indexOf(level) + 1);
				}}>{level}</button
			>
			/
		{/each}
	</div>
	<div class="folders">
		{#each folders as folder}
			<div class="folder">
				<input
					type="radio"
					disabled={type === "file" || !interactive}
					bind:group={selected}
					value={folder}
					on:click={() => {
						if (type === "folder" && interactive) {
							value = [...path, folder];
						}
					}}
				/>
				<button
					on:click={() => {
						path = [...path, folder];
					}}>{folder}/</button
				>
			</div>
		{/each}
	</div>
	<div class="files">
		{#each files as file}
			<label
				class="file"
				on:click={() => {
					if (type === "file" && interactive) {
						value = [...path, file];
					}
				}}
			>
				<input
					type="radio"
					bind:group={selected}
					value={file}
					checked={value && value[value.length - 1] === file}
					disabled={type === "folder" || !interactive}
				/><span>{file}</span>
			</label>
		{/each}
	</div>
</div>

<style>
	.container {
		max-height: var(--size-60);
		overflow-y: auto;
	}
	.container.loading {
		opacity: 0.5;
		pointer-events: none;
	}
	.full-path {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		font-weight: 600;
	}
	.path-level {
		padding: 0 0.5em;
		text-decoration: underline;
	}
	.container {
		padding: var(--block-padding);
	}
	.folders button {
		text-decoration: underline;
	}
	.folder,
	.file {
		display: block;
		margin-top: 8px;
	}
	input[type="radio"] {
		cursor: pointer;
		display: inline-block;
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: var(--checkbox-border-width) solid var(--checkbox-border-color);
		border-radius: var(--radius-full);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
		margin-right: 8px;
	}
	input:checked,
	input:checked:hover,
	input:checked:focus {
		border-color: var(--checkbox-border-color-selected);
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-color-focus);
	}

	input[disabled],
	.disabled {
		opacity: 0;
		pointer-events: none;
	}
</style>
