import type { ToastMessage } from "@gradio/statustracker";

let isRecording = false;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingStartTime = 0;
let animationFrameId: number | null = null;
let removeSegment: { start?: number; end?: number } = {};
let root: string;

let add_message_callback: (
	title: string,
	message: string,
	type: ToastMessage["type"]
) => void;
let onRecordingStateChange: ((isRecording: boolean) => void) | null = null;
let zoomEffects: {
	boundingBox: { topLeft: [number, number]; bottomRight: [number, number] };
	start_frame: number;
	duration?: number;
}[] = [];

export function initialize(
	rootPath: string,
	add_new_message: (
		title: string,
		message: string,
		type: ToastMessage["type"]
	) => void,
	recordingStateCallback?: (isRecording: boolean) => void
): void {
	root = rootPath;
	add_message_callback = add_new_message;
	if (recordingStateCallback) {
		onRecordingStateChange = recordingStateCallback;
	}
}

export async function startRecording(): Promise<void> {
	if (isRecording) {
		return;
	}

	try {
		const originalTitle = document.title;
		document.title = "[Sharing] Gradio Tab";
		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: {
				width: { ideal: 1920 },
				height: { ideal: 1080 },
				frameRate: { ideal: 30 }
			},
			audio: true,
			selfBrowserSurface: "include"
		} as MediaStreamConstraints);
		document.title = originalTitle;

		const options = {
			videoBitsPerSecond: 5000000
		};

		mediaRecorder = new MediaRecorder(stream, options);

		recordedChunks = [];
		removeSegment = {};

		mediaRecorder.ondataavailable = handleDataAvailable;
		mediaRecorder.onstop = handleStop;

		mediaRecorder.start(1000);
		isRecording = true;
		if (onRecordingStateChange) {
			onRecordingStateChange(true);
		}
		recordingStartTime = Date.now();
	} catch (error: any) {
		add_message_callback(
			"Recording Error",
			"Failed to start recording: " + error.message,
			"error"
		);
	}
}

export function stopRecording(): void {
	if (!isRecording || !mediaRecorder) {
		return;
	}

	mediaRecorder.stop();
	isRecording = false;
	if (onRecordingStateChange) {
		onRecordingStateChange(false);
	}
}

export function isCurrentlyRecording(): boolean {
	return isRecording;
}

export function markRemoveSegmentStart(): void {
	if (!isRecording) {
		return;
	}

	const currentTime = (Date.now() - recordingStartTime) / 1000;
	removeSegment.start = currentTime;
}

export function markRemoveSegmentEnd(): void {
	if (!isRecording || removeSegment.start === undefined) {
		return;
	}

	const currentTime = (Date.now() - recordingStartTime) / 1000;
	removeSegment.end = currentTime;
}

export function clearRemoveSegment(): void {
	removeSegment = {};
}

export function addZoomEffect(
	is_input: boolean,
	params: {
		boundingBox: {
			topLeft: [number, number];
			bottomRight: [number, number];
		};
		duration?: number;
	}
): void {
	if (!isRecording) {
		return;
	}

	const FPS = 30;
	const currentTime = (Date.now() - recordingStartTime) / 1000;
	const currentFrame = is_input
		? Math.floor((currentTime - 2) * FPS)
		: Math.floor(currentTime * FPS);

	if (
		params.boundingBox &&
		params.boundingBox.topLeft &&
		params.boundingBox.bottomRight &&
		params.boundingBox.topLeft.length === 2 &&
		params.boundingBox.bottomRight.length === 2
	) {
		const newEffectDuration = params.duration || 2.0;
		const newEffectEndFrame =
			currentFrame + Math.floor(newEffectDuration * FPS);

		const hasOverlap = zoomEffects.some((existingEffect) => {
			const existingEffectEndFrame =
				existingEffect.start_frame +
				Math.floor((existingEffect.duration || 2.0) * FPS);
			return (
				(currentFrame >= existingEffect.start_frame &&
					currentFrame <= existingEffectEndFrame) ||
				(newEffectEndFrame >= existingEffect.start_frame &&
					newEffectEndFrame <= existingEffectEndFrame) ||
				(currentFrame <= existingEffect.start_frame &&
					newEffectEndFrame >= existingEffectEndFrame)
			);
		});

		if (!hasOverlap) {
			zoomEffects.push({
				boundingBox: params.boundingBox,
				start_frame: currentFrame,
				duration: newEffectDuration
			});
		}
	}
}

export function zoom(
	is_input: boolean,
	elements: number[],
	duration = 2.0
): void {
	if (!isRecording) {
		return;
	}

	try {
		setTimeout(() => {
			if (!elements || elements.length === 0) {
				return;
			}

			let minLeft = Infinity;
			let minTop = Infinity;
			let maxRight = 0;
			let maxBottom = 0;
			let foundElements = false;

			for (const elementId of elements) {
				const selector = `#component-${elementId}`;
				const element = document.querySelector(selector);

				if (element) {
					foundElements = true;
					const rect = element.getBoundingClientRect();

					minLeft = Math.min(minLeft, rect.left);
					minTop = Math.min(minTop, rect.top);
					maxRight = Math.max(maxRight, rect.right);
					maxBottom = Math.max(maxBottom, rect.bottom);
				}
			}

			if (!foundElements) {
				return;
			}

			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			const boxWidth = Math.min(maxRight, viewportWidth) - Math.max(0, minLeft);
			const boxHeight =
				Math.min(maxBottom, viewportHeight) - Math.max(0, minTop);

			const widthPercentage = boxWidth / viewportWidth;
			const heightPercentage = boxHeight / viewportHeight;

			if (widthPercentage >= 0.8 || heightPercentage >= 0.8) {
				return;
			}

			const isSafari = /^((?!chrome|android).)*safari/i.test(
				navigator.userAgent
			);

			let topLeft: [number, number] = [
				Math.max(0, minLeft) / viewportWidth,
				Math.max(0, minTop) / viewportHeight
			];

			let bottomRight: [number, number] = [
				Math.min(maxRight, viewportWidth) / viewportWidth,
				Math.min(maxBottom, viewportHeight) / viewportHeight
			];

			if (isSafari) {
				topLeft[0] = Math.max(0, topLeft[0] * 0.9);
				bottomRight[0] = Math.min(1, bottomRight[0] * 0.9);
				const width = bottomRight[0] - topLeft[0];
				const center = (topLeft[0] + bottomRight[0]) / 2;
				const newCenter = center * 0.9;
				topLeft[0] = Math.max(0, newCenter - width / 2);
				bottomRight[0] = Math.min(1, newCenter + width / 2);
			}

			topLeft[0] = Math.max(0, topLeft[0]);
			topLeft[1] = Math.max(0, topLeft[1]);
			bottomRight[0] = Math.min(1, bottomRight[0]);
			bottomRight[1] = Math.min(1, bottomRight[1]);

			addZoomEffect(is_input, {
				boundingBox: {
					topLeft,
					bottomRight
				},
				duration: duration
			});
		}, 300);
	} catch (error) {
		// pass
	}
}

function handleDataAvailable(event: BlobEvent): void {
	if (event.data.size > 0) {
		recordedChunks.push(event.data);
	}
}

function handleStop(): void {
	isRecording = false;
	if (onRecordingStateChange) {
		onRecordingStateChange(false);
	}

	const blob = new Blob(recordedChunks, {
		type: "video/mp4"
	});

	handleRecordingComplete(blob);

	const screenStream = mediaRecorder?.stream?.getTracks() || [];
	screenStream.forEach((track) => track.stop());

	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
}

async function handleRecordingComplete(recordedBlob: Blob): Promise<void> {
	try {
		add_message_callback(
			"Processing video",
			"This may take a few seconds...",
			"info"
		);

		const formData = new FormData();
		formData.append("video", recordedBlob, "recording.mp4");

		if (removeSegment.start !== undefined && removeSegment.end !== undefined) {
			formData.append("remove_segment_start", removeSegment.start.toString());
			formData.append("remove_segment_end", removeSegment.end.toString());
		}

		if (zoomEffects.length > 0) {
			formData.append("zoom_effects", JSON.stringify(zoomEffects));
		}

		const response = await fetch(root + "/gradio_api/process_recording", {
			method: "POST",
			body: formData
		});

		if (!response.ok) {
			throw new Error(
				`Server returned ${response.status}: ${response.statusText}`
			);
		}

		const processedBlob = await response.blob();
		const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.mp4`;
		saveWithDownloadAttribute(processedBlob, defaultFilename);
		zoomEffects = [];
	} catch (error) {
		add_message_callback(
			"Processing Error",
			"Failed to process recording. Saving original version.",
			"warning"
		);

		const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.mp4`;
		saveWithDownloadAttribute(recordedBlob, defaultFilename);
	}
}

function saveWithDownloadAttribute(blob: Blob, suggestedName: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.style.display = "none";
	a.href = url;
	a.download = suggestedName;

	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, 100);
}
