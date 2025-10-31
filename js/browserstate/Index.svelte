<svelte:options accessors={true} />

<script lang="ts">
	import { onMount } from "svelte";
	import { encrypt, decrypt } from "./crypto";
	import { Gradio } from "@gradio/utils";

	// export let storage_key: string;
	// export let secret: string;
	// export let default_value: any;
	// export let value = default_value;
	// let old_value = value;

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
		console.log("Stored value from localStorage:", stored);
		if (!stored) {
			gradio.props.value = gradio.props.default_value;
			return;
		}
		try {
			const decrypted = decrypt(stored, gradio.props.secret);
			console.log("Decrypted value from localStorage:", decrypted);
			gradio.props.value = JSON.parse(decrypted);
		} catch (e) {
			console.error("Error reading from localStorage:", e);
			gradio.props.value = gradio.props.default_value;
		}
	}

	function save_value(): void {
		if (!gradio.props.value) return;
		try {
			const encrypted = encrypt(
				JSON.stringify(gradio.props.value),
				gradio.props.secret
			);
			localStorage.setItem(gradio.props.storage_key, encrypted);
		} catch (e) {
			console.error("Error writing to localStorage:", e);
		}
	}

	$effect(() => {
		save_value();
		gradio.dispatch("change");
	});

	onMount(() => {
		load_value();
	});
</script>
