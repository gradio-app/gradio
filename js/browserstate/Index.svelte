<svelte:options accessors={true} />

<script lang="ts">
	import { onMount } from "svelte";
	import { encrypt, decrypt } from "./crypto";

	export let value: any;
	export let storage_key: string;
	export let secret: string;
	export let default_value: any;
	console.log("secret", secret);
	console.log("storage_key", storage_key);
	console.log("value1", value);
	console.log("default_value", default_value);

	async function load_value(): Promise<void> {
		const stored = localStorage.getItem(storage_key);
		if (!stored) {
			value = default_value;
			return;
		}
		try {
			const decrypted = await decrypt(stored, secret);
			value = JSON.parse(decrypted);
		} catch (e) {
			console.error("Error reading from localStorage:", e);
			value = default_value;
		}
	}

	async function save_value(new_value: unknown): Promise<void> {
		try {
			const encrypted = await encrypt(
				JSON.stringify(new_value),
				secret
			);
			localStorage.setItem(storage_key, encrypted);
			value = new_value;
		} catch (e) {
			console.error("Error writing to localStorage:", e);
		}
	}

	$: value && save_value(value);

    load_value();
</script>
