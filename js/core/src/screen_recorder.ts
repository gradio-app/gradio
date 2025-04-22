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
	) => void
): void {
	root = rootPath;
	add_message_callback = add_new_message;
}

export async function startRecording(): Promise<void> {
	if (isRecording) {
		return;
	}

	try {
		add_message_callback(
			"To start recording:",
			"Please select the 'SHARE THIS: Gradio Tab",
			"info"
		);
		const originalTitle = document.title;
		document.title = "SHARE THIS: Gradio";
		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: {
				width: { ideal: 1920 },
				height: { ideal: 1080 },
				frameRate: { ideal: 30 }
			},
			audio: true,
			selfBrowserSurface: "include"
		});
		document.title = originalTitle;

		mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp8",
			videoBitsPerSecond: 5000000 // 3 Mbps
		});

		recordedChunks = [];
		removeSegment = {};

		mediaRecorder.ondataavailable = handleDataAvailable;
		mediaRecorder.onstop = handleStop;

		mediaRecorder.start(1000);
		isRecording = true;
		recordingStartTime = Date.now();
	} catch (error) {
		console.error("Error starting recording:", error);
		add_message_callback(
			"Recording Error",
			"Failed to start recording: " + error.message,
			"error"
		);
	}
}

export function stopRecording(): void {
    console.log("stopRecording!!!!!");
	if (!isRecording || !mediaRecorder) {
		return;
	}

	mediaRecorder.stop();
	isRecording = false;
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

export function addZoomEffect(is_input: boolean, params: { 
	boundingBox: { 
		topLeft: [number, number]; 
		bottomRight: [number, number] 
	};
	duration?: number;
}): void {
	if (!isRecording) {
		return;
	}
	
	const currentTime = (Date.now() - recordingStartTime) / 1000;
    const currentFrame = is_input ? Math.floor((currentTime - 2) * 30) : Math.floor(currentTime * 30);
	
	if (params.boundingBox && 
		params.boundingBox.topLeft && 
		params.boundingBox.bottomRight &&
		params.boundingBox.topLeft.length === 2 &&
		params.boundingBox.bottomRight.length === 2) {
		
		zoomEffects.push({
			boundingBox: params.boundingBox,
			start_frame: currentFrame,
			duration: params.duration || 2.0
		});
	} else {
		console.error("Invalid boundingBox format:", params.boundingBox);
	}
}

export function zoom(is_input: boolean, elements: number[], duration = 2.0): void {
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
            
            const topLeft: [number, number] = [
                Math.max(0, minLeft) / viewportWidth,
                Math.max(0, minTop) / viewportHeight
            ];
            
            const bottomRight: [number, number] = [
                Math.min(maxRight, viewportWidth) / viewportWidth,
                Math.min(maxBottom, viewportHeight) / viewportHeight
            ];
            
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
        console.error(error);
    }
}

function handleDataAvailable(event: BlobEvent): void {
	if (event.data.size > 0) {
		recordedChunks.push(event.data);
	}
}

function handleStop(): void {
	isRecording = false;

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
		const hasProcessing =
			(removeSegment.start !== undefined &&
			removeSegment.end !== undefined) ||
			zoomEffects.length > 0;

		if (!hasProcessing) {
			const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.mp4`;
			saveWithDownloadAttribute(recordedBlob, defaultFilename);
			return;
		}

		const formData = new FormData();
		formData.append("video", recordedBlob, "recording.mp4");

		if (
			removeSegment.start !== undefined &&
			removeSegment.end !== undefined
		) {
			formData.append(
				"remove_segment_start",
				removeSegment.start.toString()
			);
			formData.append(
				"remove_segment_end",
				removeSegment.end.toString()
			);
		}

		if (zoomEffects.length > 0) {
            formData.append("zoom_effects", JSON.stringify(zoomEffects));
		}

		const response = await fetch(root + "/process_recording", {
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
		console.error("Error processing recording:", error);
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
