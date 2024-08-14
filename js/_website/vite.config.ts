import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { inject_component_loader } from "../build/dist/index.js";

//@ts-ignore
export default defineConfig(({ mode }) => ({
	plugins: [sveltekit(), inject_component_loader({ mode })]
}));
