<script lang="ts">
	import { page } from "$app/stores";
	import logo_melted from "$lib/assets/img/logo-melted.png";
</script>

<div class="flex-1 m-auto">
	<div class="pb-32 pt-16 text-center 2xl:pb-40 2xl:pt-16">
		<img class="m-auto w-32 logo" src={logo_melted} />
		<h1
			class="error-code m-auto max-w-xl text-4xl font md:text-6xl pb-4 z-10 relative"
		>
			{$page.status}
		</h1>
		<h2
			class="mx-auto max-w-xl text-2xl text-gray-500 dark:text-gray-400 md:text-4xl z-10 relative"
		>
			{$page.error?.message}
		</h2>
	</div>
</div>

<style>
	.logo {
		position: relative;
		z-index: 10;
	}

	.error-code {
		color: #f77b05;
	}
</style>
