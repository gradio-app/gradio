const { defineConfig } = require("pollen-css/utils");

module.exports = defineConfig((pollen) => {
	console.log(pollen);
	return {
		modules: {
			font: {
				...pollen.font,
				sans: `Source Sans Pro, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
				mono: `IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
			},
			radius: {
				...pollen.radius,

				xs: "2px",
				sm: "4px",
				md: "6px",
				lg: "8px",
				xl: "12px",
				"2xl": "16px",
				"3xl": "22px"
			},
			size: {
				...pollen.size,
				0.5: "2px",
				1.5: "6px",
				2.5: "10px"
			},
			color: {
				...pollen.color,
				blue: "#0ea5e9",
				"blue-200": "#bfdbfe",
				"blue-300": "#93c5fd",
				"blue-500": "#0ea5e9",
				"blue-600": "#2563eb",
				"blue-700": "#1d4ed8",
				grey: "#6b7280",
				"grey-50": "#f9fafb",
				"grey-100": "#f3f4f6",
				"grey-200": "#e5e7eb",
				"grey-300": "#d1d5db",
				"grey-400": "#9ca3af",
				"grey-500": "#6b7280",
				"grey-600": "#4b5563",
				"grey-700": "#374151",
				"grey-800": "#1f2937",
				"grey-900": "#111827",
				"grey-950": "#0b0f19",
				red: "#ef4444",
				"red-200": "#fecaca",
				"red-300": "#fca5a5",
				"red-500": "#ef4444",
				"red-600": "#dc2626",
				"red-700": "#b91c1c",
				"red-800": "#991b1b",
				green: "#22c55e",
				"green-200": "#bbf7d0",
				"green-300": "#86efac",
				"green-500": "#22c55e",
				"green-600": "#16a34a",
				"green-800": "#166534",
				orange: "#f97316",
				"orange-200": "#fed7aa",
				"orange-300": "#fdba74",
				"orange-400": "#fb923c",
				"orange-500": "#f97316",
				"orange-600": "#ea580c",
				"orange-800": "#9a3412",
				yellow: "#eab308",
				"yellow-200": "#fef08a",
				"yellow-300": "#fde047",
				"yellow-500": "#eab308",
				"yellow-600": "#ca8a04",
				"yellow-800": "#854d0e"
			}
		}
	};
});
