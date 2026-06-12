<script lang="ts">
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { Client } from "@gradio/client";
	import type { ComponentType, SvelteComponent } from "svelte";

	let {
		type,
		components,
		value,
		target,
		theme_mode,
		props,
		i18n,
		upload,
		_fetch,
		allow_file_downloads,
		display_icon_button_wrapper_top_corner = false,
		onload
	}: {
		type:
			| "gallery"
			| "plot"
			| "audio"
			| "video"
			| "image"
			| "dataframe"
			| "model3d"
			| string;
		components: Record<string, ComponentType<SvelteComponent>>;
		value: any;
		target: HTMLElement | null;
		theme_mode: "light" | "dark" | "system";
		props: any;
		i18n: I18nFormatter;
		upload: Client["upload"];
		_fetch: typeof fetch;
		allow_file_downloads: boolean;
		display_icon_button_wrapper_top_corner?: boolean;
		onload?: () => void;
	} = $props();

	let image_fullscreen = $state(false);
	let image_container: HTMLElement;

	function handle_fullscreen(event: CustomEvent<boolean>): void {
		image_fullscreen = event.detail;
		if (image_fullscreen && image_container) {
			image_container.requestFullscreen?.();
		} else if (document.fullscreenElement) {
			document.exitFullscreen?.();
		}
	}

	function handle_load(): void {
		onload?.();
	}
</script>

{#if type === "gallery"}
	<svelte:component
		this={components[type]}
		{...props}
		{value}
		display_icon_button_wrapper_top_corner={false}
		show_label={props.label ? true : false}
		{i18n}
		{_fetch}
		allow_preview={false}
		interactive={false}
		mode="minimal"
		fixed_height={1}
		on:load={handle_load}
	/>
{:else if type === "dataframe"}
	<svelte:component
		this={components[type]}
		{...props}
		{value}
		show_label={props.label ? true : false}
		{i18n}
		interactive={false}
		line_breaks={props.line_breaks}
		wrap={true}
		root=""
		gradio={{ dispatch: () => {}, i18n }}
		datatype={props.datatype}
		latex_delimiters={props.latex_delimiters}
		col_count={props.col_count}
		row_count={props.row_count}
		on:load={handle_load}
	/>
{:else if type === "plot"}
	<svelte:component
		this={components[type]}
		{...props}
		{value}
		{target}
		{theme_mode}
		on_change={() => {}}
		bokeh_version={props.bokeh_version}
		caption={props.caption || ""}
		show_actions_button={true}
		on:load={handle_load}
	/>
{:else if type === "audio"}
	<svelte:component
		this={components[type]}
		{...props}
		{value}
		show_label={props.label ? true : false}
		show_share_button={false}
		{i18n}
		waveform_settings={{
			...props.waveform_settings,
			autoplay: props.autoplay
		}}
		show_download_button={false}
		display_icon_button_wrapper_top_corner={false}
		minimal={true}
		on:load={handle_load}
	/>
{:else if type === "video"}
	<svelte:component
		this={components[type]}
		{...props}
		autoplay={props.autoplay}
		value={value.video || value}
		show_label={props.label ? true : false}
		show_share_button={false}
		{i18n}
		{upload}
		display_icon_button_wrapper_top_corner={false}
		show_download_button={false}
		on:load={handle_load}
	>
		<track kind="captions" />
	</svelte:component>
{:else if type === "image"}
	<div bind:this={image_container}>
		<svelte:component
			this={components[type]}
			{...props}
			{value}
			show_label={props.label ? true : false}
			display_icon_button_wrapper_top_corner={false}
			buttons={["fullscreen"]}
			fullscreen={image_fullscreen}
			show_button_background={false}
			on:fullscreen={handle_fullscreen}
			on:load={handle_load}
			{i18n}
		/>
	</div>
{:else if type === "html"}
	<svelte:component
		this={components[type]}
		{...props}
		props={{ value }}
		on:load={handle_load}
	/>
{:else if type === "model3d"}
	<svelte:component
		this={components[type]}
		{...props}
		{value}
		clear_color={props.clear_color}
		display_mode={props.display_mode}
		zoom_speed={props.zoom_speed}
		pan_speed={props.pan_speed}
		{...props.camera_position !== undefined && {
			camera_position: props.camera_position
		}}
		has_change_history={true}
		show_label={props.label ? true : false}
		root=""
		interactive={false}
		show_share_button={false}
		gradio={{ dispatch: () => {}, i18n }}
		on:load={handle_load}
		{i18n}
	/>
{/if}
