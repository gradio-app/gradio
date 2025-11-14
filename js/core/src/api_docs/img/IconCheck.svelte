<script>
	export let classNames = "";
</script>

<svg
	class={classNames || "icon-size"}
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	height="16"
	viewBox="0 0 16 16"
	version="1.1"
	width="16"
	data-view-component="true"
	><path
		fill-rule="evenodd"
		fill="rgb(255, 124, 1)"
		d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
	></path></svg
>

<style>
	.icon-size {
		width: 0.75rem;
		height: 0.75rem;
	}

	@media (max-width: 640px) {
		.icon-size {
			width: 0.625rem;
			height: 0.625rem;
		}
	}
</style>
