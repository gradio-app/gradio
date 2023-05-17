<script lang="ts">
	// @ts-nocheck
	import { createEventDispatcher, tick, onMount } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Sketch as SketchIcon } from "@gradio/icons";
	import type { SelectData } from "@gradio/utils";
	import { get_coordinates_of_clicked_image } from "./utils";

	import Cropper from "./Cropper.svelte";
	import Sketch from "./Sketch.svelte";
	import Webcam from "./Webcam.svelte";
	import ModifySketch from "./ModifySketch.svelte";
	import SketchSettings from "./SketchSettings.svelte";

	import { Upload, ModifyUpload } from "@gradio/upload";

	export let value:
		| null
		| string
		| { image: string | null; mask: string | null };
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" | "sketch" | "color-sketch" = "editor";
	export let shape: [number, number];
	export let streaming: boolean = false;
	export let pending: boolean = false;
	export let mirror_webcam: boolean;
	export let brush_radius: number;
	export let selectable: boolean = false;

	let sketch: Sketch;
	let cropper: Cropper;

	if (
		value &&
		(source === "upload" || source === "webcam") &&
		tool === "sketch"
	) {
		value = { image: value as string, mask: null };
	}

	function handle_upload({ detail }: CustomEvent<string>) {
		if (tool === "color-sketch") {
			static_image = detail;
		} else {
			value =
				(source === "upload" || source === "webcam") && tool === "sketch"
					? { image: detail, mask: null }
					: detail;
		}
		dispatch("upload", detail);
	}

	function handle_clear({ detail }: CustomEvent<null>) {
		value = null;
		static_image = undefined;
		dispatch("clear");
	}

	async function handle_save({ detail }: { detail: string }, initial) {
		if (mode === "mask") {
			if (source === "webcam" && initial) {
				value = {
					image: detail,
					mask: null
				};
			} else {
				value = {
					image: typeof value === "string" ? value : value?.image || null,
					mask: detail
				};
			}
		} else if (
			(source === "upload" || source === "webcam") &&
			tool === "sketch"
		) {
			value = { image: detail, mask: null };
		} else {
			value = detail;
		}

		await tick();

		dispatch(streaming ? "stream" : "edit");
	}

	const dispatch = createEventDispatcher<{
		change: string | null;
		stream: string | null;
		edit: undefined;
		clear: undefined;
		drag: boolean;
		upload: FileData;
		select: SelectData;
	}>();

	$: dispatch("change", value as string);

	let dragging = false;

	$: dispatch("drag", dragging);

	function handle_image_load(event: Event) {
		const element = event.currentTarget as HTMLImageElement;
		img_width = element.naturalWidth;
		img_height = element.naturalHeight;
		container_height = element.getBoundingClientRect().height;
	}

	async function handle_sketch_clear() {
		sketch.clear();
		await tick();
		value = null;
		static_image = undefined;
	}

	async function handle_mask_clear() {
		sketch.clear_mask();
		await tick();
	}

	let img_height = 0;
	let img_width = 0;
	let container_height = 0;

	let mode;

	$: {
		if (source === "canvas" && tool === "sketch") {
			mode = "bw-sketch";
		} else if (tool === "color-sketch") {
			mode = "color-sketch";
		} else if (
			(source === "upload" || source === "webcam") &&
			tool === "sketch"
		) {
			mode = "mask";
		} else {
			mode = "editor";
		}
	}

	$: brush_color = mode == "mask" ? "#000000" : "#000";

	let value_img;
	let max_height;
	let max_width;

	let static_image = undefined;

	$: {
		if (value === null || (value.image === null && value.mask === null)) {
			static_image = undefined;
		}
	}

	$: {
		if (cropper) {
			if (value) {
				cropper.image = value;
				cropper.create();
			} else {
				cropper.destroy();
			}
		}
	}

	onMount(async () => {
		if (tool === "color-sketch" && value && typeof value === "string") {
			static_image = value;
			await tick();
			handle_image_load({ currentTarget: value_img });
		}
	});

	const handle_click = (evt: MouseEvent) => {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	};
</script>

<BlockLabel
	{show_label}
	Icon={source === "canvas" ? SketchIcon : Image}
	label={label || (source === "canvas" ? "Sketch" : "Image")}
/>

<div
	data-testid="image"
	class="image-container"
	bind:offsetHeight={max_height}
	bind:offsetWidth={max_width}
>
	{#if source === "upload"}
		<Upload
			bind:dragging
			filetype="image/*"
			on:load={handle_upload}
			include_file_metadata={false}
			disable_click={!!value}
		>
			{#if (value === null && !static_image) || streaming}
				<slot />
			{:else if tool === "select"}
				<Cropper bind:this={cropper} image={value} on:crop={handle_save} />
				<ModifyUpload on:clear={(e) => (handle_clear(e), (tool = "editor"))} />
			{:else if tool === "editor"}
				<ModifyUpload
					on:edit={() => (tool = "select")}
					on:clear={handle_clear}
					editable
				/>

				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<img
					src={value}
					alt=""
					class:scale-x-[-1]={source === "webcam" && mirror_webcam}
					class:selectable
					on:click={handle_click}
				/>
			{:else if (tool === "sketch" || tool === "color-sketch") && (value !== null || static_image)}
				{#key static_image}
					<img
						bind:this={value_img}
						class="absolute-img"
						src={static_image || value?.image || value}
						alt=""
						on:load={handle_image_load}
						class:webcam={source === "webcam" && mirror_webcam}
					/>
				{/key}
				{#if img_width > 0}
					<Sketch
						{value}
						bind:this={sketch}
						bind:brush_radius
						bind:brush_color
						on:change={handle_save}
						{mode}
						width={img_width || max_width}
						height={img_height || max_height}
						container_height={container_height || max_height}
						{value_img}
						{source}
						{shape}
					/>
					<ModifySketch
						show_eraser={value_img}
						on:undo={() => sketch.undo()}
						on:clear_mask={handle_mask_clear}
						on:remove_image={handle_sketch_clear}
					/>
					{#if tool === "color-sketch" || tool === "sketch"}
						<SketchSettings
							bind:brush_radius
							bind:brush_color
							container_height={container_height || max_height}
							img_width={img_width || max_width}
							img_height={img_height || max_height}
							{mode}
						/>
					{/if}
				{/if}
			{:else}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<img
					src={value.image || value}
					alt="hello"
					class:webcam={source === "webcam" && mirror_webcam}
					class:selectable
					on:click={handle_click}
				/>
			{/if}
		</Upload>
	{:else if source === "canvas"}
		<ModifySketch
			on:undo={() => sketch.undo()}
			on:remove_image={handle_sketch_clear}
		/>
		{#if tool === "color-sketch"}
			<SketchSettings
				bind:brush_radius
				bind:brush_color
				container_height={container_height || max_height}
				img_width={img_width || max_width}
				img_height={img_height || max_height}
			/>
		{/if}
		<Sketch
			{value}
			bind:brush_radius
			bind:brush_color
			bind:this={sketch}
			on:change={handle_save}
			on:clear={handle_sketch_clear}
			{mode}
			width={img_width || max_width}
			height={img_height || max_height}
			container_height={container_height || max_height}
			{shape}
		/>
	{:else if (value === null && !static_image) || streaming}
		{#if source === "webcam" && !static_image}
			<Webcam
				on:capture={(e) =>
					tool === "color-sketch" ? handle_upload(e) : handle_save(e, true)}
				on:stream={handle_save}
				on:error
				{streaming}
				{pending}
				{mirror_webcam}
			/>
		{/if}
	{:else if tool === "select"}
		<Cropper bind:this={cropper} image={value} on:crop={handle_save} />
		<ModifyUpload on:clear={(e) => (handle_clear(e), (tool = "editor"))} />
	{:else if tool === "editor"}
		<ModifyUpload
			on:edit={() => (tool = "select")}
			on:clear={handle_clear}
			editable
		/>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<img
			src={value}
			alt=""
			class:selectable
			class:webcam={source === "webcam" && mirror_webcam}
			on:click={handle_click}
		/>
	{:else if (tool === "sketch" || tool === "color-sketch") && (value !== null || static_image)}
		{#key static_image}
			<img
				bind:this={value_img}
				class="absolute-img"
				src={static_image || value?.image || value}
				alt=""
				on:load={handle_image_load}
				class:webcam={source === "webcam" && mirror_webcam}
			/>
		{/key}
		{#if img_width > 0}
			<Sketch
				{value}
				bind:this={sketch}
				bind:brush_radius
				bind:brush_color
				on:change={handle_save}
				{mode}
				width={img_width || max_width}
				height={img_height || max_height}
				container_height={container_height || max_height}
				{value_img}
				{source}
			/>
			<ModifySketch
				on:undo={() => sketch.undo()}
				on:remove_image={handle_sketch_clear}
			/>
			{#if tool === "color-sketch" || tool === "sketch"}
				<SketchSettings
					bind:brush_radius
					bind:brush_color
					container_height={container_height || max_height}
					img_width={img_width || max_width}
					img_height={img_height || max_height}
					{mode}
				/>
			{/if}
		{/if}
	{:else}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<img
			src={value.image || value}
			alt=""
			class:webcam={source === "webcam" && mirror_webcam}
			class:selectable
			on:click={handle_click}
		/>
	{/if}
</div>

<style>
	.image-container,
	img {
		width: var(--size-full);
		height: var(--size-full);
	}
	img {
		object-fit: contain;
	}

	.selectable {
		cursor: crosshair;
	}

	.absolute-img {
		position: absolute;
		opacity: 0;
	}

	.webcam {
		transform: scaleX(-1);
	}
</style>
