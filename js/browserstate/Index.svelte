<svelte:options accessors={true} />

<script lang="ts">
	import { onMount } from "svelte";
	import { encrypt, decrypt } from "./crypto";
	import { Gradio } from "@gradio/utils";

	let props = $props();
	let gradio = new Gradio<
		{
			change: never;
		},
		{
			storage_key: string;
			secret: string;
			default_value: any;
			value: any;
		}
	>(props);

	function load_value(): void {
		const stored = localStorage.getItem(gradio.props.storage_key);
		if (!stored) {
			gradio.props.value = gradio.props.default_value;
			return;
		}
		try {
			const decrypted = decrypt(stored, gradio.props.secret);
			gradio.props.value = JSON.parse(decrypted);
		} catch (e) {
			console.error("Error reading from localStorage:", e);
			gradio.props.value = gradio.props.default_value;
		}
	}

	function save_value(value: any, secret: string, storage_key: string): void {
		if (!value) return;
		try {
			const encrypted = encrypt(JSON.stringify(value), secret);
			localStorage.setItem(storage_key, encrypted);
		} catch (e) {
			console.error("Error writing to localStorage:", e);
		}
	}

	let old_value = gradio.props.value;
	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			save_value(
				gradio.props.value,
				gradio.props.secret,
				gradio.props.storage_key
			);
			gradio.dispatch("change");
		}
	});

	onMount(() => {
		load_value();
	});
</script>
