import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

export default defineConfig({
	plugins: [storybookTest()],
	test: {
		browser: {
			enabled: true,
			provider: "playwright",
			name: "chromium"
		},
		setupFiles: [".storybook/vitest.setup.ts"]
	}
});
