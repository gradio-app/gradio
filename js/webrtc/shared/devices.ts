export async function get_devices(
	kind: "videoinput" | "audioinput"
): Promise<MediaDeviceInfo[]> {
	const devices = await navigator.mediaDevices.enumerateDevices();
	return devices.filter((device) => device.kind === kind);
}

/** The device the stream was opened with, or the first available one. */
export function current_device(
	stream: MediaStream,
	devices: MediaDeviceInfo[]
): MediaDeviceInfo | null {
	const used = stream.getTracks().map((t) => t.getSettings()?.deviceId)[0];
	return (
		(used && devices.find((device) => device.deviceId === used)) ||
		devices[0] ||
		null
	);
}

export function with_device(
	constraints: Record<string, any> | boolean | undefined,
	device_id?: string | null
): Record<string, any> | boolean {
	const base =
		constraints && typeof constraints === "object" ? constraints : {};
	if (!device_id) return constraints === undefined ? base : constraints;
	return { ...base, deviceId: { exact: device_id } };
}

export function click_outside(
	node: Node,
	cb: (event: MouseEvent) => void
): any {
	const handle_click = (event: MouseEvent): void => {
		if (
			node &&
			!node.contains(event.target as Node) &&
			!event.defaultPrevented
		) {
			cb(event);
		}
	};
	document.addEventListener("click", handle_click, true);
	return {
		destroy() {
			document.removeEventListener("click", handle_click, true);
		}
	};
}
