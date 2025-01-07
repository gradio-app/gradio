<svelte:options accessors={true} />

<script lang="ts">
	import { beforeUpdate } from "svelte";
	import { encrypt, decrypt } from "./crypto";
	import { dequal } from "dequal/lite";
	import type { Gradio } from "@gradio/utils";

	export let storage_key: string;
	export let secret: string;
	export let default_value: any;
	export let value = default_value;
	let initialized = false;
	let old_value = value;
	export let gradio: Gradio<{
		change: never;
	}>;

	function load_value(): void {
		const stored = localStorage.getItem(storage_key);
		if (!stored) {
			old_value = default_value;
			value = old_value;
			return;
		}
		try {
			const decrypted = decrypt(stored, secret);
			old_value = JSON.parse(decrypted);
			value = old_value;
		} catch (e) {
			console.error("Error reading from localStorage:", e);
			old_value = default_value;
			value = old_value;
		}
	}

	function save_value(): void {
		try {
			const encrypted = encrypt(JSON.stringify(value), secret);
			localStorage.setItem(storage_key, encrypted);
			old_value = value;
		} catch (e) {
			console.error("Error writing to localStorage:", e);
		}
	}

	$: value &&
		(() => {
			if (!dequal(value, old_value)) {
				save_value();
				gradio.dispatch("change");
			}
		})();

	beforeUpdate(() => {
		if (!initialized) {
			initialized = true;
			load_value();
		}
	});
</script>
