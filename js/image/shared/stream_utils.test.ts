import { describe, expect, vi } from "vitest";
import {
	get_devices,
	get_video_stream,
	set_available_devices,
	set_local_stream
} from "./stream_utils";
import * as stream_utils from "./stream_utils";

let test_devices: MediaDeviceInfo[] = [
	{
		deviceId: "",
		groupId: "",
		kind: "audioinput",
		label: "",
		toJSON: () => ({
			deviceId: "",
			groupId: "",
			kind: "audioinput",
			label: ""
		})
	},
	{
		deviceId: "",
		groupId: "",
		kind: "videoinput",
		label: "",
		toJSON: () => ({
			deviceId: "",
			groupId: "",
			kind: "videoinput",
			label: ""
		})
	},
	{
		deviceId: "",
		groupId: "",
		kind: "audiooutput",
		label: "",
		toJSON: () => ({
			deviceId: "",
			groupId: "",
			kind: "audiooutput",
			label: ""
		})
	}
];

describe("stream_utils", () => {
	test("get_devices should enumerate media devices", async () => {
		const devices = await get_devices();
		expect(devices[0]).toBeDefined();
	});

	test("set_local_stream should set the local stream to the video source", () => {
		const mock_video_source = {
			srcObject: null,
			muted: false,
			play: vi.fn()
		};

		// @ts-ignore
		set_local_stream(new MediaStream(), mock_video_source);

		expect(mock_video_source.srcObject).toBeInstanceOf(MediaStream);
		expect(mock_video_source.muted).toBeTruthy();
		expect(mock_video_source.play).toHaveBeenCalled();
	});

	test("get_video_stream requests user media with the correct constraints and sets the local stream", async () => {
		const mock_video_source = document.createElement("video");

		const local_stream = await get_video_stream(true, mock_video_source);

		expect(local_stream).toBeInstanceOf(MediaStream);
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
