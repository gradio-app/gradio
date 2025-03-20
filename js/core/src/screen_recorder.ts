export interface ZoomEffect {
	startTime: number;
	endTime: number;
	startZoom: number;
	endZoom: number;
	centerX: number;
	centerY: number;
	targetSelector?: string;
	sustainDuration?: number;
	sustainZoom?: number;
}

class ScreenRecorder {
	private messageCallback: (
		title: string,
		message: string,
		type: string
	) => void;
	private isRecording: boolean = false;
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private recordingStartTime: number = 0;
	private animationFrameId: number | null = null;
	private zoomEffects: ZoomEffect[] = [];
	private removeSegment: { start?: number; end?: number } = {};
	private showRemoveIndicator: boolean = false;
	private videoWidth: number = 1280;
	private videoHeight: number = 720;
	private root: string;

	constructor(
		messageCallback: (title: string, message: string, type: string) => void,
		root: string
	) {
		this.messageCallback = messageCallback;
		this.root = root;
	}

	async startRecording(): Promise<void> {
		if (this.isRecording) {
			return;
		}

		try {
			// Request screen capture
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

			// Get video dimensions from the stream
			const videoTrack = stream.getVideoTracks()[0];
			const settings = videoTrack.getSettings();
			this.videoWidth = settings.width || 1280;
			this.videoHeight = settings.height || 720;

			// Create MediaRecorder
			this.mediaRecorder = new MediaRecorder(stream, {
				mimeType: "video/webm;codecs=vp9",
				videoBitsPerSecond: 3000000 // 3 Mbps
			});

			this.recordedChunks = [];
			this.zoomEffects = [];
			this.removeSegment = {};
			this.showRemoveIndicator = false;

			// Set up event handlers
			this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
			this.mediaRecorder.onstop = this.handleStop.bind(this);

			// Start recording
			this.mediaRecorder.start(1000); // Collect data every second
			this.isRecording = true;
			this.recordingStartTime = Date.now();

			this.messageCallback(
				"Recording Started",
				"Screen recording has begun. Click the record button again to stop.",
				"info"
			);
		} catch (error) {
			console.error("Error starting recording:", error);
			this.messageCallback(
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

	addZoomEffect(effect: ZoomEffect): void {
		if (!this.isRecording) {
			return;
		}

		const currentTime = (Date.now() - this.recordingStartTime) / 1000;

		// Set default values if not provided
		const newEffect: ZoomEffect = {
			targetSelector: effect.targetSelector,
			startTime: currentTime,
			endTime: currentTime + (effect.endTime || 1.0),
			startZoom: effect.startZoom || 1.0,
			endZoom: effect.endZoom || 1.3,
			centerX: effect.centerX || 0.5,
			centerY: effect.centerY || 0.5,
			sustainDuration: effect.sustainDuration || 0
		};

		this.zoomEffects.push(newEffect);
	}

	markRemoveSegmentStart(): void {
		if (!this.isRecording) {
			return;
		}

		const currentTime = (Date.now() - this.recordingStartTime) / 1000;
		this.removeSegment.start = currentTime;
		this.showRemoveIndicator = true;
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
		this.showRemoveIndicator = false;
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
			this.messageCallback(
				"Processing",
				"Sending recording to server for processing...",
				"info"
			);

			// Check if we have any processing to do
			const hasProcessing =
				(this.removeSegment.start !== undefined &&
					this.removeSegment.end !== undefined) ||
				this.zoomEffects.length > 0;

			if (!hasProcessing) {
				// If no processing needed, save directly
				const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.webm`;
				this.saveRecordingWithNativeDialog(recordedBlob, defaultFilename);
				return;
			}

			// Create form data to send to server
			const formData = new FormData();
			formData.append("video", recordedBlob, "recording.webm");

			// Add processing parameters
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

			if (this.zoomEffects.length > 0) {
				formData.append("zoom_effects", JSON.stringify(this.zoomEffects));
			}

			// Send to server for processing - use the correct API path
			const response = await fetch(this.root + "/process_recording", {
				method: "POST",
				body: formData
			});

			if (!response.ok) {
				throw new Error(
					`Server returned ${response.status}: ${response.statusText}`
				);
			}

			// Get the processed video as a blob
			const processedBlob = await response.blob();

			// Save the processed video
			const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.webm`;
			this.saveRecordingWithNativeDialog(processedBlob, defaultFilename);
		} catch (error) {
			console.error("Error processing recording:", error);
			this.messageCallback(
				"Processing Error",
				"Failed to process recording. Saving original version.",
				"warning"
			);

			// Save the original recording if processing fails
			const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")}.webm`;
			this.saveRecordingWithNativeDialog(recordedBlob, defaultFilename);
		}
	}

	// Keep the existing save methods
	private saveRecordingWithNativeDialog(
		blob: Blob,
		suggestedName: string
	): void {
		if ("showSaveFilePicker" in window) {
			this.saveWithFileSystemAccessAPI(blob, suggestedName);
		} else {
			this.saveWithDownloadAttribute(blob, suggestedName);
		}
	}

	private async saveWithFileSystemAccessAPI(
		blob: Blob,
		suggestedName: string
	): Promise<void> {
		try {
			// @ts-ignore
			const fileHandle = await window.showSaveFilePicker({
				suggestedName: suggestedName,
				types: [
					{
						description: "WebM Video",
						accept: { "video/webm": [".webm"] }
					}
				]
			});

			const writable = await fileHandle.createWritable();
			await writable.write(blob);
			await writable.close();
			this.messageCallback(
				"Recording Downloaded",
				"Your recording has been downloaded.",
				"success"
			);
		} catch (error) {
			console.error("Error saving with File System Access API:", error);

			if (error.name !== "AbortError") {
				console.error("Error saving file:", error);
				this.saveWithDownloadAttribute(blob, suggestedName);
			} else {
				this.messageCallback(
					"Save Cancelled",
					"Recording save was cancelled.",
					"info"
				);
			}
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

		this.messageCallback(
			"Recording Ready",
			"Your recording is being saved.",
			"success"
		);
	}
}

export default ScreenRecorder;
