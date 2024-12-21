<script lang="ts">
	import "@gradio/theme/reset.css";
	import "@gradio/theme/global.css";
	import "@gradio/theme/pollen.css";
	import "@gradio/theme/typography.css";

	import { onDestroy, SvelteComponent, createEventDispatcher } from "svelte";
	import Index from "@self/spa";
	import Playground from "./Playground.svelte";
	import ErrorDisplay from "./ErrorDisplay.svelte";
	import type { ThemeMode } from "@gradio/core";
	import { WorkerProxy, type WorkerProxyOptions } from "@gradio/wasm";
	import { FAKE_LITE_HOST } from "@gradio/wasm/network";
	import { Client } from "@gradio/client";
	import { wasm_proxied_fetch } from "./fetch";
	import { wasm_proxied_stream_factory } from "./sse";
	import { wasm_proxied_mount_css, mount_prebuilt_css } from "./css";
	import type { mount_css } from "@gradio/core";

	// These imports are aliased at built time with Vite. See the `resolve.alias` config in `vite.config.ts`.
	import gradioWheel from "gradio.whl";
	import gradioClientWheel from "gradio_client.whl";

	export let info: boolean;
	export let container: boolean;
	export let is_embed: boolean;
	export let initial_height: string;
	export let eager: boolean;
	export let version: string;
	export let theme_mode: ThemeMode | null;
	export let autoscroll: boolean;
	export let control_page_title: boolean;
	export let app_mode: boolean;

	// For Wasm mode
	export let files: WorkerProxyOptions["files"] | undefined;
	export let requirements: WorkerProxyOptions["requirements"] | undefined;
	export let code: string | undefined;
	export let entrypoint: string | undefined;
	export let sharedWorkerMode: boolean | undefined;

	// For playground
	export let playground = false;
	export let layout: string | null;

	const worker_proxy = new WorkerProxy({
		gradioWheelUrl: new URL(gradioWheel, import.meta.url).href,
		gradioClientWheelUrl: new URL(gradioClientWheel, import.meta.url).href,
		files: files ?? {},
		requirements: requirements ?? [],
		sharedWorkerMode: sharedWorkerMode ?? false
	});

	const dispatch = createEventDispatcher();

	worker_proxy.addEventListener("modules-auto-loaded", (event) => {
		dispatch("modules-auto-loaded", (event as CustomEvent).detail);
	});
	worker_proxy.addEventListener("stdout", (event) => {
		dispatch("stdout", (event as CustomEvent).detail);
	});
	worker_proxy.addEventListener("stderr", (event) => {
		dispatch("stderr", (event as CustomEvent).detail);
	});
	worker_proxy.addEventListener("initialization-error", (event) => {
		error = (event as CustomEvent).detail;
		dispatch("initialization-error", (event as CustomEvent).detail);
	});
	worker_proxy.addEventListener("python-error", (event) => {
		error = (event as CustomEvent).detail;
		dispatch("python-error", (event as CustomEvent).detail);
	});
	onDestroy(() => {
		worker_proxy.terminate();
	});

	let error: Error | null = null;

	const wrapFunctionWithAppLogic = <TArgs extends any[], TRet extends any>(
		func: (...args: TArgs) => Promise<TRet>
	): ((...args: TArgs) => Promise<TRet>) => {
		return async (...args: TArgs) => {
			try {
				error = null;
				const retval = await func(...args);
				refresh_index_component();
				return retval;
			} catch (err) {
				error = err as Error;
				throw err;
			}
		};
	};
	worker_proxy.runPythonCode = wrapFunctionWithAppLogic(
		worker_proxy.runPythonCode.bind(worker_proxy)
	);
	worker_proxy.runPythonFile = wrapFunctionWithAppLogic(
		worker_proxy.runPythonFile.bind(worker_proxy)
	);
	worker_proxy.writeFile = wrapFunctionWithAppLogic(
		worker_proxy.writeFile.bind(worker_proxy)
	);
	worker_proxy.renameFile = wrapFunctionWithAppLogic(
		worker_proxy.renameFile.bind(worker_proxy)
	);
	worker_proxy.unlink = wrapFunctionWithAppLogic(
		worker_proxy.unlink.bind(worker_proxy)
	);
	worker_proxy.install = wrapFunctionWithAppLogic(
		worker_proxy.install.bind(worker_proxy)
	);

	// Internally, the execution of `runPythonCode()` or `runPythonFile()` is queued
	// and its promise will be resolved after the Pyodide is loaded and the worker initialization is done
	// (see the await in the `onmessage` callback in the webworker code)
	// So we don't await this promise because we want to mount the `Index` immediately and start the app initialization asynchronously.
	if (code != null) {
		worker_proxy.runPythonCode(code).catch((err) => {
			dispatch("init-code-run-error", err);
		});
	} else if (entrypoint != null) {
		worker_proxy.runPythonFile(entrypoint).catch((err) => {
			dispatch("init-file-run-error", err);
		});
	} else {
		throw new Error("Either code or entrypoint must be provided.");
	}

	mount_prebuilt_css(document.head);

	class LiteClient extends Client {
		fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
			return wasm_proxied_fetch(worker_proxy, input, init);
		}

		stream(url: URL): EventSource {
			return wasm_proxied_stream_factory(worker_proxy, url);
		}
	}

	const overridden_mount_css: typeof mount_css = async (url, target) => {
		return wasm_proxied_mount_css(worker_proxy, url, target);
	};

	let index_component_key = 0;
	function refresh_index_component(): void {
		index_component_key += 1;
	}

	let playground_component: SvelteComponent | null = null;
	$: playground_component?.$on("code", (event) => {
		const { code } = event.detail;
		worker_proxy.runPythonCode(code);
	});

	export const run_code = worker_proxy.runPythonCode;
	export const run_file = worker_proxy.runPythonFile;
	export const write = worker_proxy.writeFile;
	export const rename = worker_proxy.renameFile;
	export const unlink = worker_proxy.unlink;
	export const install = worker_proxy.install;
</script>

{#if playground}
	<Playground
		bind:this={playground_component}
		{worker_proxy}
		{layout}
		{code}
		{is_embed}
	>
		{#key index_component_key}
			{#if error}
				<ErrorDisplay
					{error}
					{is_embed}
					height={initial_height}
					{container}
					{version}
					on:clear_error={() => {
						error = null;
					}}
				/>
			{:else}
				<Index
					space={null}
					src={`http://${FAKE_LITE_HOST}/`}
					{info}
					{container}
					{is_embed}
					{initial_height}
					{eager}
					{version}
					{theme_mode}
					{autoscroll}
					{control_page_title}
					{app_mode}
					{worker_proxy}
					Client={LiteClient}
					mount_css={overridden_mount_css}
				/>
			{/if}
		{/key}
	</Playground>
{:else}
	{#key index_component_key}
		{#if error}
			<ErrorDisplay
				{error}
				{is_embed}
				height={initial_height}
				{container}
				{version}
				on:clear_error={() => {
					error = null;
				}}
			/>
		{:else}
			<Index
				space={null}
				src={`http://${FAKE_LITE_HOST}/`}
				{info}
				{container}
				{is_embed}
				{initial_height}
				{eager}
				{version}
				{theme_mode}
				{autoscroll}
				{control_page_title}
				{app_mode}
				{worker_proxy}
				Client={LiteClient}
				mount_css={overridden_mount_css}
			/>
		{/if}
	{/key}
{/if}
