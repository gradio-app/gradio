<script lang="ts">
	export let type:
		| "gallery"
		| "plot"
		| "audio"
		| "video"
		| "image"
		| "dataframe"
		| "model3d"
		| string;
	export let components;
	export let value;
	export let target;
	export let theme_mode;
	export let props;
	export let i18n;
	export let upload;
	export let _fetch;
	export let allow_file_downloads: boolean;
	export let display_icon_button_wrapper_top_corner = false;

	let image_fullscreen = false;
	let image_container: HTMLElement;

	function handle_fullscreen(event: CustomEvent<boolean>): void {
		image_fullscreen = event.detail;
		if (image_fullscreen && image_container) {
			image_container.requestFullscreen?.();
		} else if (document.fullscreenElement) {
			document.exitFullscreen?.();
		}
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
		on:load
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
		on:load
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
		on:load
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
		on:load
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
		on:load
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
			on:load
			{i18n}
		/>
	</div>
{:else if type === "html"}
	<svelte:component
		this={components[type]}
		{...props}
		{value}
		show_label={false}
		show_share_button={false}
		{i18n}
		gradio={{ dispatch: () => {} }}
		on:load
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
		on:load
		{i18n}
	/>
{/if}
