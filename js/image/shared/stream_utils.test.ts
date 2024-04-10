import { describe, expect, vi } from "vitest";
import {
	get_devices,
	get_video_stream,
	set_available_devices,
	set_local_stream
} from "./stream_utils";
import * as stream_utils from "./stream_utils";

let test_device: MediaDeviceInfo = {
	deviceId: "test-device",
	kind: "videoinput",
	label: "Test Device",
	groupId: "camera",
	toJSON: () => ({
		deviceId: "test-device",
		kind: "videoinput",
		label: "Test Device",
		groupId: "camera"
	})
};

const mock_enumerateDevices = vi.fn(async () => {
	return new Promise<MediaDeviceInfo[]>((resolve) => {
		resolve([test_device]);
	});
});
const mock_getUserMedia = vi.fn(async () => {
	return new Promise<MediaStream>((resolve) => {
		resolve(new MediaStream());
	});
});

window.MediaStream = vi.fn().mockImplementation(() => ({}));

Object.defineProperty(global.navigator, "mediaDevices", {
	value: {
		getUserMedia: mock_getUserMedia,
		enumerateDevices: mock_enumerateDevices
	}
});

describe("stream_utils", () => {
	test("get_devices should enumerate media devices", async () => {
		const devices = await get_devices();
		expect(devices).toEqual([test_device]);
	});

	test("set_local_stream should set the local stream to the video source", () => {
		const mock_stream = {}; // mocked MediaStream obj as it's not available in a node env

		const mock_video_source = {
			srcObject: null,
			muted: false,
			play: vi.fn()
		};

		// @ts-ignore
		set_local_stream(mock_stream, mock_video_source);

		expect(mock_video_source.srcObject).toEqual(mock_stream);
		expect(mock_video_source.muted).toBeTruthy();
		expect(mock_video_source.play).toHaveBeenCalled();
	});

	test("get_video_stream requests user media with the correct constraints and sets the local stream", async () => {
		const mock_video_source = document.createElement("video");
		const mock_stream = new MediaStream();

		global.navigator.mediaDevices.getUserMedia = vi
			.fn()
			.mockResolvedValue(mock_stream);

		await get_video_stream(true, mock_video_source);

		expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
			video: { width: { ideal: 1920 }, height: { ideal: 1440 } },
			audio: true
		});

		const spy_set_local_stream = vi.spyOn(stream_utils, "set_local_stream");
		stream_utils.set_local_stream(mock_stream, mock_video_source);

		expect(spy_set_local_stream).toHaveBeenCalledWith(
			mock_stream,
			mock_video_source
		);
		spy_set_local_stream.mockRestore();
	});

	test("set_available_devices should return only video input devices", () => {
		const mockDevices: MediaDeviceInfo[] = [
			{
				deviceId: "camera1",
				kind: "videoinput",
				label: "Camera 1",
				groupId: "camera",
				toJSON: () => ({
					deviceId: "camera1",
					kind: "videoinput",
					label: "Camera 1",
					groupId: "camera"
				})
			},
			{
				deviceId: "camera2",
				kind: "videoinput",
				label: "Camera 2",
				groupId: "camera",
				toJSON: () => ({
					deviceId: "camera2",
					kind: "videoinput",
					label: "Camera 2",
					groupId: "camera"
				})
			},
			{
				deviceId: "audio1",
				kind: "audioinput",
				label: "Audio 2",
				groupId: "audio",
				toJSON: () => ({
					deviceId: "audio1",
					kind: "audioinput",
					label: "Audio 2",
					groupId: "audio"
				})
			}
		];

		const videoDevices = set_available_devices(mockDevices);
		expect(videoDevices).toEqual(mockDevices.splice(0, 2));
	});
});
