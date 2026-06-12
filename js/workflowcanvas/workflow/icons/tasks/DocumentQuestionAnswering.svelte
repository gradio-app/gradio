<script lang="ts">
	interface Props { classNames?: string }
	let { classNames = "" }: Props = $props();
</script>

<svg class={classNames} width="1em" height="1em" viewBox="0 0 32 32"
	><path
		fill="currentColor"
		d="M24 30a6 6 0 1 1 6-6a6.007 6.007 0 0 1-6 6zm0-10a4 4 0 1 0 4 4a4.005 4.005 0 0 0-4-4zM8 22h8v2H8zm0-6h10v2H8z"
	/><path
		fill="currentColor"
		d="M16 28H6V4h8v6a2.006 2.006 0 0 0 2 2h6v3h2v-5a.91.91 0 0 0-.3-.7l-7-7A.909.909 0 0 0 16 2H6a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h10Zm0-23.6l5.6 5.6H16Z"
	/></svg
>
