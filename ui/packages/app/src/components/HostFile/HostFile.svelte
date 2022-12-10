<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	// import { HostFile } from "@gradio/hostfile";
	import { Block } from "@gradio/atoms";
	import { prettyBytes } from "./utils";

	export let label: string;
	export let root: string;
	export let elem_id: string = "";
	export let component_id: number;
	export let file_count: "single" | "multiple" = "single";
	export let select: "file" | "folder" | "both" = "file";
	export let mode: "static" | "dynamic";
	export let visible: boolean = true;
	export let value: [string[], string[]] = [[], []];
	export let loading_status: LoadingStatus;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	export let api: (
		path: string[]
	) => Promise<[{ name: string; isfile: boolean; size: number | null }]>;

	const valid_selection = (isfile: boolean) => {
		if (select === "both") {
			return true;
		} else if (select === "file" && isfile) {
			return true;
		} else if (select === "folder" && !isfile) {
			return true;
		}
		return false;
	};

	$: [dir_path, selected_files] = value;
	$: dir_api_call = api(dir_path);
	$: value, dispatch("change");
</script>

<Block {visible} {elem_id}>
	<StatusTracker {...loading_status} />
	<div class="p-2 text-lg bg-white-400">
		{#each dir_path as folder, i}
			<button
				class="underline"
				on:click={() => {
					value[0] = dir_path.slice(0, i + 1);
				}}>{folder}</button
			> / &nbsp;
		{/each}
	</div>
	{#await dir_api_call then dir_content}
		<table class="w-full">
			<thead class="text-left">
				<tr>
					{#if mode === "dynamic"}
						<th class="p-2">
							{#if file_count === "multiple"}<input
									type="checkbox"
									name={elem_id}
									checked={selected_files.length ===
										dir_content.filter((file) => valid_selection(file.isfile))
											.length && selected_files.length > 0}
									on:click={() => {
										if (
											selected_files.length ===
											dir_content.filter((file) => valid_selection(file.isfile))
												.length
										) {
											value[1] = [];
										} else {
											value[1] = dir_content
												.filter((file) => valid_selection(file.isfile))
												.map((file) => file.name);
										}
									}}
								/>
							{/if}
						</th>
					{/if}
					<th class="p-2">Name</th>
					<th class="p-2">Size</th>
					<th class="p-2">Download</th>
				</tr>
			</thead>
			<tbody>
				{#each dir_content as file}
					<tr>
						{#if mode === "dynamic"}
							<td class="p-2">
								{#if valid_selection(file.isfile)}
									<input
										type={file_count === "multiple" ? "checkbox" : "radio"}
										name={elem_id}
										checked={selected_files.includes(file.name)}
										on:click={() => {
											if (file_count === "multiple") {
												if (selected_files.includes(file.name)) {
													value[1] = selected_files.filter(
														(name) => name !== file.name
													);
												} else {
													value[1].push(file.name);
												}
											} else {
												value[1] = [file.name];
											}
										}}
									/>
								{/if}
							</td>
						{/if}
						<td class="p-2">
							{#if file.isfile}
								{file.name}
							{:else}
								<button
									class="underline"
									on:click={() => {
										value[0].push(file.name);
										value[1] = [];
									}}>{file.name}/</button
								>
							{/if}
						</td>
						<td class="p-2"
							>{#if file.size !== null}{prettyBytes(file.size)}{/if}</td
						>
						<td class="p-2">
							{#if file.isfile}
								<a
									href={root +
										"file=" +
										dir_path.join("/") +
										"/" +
										file.name +
										"?component=" +
										component_id}
									download
									name={file.name}
									target="_blank"
									class="underline">Download</a
								>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/await}
</Block>
