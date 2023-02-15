<script context="module" lang="ts">
	import { writable } from "svelte/store";
	import { fn } from "./api";

	import type {
		ComponentMeta,
		Dependency,
		LayoutNode
	} from "./components/types";

	declare let BACKEND_URL: string;
	declare let BUILD_MODE: string;
	// declare let GRADIO_VERSION: string;
	interface Config {
		auth_required: boolean | undefined;
		auth_message: string;
		components: ComponentMeta[];
		css: string | null;
		dependencies: Dependency[];
		dev_mode: boolean;
		enable_queue: boolean;
		fn: ReturnType<typeof fn>;
		layout: LayoutNode;
		mode: "blocks" | "interface";
		root: string;
		target: HTMLElement;
		theme: string;
		title: string;
		version: string;
		is_space: boolean;
		is_colab: boolean;
		show_api: boolean;
	}

	let id = -1;

	function create_intersection_store() {
		const intersecting = writable<Record<string, boolean>>({});

		const els = new Map<HTMLDivElement, number>();

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				console.log({ entry });
				if (entry.isIntersecting) {
					// els.forEach((v, k) => {
					let _el: number | undefined = els.get(entry.target as HTMLDivElement);
					console.log({ _el, els });
					if (_el !== undefined)
						intersecting.update((s) => ({ ...s, [_el as number]: true }));
					// });
				}
			});
		});

		function register(id: number, el: HTMLDivElement) {
			els.set(el, id);
			observer.observe(el);
		}

		return { register, subscribe: intersecting.subscribe };
	}

	const intersecting = create_intersection_store();
</script>

<script lang="ts">
	import { onMount } from "svelte";

	import Embed from "./Embed.svelte";
	// import Login from "./Login.svelte";
	// import Blocks from "./Blocks.svelte";
	import { Component as Loader } from "./components/StatusTracker";
	import type {
		SvelteComponent,
		SvelteComponentDev,
		SvelteComponentTyped
	} from "svelte/internal";

	export let autoscroll: boolean;
	export let version: string;
	export let initial_height: string = "300px";
	export let app_mode: boolean;
	export let is_embed: boolean;
	export let theme: "light" | "dark" = "light";
	export let control_page_title: boolean;
	export let minimal = false;

	export let space: string | null;
	export let host: string | null;
	export let src: string | null;
	// export let;

	id = id + 1;

	let status: "pending" | "error" | "success" | "login" = "pending";
	let app_id: string | null = null;
	let wrapper: HTMLDivElement;
	let ready: boolean = false;
	let root: string;
	let config: Config;

	async function handle_config(target: HTMLElement, source: string | null) {
		let config;
		console.log({ source });

		try {
			let _config = await get_config(source);
			config = _config;
		} catch (e) {
			console.error(e);
			return null;
		}

		mount_custom_css(target, config.css);
		window.__is_colab__ = config.is_colab;

		if (root === undefined) {
			root = BACKEND_URL;
			config.root = BACKEND_URL;
		}

		if (config.dev_mode) {
			reload_check(root);
		}

		return config;
	}

	console.log({ x: BACKEND_URL });

	async function get_config(source: string | null) {
		if (BUILD_MODE === "dev" || location.origin === "http://localhost:9876") {
			let config = await fetch(BACKEND_URL + "config");
			const result = await config.json();
			return result;
		} else if (source) {
			if (!source.endsWith("/")) {
				source += "/";
			}
			const config = await get_source_config(source);
			return config;
		} else {
			return window.gradio_config;
		}
	}

	async function get_source_config(source: string): Promise<Config> {
		let config = await (await fetch(source + "config")).json();
		root = source;
		config.root = source;
		return config;
	}

	function mount_custom_css(target: HTMLElement, css_string?: string) {
		if (css_string) {
			let style = document.createElement("style");
			style.innerHTML = css_string;
			target.appendChild(style);
		}
	}

	async function reload_check(root: string) {
		const result = await (await fetch(root + "app_id")).text();

		if (app_id === null) {
			app_id = result;
		} else if (app_id != result) {
			location.reload();
		}

		setTimeout(() => reload_check(root), 250);
	}

	function handle_darkmode(target: HTMLDivElement): "light" | "dark" {
		let url = new URL(window.location.toString());
		let theme: "light" | "dark" = "light";

		const color_mode: "light" | "dark" | "system" | null = url.searchParams.get(
			"__theme"
		) as "light" | "dark" | "system" | null;

		if (color_mode !== null) {
			if (color_mode === "dark") {
				theme = darkmode(target);
			} else if (color_mode === "system") {
				theme = use_system_theme(target);
			}
			// light is default, so we don't need to do anything else
		} else if (url.searchParams.get("__dark-theme") === "true") {
			theme = darkmode(target);
		} else {
			theme = use_system_theme(target);
		}
		return theme;
	}

	function use_system_theme(target: HTMLDivElement): "light" | "dark" {
		const theme = update_scheme();
		window
			?.matchMedia("(prefers-color-scheme: dark)")
			?.addEventListener("change", update_scheme);

		function update_scheme() {
			let theme: "light" | "dark" = "light";
			const is_dark =
				window?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? null;

			if (is_dark) {
				theme = darkmode(target);
			}
			return theme;
		}
		return theme;
	}

	function darkmode(target: HTMLDivElement): "dark" {
		target.classList.add("dark");
		if (app_mode) {
			document.body.style.backgroundColor = "rgb(11, 15, 25)"; // bg-gray-950 for scrolling outside the body
		}
		return "dark";
	}

	async function check_space_status(space_id: string) {
		let response;
		let status;
		try {
			response = await fetch(`https://huggingface.co/api/spaces/${space_id}`);
			status = response.status;
			console.log(response);
			if (status !== 200) {
				throw new Error();
			}
			response = await response.json();
		} catch {
			status = "error";
			error_detail = {
				type: "space_error",
				detail: {
					description: "This space is experiencing issues",
					discussions_enabled: await discussions_enabled(space_id)
				}
			};

			return;
		}
		console.log(response);

		if (!response || status !== 200) return;
		const {
			runtime: { stage }
		} = response;

		console.log(stage);

		switch (stage) {
			case "STOPPED":
			case "SLEEPING":
				console.log("space is sleeping, waking up");
				setTimeout(() => {
					check_space_status(space_id);
				}, 500);
			// poll for status
			case "RUNNING":
			case "RUNNING_BUILDING":
				status = "success";
				console.log("Space is running");
				//  launch
				break;
			case "BUILDING":
				console.log("space is building");
				setTimeout(() => {
					check_space_status(space_id);
				}, 500);
				return;
				// poll for status
				break;
			case "NO_APP_FILE":
			case "CONFIG_ERROR":
			case "BUILD_ERROR":
			case "RUNTIME_ERROR":
				status = "error";
				error_detail = {
					type: "space_error",
					detail: {
						description: "This space is experiencing issues",
						discussions_enabled: await discussions_enabled(space_id),
						stage
					}
				};
				console.log("space is broken, contact author", error_detail);
				return;
				// launch error screen
				break;
		}

		console.log({ response });
	}

	async function discussions_enabled(space_id: string) {
		// return true;
		let r;
		try {
			const r = await fetch(
				`https://huggingface.co/api/spaces/${space_id}/discussions`,
				{
					method: "HEAD",
					mode: "cors"
				}
			);

			console.log("HEAD", r);
			r.headers.forEach(console.log);
			const x = r.headers.get("x-error-message");
		} catch (e) {
			console.log(e);
		}
	}

	const session_hash = Math.random().toString(36).substring(2);

	let error_detail: null | {
		type: "not_found" | "space_error";
		detail?: Record<string, any>;
	} = null;

	onMount(async () => {
		if (window.__gradio_mode__ !== "website") {
			theme = handle_darkmode(wrapper);
		}

		const source = host
			? `https://${host}`
			: space
			? (
					await (
						await fetch(`https://huggingface.co/api/spaces/${space}/host`)
					).json()
			  ).host
			: src;

		const _config: Config | null = await handle_config(wrapper, source);

		if (_config) {
			status = _config.auth_required ? "login" : "pending";
			console.log(session_hash, root + "run/", _config.is_space, is_embed);
			_config.fn = _config.fn = fn(
				session_hash,
				root + "run/",
				_config.is_space,
				is_embed
			);
			config = _config;
		} else {
			status = "error";
			error_detail = {
				type: "not_found"
			};
		}

		if (space && !config) {
			console.log(space);
			check_space_status(space);
		}
	});

	$: status = ready ? "success" : status;

	$: config && $intersecting[id] && load_demo();

	let Blocks: typeof SvelteComponentTyped;
	let Login: typeof SvelteComponentTyped;

	async function get_blocks() {
		Blocks = (await import("./Blocks.svelte")).default;
		console.log(Blocks);
	}
	async function get_login() {
		Login = (await import("./Login.svelte")).default;
		console.log(Login);
	}

	function load_demo() {
		if (config.auth_required) get_login();
		else get_blocks();
	}

	$: console.log(space);

	type error_types =
		| "NO_APP_FILE"
		| "CONFIG_ERROR"
		| "BUILD_ERROR"
		| "RUNTIME_ERROR";

	const discussion_message = {
		readable_error: {
			NO_APP_FILE: "no app file",
			CONFIG_ERROR: "a config error",
			BUILD_ERROR: "a build error",
			RUNTIME_ERROR: "a runtime error"
		} as const,
		title(error: error_types) {
			console.log(error);
			return encodeURIComponent(
				`Space isn't working because there is ${
					this.readable_error[error] || "an error"
				}`
			);
		},
		description(error: error_types, site: string) {
			return encodeURIComponent(
				`Hello,\n\nFirstly, thanks for creating this space!\n\nI noticed that the space isn't working correctly because there is ${
					this.readable_error[error] || "an error"
				}.\n\nIt would be great if you could take a look at this because this space is being embedded on ${site}.\n\nThanks!`
			);
		}
	};

	onMount(() => {
		intersecting.register(id, wrapper);
	});

	$: console.log($intersecting);
</script>

<Embed
	display={!minimal && is_embed && !!space}
	{version}
	{initial_height}
	{space}
	bind:wrapper
>
	{#if status === "pending" || status === "error"}
		<Loader
			{status}
			timer={false}
			queue_position={null}
			queue_size={null}
			status_text={"loading"}
		>
			<div class="error" slot="error">
				<p><strong>{error_detail?.detail?.description || ""}.</strong></p>
				{#if error_detail?.detail?.discussions_enabled}
					<p>
						Please <a
							href="https://huggingface.co/spaces/{space}/discussions/new?title={discussion_message.title(
								error_detail.detail.stage
							)}&description={discussion_message.description(
								error_detail.detail.stage,
								location.origin
							)}"
						>
							contact the author of the space</a
						> to let them know.
					</p>
				{/if}
			</div>
		</Loader>
	{:else if status === "login" && Login}
		<Login
			auth_message={config.auth_message}
			root={config.root}
			is_space={config.is_space}
			{id}
			{app_mode}
		/>
	{/if}
	{#if config && Blocks}
		<Blocks
			{...config}
			{theme}
			{control_page_title}
			target={wrapper}
			{autoscroll}
			bind:ready
			show_footer={false}
		/>
	{/if}
</Embed>

<style>
	div {
		position: relative;
		width: 100%;
	}

	.error {
		position: relative;
		z-index: var(--layer-top);
		padding: var(--size-4);
		color: var(--color-text-body);
		text-align: center;
	}

	.error > * {
		margin: var(--size-2) 0;
	}

	a {
		color: var(--color-text-link-base);
	}

	a:hover {
		color: var(--color-text-link-hover);
		text-decoration: underline;
	}

	a:visited {
		color: var(--color-text-link-visited);
	}

	a:active {
		color: var(--color-text-link-active);
	}
</style>
