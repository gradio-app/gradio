<script lang="ts">
	export let type: "gallery" | "plot" | "audio" | "video" | "image" | string;
	export let components;
	export let value;
	export let target;
	export let theme_mode;
	export let props;
	export let i18n;
	export let upload;
	export let _fetch;
</script>

{#if type === "gallery"}
	<svelte:component
		this={components[type]}
		{value}
		show_label={false}
		{i18n}
		label=""
		{_fetch}
		preview={true}
		interactive={true}
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
	/>
{:else if type === "audio"}
	<svelte:component
		this={components[type]}
		{value}
		show_label={false}
		show_share_button={true}
		{i18n}
		label=""
		waveform_settings={{}}
		waveform_options={{}}
	/>
{:else if type === "video"}
	<svelte:component
		this={components[type]}
		autoplay={true}
		value={value.video || value}
		show_label={false}
		show_share_button={true}
		{i18n}
		{upload}
	>
		<track kind="captions" />
	</svelte:component>
{:else if type === "image"}
	<svelte:component
		this={components[type]}
		{value}
		show_label={false}
		label="chatbot-image"
		show_share_button={true}
		{i18n}
	/>
{/if}
