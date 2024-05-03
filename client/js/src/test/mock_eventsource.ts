import { vi } from "vitest";

Object.defineProperty(window, "EventSource", {
	writable: true,
	value: vi.fn().mockImplementation(() => ({
		close: vi.fn(() => {}),
		addEventListener: vi.fn(),
		onmessage: vi.fn((_event: MessageEvent) => {}),
		onerror: vi.fn((_event: Event) => {})
	}))
});
