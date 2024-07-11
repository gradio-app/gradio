import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { inject_component_loader } from "../app/build_plugins";

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit(), inject_component_loader({ mode })]
}));
