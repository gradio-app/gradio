import type { ToastMessage } from "@gradio/statustracker";

class ScreenRecorder {
	private add_new_message: (
		title: string,
		message: string,
		type: ToastMessage["type"]
	) => void;
	private isRecording = false;
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private recordingStartTime = 0;
	private animationFrameId: number | null = null;
	private removeSegment: { start?: number; end?: number } = {};
	private root: string;
	private zoomEffects: {
		boundingBox: { topLeft: [number, number]; bottomRight: [number, number] };
		timestamp: number;
		duration?: number;
	}[] = [];

	constructor(
		root: string,
		add_new_message: (
			title: string,
			message: string,
			type: ToastMessage["type"]
		) => void
	) {
		this.add_new_message = add_new_message;
		this.root = root;
	}

	async startRecording(): Promise<void> {
		if (this.isRecording) {
			return;
		}

		try {
			this.add_new_message(
				"To start recording:",
				"Please select the 'SHARE THIS: Gradio Tab",
				"info"
			);
			const originalTitle = document.title;
			document.title = "SHARE THIS: Gradio";
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: {
					cursor: "always",
					width: { ideal: 1920 },
					height: { ideal: 1080 },
					frameRate: { ideal: 30 }
				},
				audio: true,
				selfBrowserSurface: "include"
			});
			document.title = originalTitle;

			this.mediaRecorder = new MediaRecorder(stream, {
				mimeType: "video/mp4",
				videoBitsPerSecond: 3000000 // 3 Mbps
			});

			this.recordedChunks = [];
			this.removeSegment = {};

			this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
			this.mediaRecorder.onstop = this.handleStop.bind(this);

			this.mediaRecorder.start(1000);
			this.isRecording = true;
			this.recordingStartTime = Date.now();
		} catch (error) {
			console.error("Error starting recording:", error);
			this.add_new_message(
				"Recording Error",
				"Failed to start recording: " + error.message,
				"error"
			);
		}
	}

	stopRecording(): void {
		if (!this.isRecording || !this.mediaRecorder) {
			return;
		}

		this.mediaRecorder.stop();
		this.isRecording = false;
	}

	isCurrentlyRecording(): boolean {
		return this.isRecording;
	}

	markRemoveSegmentStart(): void {
		if (!this.isRecording) {
			return;
		}

		const currentTime = (Date.now() - this.recordingStartTime) / 1000;
		this.removeSegment.start = currentTime;
	}

	markRemoveSegmentEnd(): void {
		if (!this.isRecording || this.removeSegment.start === undefined) {
			return;
		}

		const currentTime = (Date.now() - this.recordingStartTime) / 1000;
		this.removeSegment.end = currentTime;
	}

	clearRemoveSegment(): void {
		this.removeSegment = {};
	}

	addZoomEffect(params: { 
		boundingBox: { 
			topLeft: [number, number]; 
			bottomRight: [number, number] 
		};
		duration?: number;
	}): void {
		if (!this.isRecording) {
			return;
		}
		
		// Calculate the current timestamp in the recording
		const currentTime = (Date.now() - this.recordingStartTime) / 1000;
		
		// Ensure we have valid coordinates before adding the zoom effect
		if (params.boundingBox && 
			params.boundingBox.topLeft && 
			params.boundingBox.bottomRight &&
			params.boundingBox.topLeft.length === 2 &&
			params.boundingBox.bottomRight.length === 2) {
			
			this.zoomEffects.push({
				boundingBox: params.boundingBox,
				timestamp: currentTime,
				duration: params.duration || 2.0
			});
			
			console.log("Added zoom effect:", {
				boundingBox: params.boundingBox,
				timestamp: currentTime,
				duration: params.duration || 2.0
			});
		} else {
			console.error("Invalid boundingBox format:", params.boundingBox);
		}
	}

	private handleDataAvailable(event: BlobEvent): void {
		if (event.data.size > 0) {
			this.recordedChunks.push(event.data);
		}
	}

	private handleStop(): void {
		this.isRecording = false;

		const blob = new Blob(this.recordedChunks, {
			type: "video/webm"
		});

		this.handleRecordingComplete(blob);

		const screenStream = this.mediaRecorder?.stream?.getTracks() || [];
		screenStream.forEach((track) => track.stop());

		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	private async handleRecordingComplete(recordedBlob: Blob): Promise<void> {
		try {
			this.add_new_message(
				"Processing video",
				"This may take a few seconds...",
				"info"
			);
			const hasProcessing =
				(this.removeSegment.start !== undefined &&
				this.removeSegment.end !== undefined) ||
				this.zoomEffects.length > 0;

			if (!hasProcessing) {
				const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.webm`;
				this.saveWithDownloadAttribute(recordedBlob, defaultFilename);
				return;
			}

			const formData = new FormData();
			formData.append("video", recordedBlob, "recording.webm");

			if (
				this.removeSegment.start !== undefined &&
				this.removeSegment.end !== undefined
			) {
				formData.append(
					"remove_segment_start",
					this.removeSegment.start.toString()
				);
				formData.append(
					"remove_segment_end",
					this.removeSegment.end.toString()
				);
			}

			// Add zoom effects if any
			if (this.zoomEffects.length > 0) {
				// We'll just use the first zoom effect for now
				const zoomEffect = this.zoomEffects[0];
				
				if (zoomEffect && zoomEffect.boundingBox && 
					zoomEffect.boundingBox.topLeft && zoomEffect.boundingBox.bottomRight) {
					
					console.log("Sending zoom effect:", zoomEffect);
					
					// Use simple string format instead of JSON
					formData.append("zoom_top_left_x", zoomEffect.boundingBox.topLeft[0].toString());
					formData.append("zoom_top_left_y", zoomEffect.boundingBox.topLeft[1].toString());
					formData.append("zoom_bottom_right_x", zoomEffect.boundingBox.bottomRight[0].toString());
					formData.append("zoom_bottom_right_y", zoomEffect.boundingBox.bottomRight[1].toString());
					
					// Ensure timestamp is properly formatted
					if (zoomEffect.timestamp !== undefined) {
						formData.append("zoom_timestamp", zoomEffect.timestamp.toString());
						console.log("Sending zoom timestamp:", zoomEffect.timestamp);
					}
					
					if (zoomEffect.duration) {
						formData.append("zoom_duration", zoomEffect.duration.toString());
					}
				} else {
					console.warn("Zoom effect is incomplete:", zoomEffect);
				}
			}

			const response = await fetch(this.root + "/process_recording", {
				method: "POST",
				body: formData
			});

			if (!response.ok) {
				throw new Error(
					`Server returned ${response.status}: ${response.statusText}`
				);
			}

			const processedBlob = await response.blob();
			const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.webm`;
			this.saveWithDownloadAttribute(processedBlob, defaultFilename);
			
			// Clear zoom effects after processing
			this.zoomEffects = [];
		} catch (error) {
			console.error("Error processing recording:", error);
			this.add_new_message(
				"Processing Error",
				"Failed to process recording. Saving original version.",
				"warning"
			);

			const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.webm`;
			this.saveWithDownloadAttribute(recordedBlob, defaultFilename);
		}
	}

	private saveWithDownloadAttribute(blob: Blob, suggestedName: string): void {
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
}

export default ScreenRecorder;
