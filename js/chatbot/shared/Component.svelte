<script lang="ts">
	export let type:
		| "gallery"
		| "plot"
		| "audio"
		| "video"
		| "image"
		| "dataframe"
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
</script>

{#if type === "gallery"}
	<svelte:component
		this={components[type]}
		{value}
		{display_icon_button_wrapper_top_corner}
		show_label={false}
		{i18n}
		label=""
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
		{value}
		show_label={false}
		{i18n}
		label=""
		interactive={false}
		line_breaks={props.line_breaks}
		wrap={true}
		root=""
		gradio={{ dispatch: () => {} }}
		datatype={props.datatype}
		latex_delimiters={props.latex_delimiters}
		col_count={props.col_count}
		row_count={props.row_count}
		on:load
	/>
{:else if type === "plot"}
	<svelte:component
		this={components[type]}
		{value}
		{target}
		{theme_mode}
		bokeh_version={props.bokeh_version}
		caption=""
		show_actions_button={true}
		on:load
	/>
{:else if type === "audio"}
	<div style="position: relative;">
		<svelte:component
			this={components[type]}
			{value}
			show_label={false}
			show_share_button={true}
			{i18n}
			label=""
			waveform_settings={{ autoplay: props.autoplay }}
			show_download_button={allow_file_downloads}
			{display_icon_button_wrapper_top_corner}
			on:load
		/>
	</div>
{:else if type === "video"}
	<svelte:component
		this={components[type]}
		autoplay={props.autoplay}
		value={value.video || value}
		show_label={false}
		show_share_button={true}
		{i18n}
		{upload}
		{display_icon_button_wrapper_top_corner}
		show_download_button={allow_file_downloads}
		on:load
	>
		<track kind="captions" />
	</svelte:component>
{:else if type === "image"}
	<svelte:component
		this={components[type]}
		{value}
		show_label={false}
		label="chatbot-image"
		show_download_button={allow_file_downloads}
		{display_icon_button_wrapper_top_corner}
		on:load
		{i18n}
	/>
{:else if type === "html"}
	<svelte:component
		this={components[type]}
		{value}
		show_label={false}
		label="chatbot-image"
		show_share_button={true}
		{i18n}
		gradio={{ dispatch: () => {} }}
		on:load
	/>
{/if}
