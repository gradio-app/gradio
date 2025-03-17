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
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: BlobPart[] = [];
    private isRecording = false;
    private messageCallback: (title: string, message: string, type: "error" | "warning" | "info" | "success") => void;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private recordingStartTime = 0;
    private animationFrameId: number | null = null;
    private zoomEffects: ZoomEffect[] = [];
    private removeSegment: { start?: number; end?: number } = {};
    private originalStream: MediaStream | null = null;

    constructor(messageCallback: (title: string, message: string, type: "error" | "warning" | "info" | "success") => void) {
        this.messageCallback = messageCallback;
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.isRecording = false;
        this.recordedChunks = [];
        this.zoomEffects = [];
        this.removeSegment = {};
        this.animationFrameId = null;
        
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    }

    private handleScroll(): void {
        if (this.isRecording && this.zoomEffects.length > 0) {
            this.zoomEffects = [];
        }
    }

    async startRecording(initialZoomEffects: ZoomEffect[] = []): Promise<void> {
        if (this.isRecording) {
            this.stopRecording();
            return;
        }

        this.zoomEffects = [...initialZoomEffects];

        try {
            const originalTitle = document.title;
            document.title = "RECORD THIS: Gradio Demo";
            
            this.messageCallback(
                "Recording Instructions", 
                "When prompted, please select the tab titled 'RECORD THIS: Gradio Demo' to record only the Gradio demo.", 
                "info"
            );
            
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                selfBrowserSurface: 'include',
                video: {
                    cursor: "always"
                },
                audio: true
            });

            document.title = originalTitle;

            const videoTrack = screenStream.getVideoTracks()[0];
            const videoSettings = videoTrack.getSettings();
            
            this.canvas.width = videoSettings.width || 1920;
            this.canvas.height = videoSettings.height || 1080;
            
            const videoElement = document.createElement('video');
            videoElement.srcObject = screenStream;
            videoElement.muted = true;
            
            await new Promise<void>((resolve) => {
                videoElement.onloadedmetadata = () => {
                    if (this.canvas.width !== videoElement.videoWidth || 
                        this.canvas.height !== videoElement.videoHeight) {
                        this.canvas.width = videoElement.videoWidth;
                        this.canvas.height = videoElement.videoHeight;
                    }
                    resolve();
                };
            });
            
            await videoElement.play();
            
            const frameRate = videoSettings.frameRate || 30;
            const canvasStream = this.canvas.captureStream(frameRate);
            
            const audioTracks = screenStream.getAudioTracks();
            audioTracks.forEach(track => {
                canvasStream.addTrack(track);
            });
            
            this.mediaRecorder = new MediaRecorder(canvasStream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000
            });
            
            this.recordedChunks = [];
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            this.removeSegment = {};            
            this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
            this.mediaRecorder.onstop = this.handleStop.bind(this);
            this.mediaRecorder.start(1000);
            this.startDrawingLoop(videoElement);
            
            this.originalStream = screenStream;
            
        } catch (error) {
            console.error("Error starting screen recording:", error);
            this.messageCallback(
                "Error", 
                "Failed to start screen recording. Please ensure you've granted the necessary permissions.", 
                "error"
            );
            document.title = originalTitle;
        }
    }

    private startDrawingLoop(videoElement: HTMLVideoElement): void {
        const effectTargets: Map<ZoomEffect, {x: number, y: number}> = new Map();
        
        const drawFrame = (): void => {
            if (!this.isRecording || !this.ctx) {
                return;
            }
            
            const elapsedTime = (Date.now() - this.recordingStartTime) / 1000;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let applyZoom = false;
            let zoomLevel = 1.0;
            let centerX = 0.5;
            let centerY = 0.5;
            
            for (const effect of this.zoomEffects) {
                if (elapsedTime >= effect.startTime && elapsedTime <= effect.endTime) {
                    applyZoom = true;
                    
                    if (effect.targetSelector) {
                        const targetElement = document.querySelector(effect.targetSelector);
                        
                        if (targetElement) {
                            const rect = targetElement.getBoundingClientRect();
                            
                            const relativeX = (rect.left + rect.width / 2) / window.innerWidth;
                            const relativeY = (rect.top + rect.height / 2) / window.innerHeight;
                            
                            effectTargets.set(effect, {x: relativeX, y: relativeY});
                            
                            centerX = relativeX;
                            centerY = relativeY;
                            
                            const maxOffset = (1 - 1/zoomLevel) / 2;
                            centerX = Math.max(0.5 - maxOffset, Math.min(0.5 + maxOffset, centerX));
                            centerY = Math.max(0.5 - maxOffset, Math.min(0.5 + maxOffset, centerY));
                        }
                    } else {
                        centerX = effect.centerX;
                        centerY = effect.centerY;
                    }
                    
                    const progress = (elapsedTime - effect.startTime) / (effect.endTime - effect.startTime);
                    zoomLevel = effect.startZoom + progress * (effect.endZoom - effect.startZoom);
                    
                    break;
                }
            }
            
            if (applyZoom) {
                const sourceWidth = videoElement.videoWidth / zoomLevel;
                const sourceHeight = videoElement.videoHeight / zoomLevel;
                const sourceX = videoElement.videoWidth * centerX - sourceWidth / 2;
                const sourceY = videoElement.videoHeight * centerY - sourceHeight / 2;
                
                this.ctx.drawImage(
                    videoElement,
                    sourceX, sourceY, sourceWidth, sourceHeight,
                    0, 0, this.canvas.width, this.canvas.height
                );
            } else {
                this.ctx.drawImage(
                    videoElement,
                    0, 0, videoElement.videoWidth, videoElement.videoHeight,
                    0, 0, this.canvas.width, this.canvas.height
                );
            }
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Made with Gradio', 20, this.canvas.height - 20);
            
            this.animationFrameId = requestAnimationFrame(drawFrame);
        };
        
        this.animationFrameId = requestAnimationFrame(drawFrame);
    }

    addZoomEffect(effect: Partial<ZoomEffect>): void {
        if (!this.isRecording) {
            return;
        }
        
        const currentTime = (Date.now() - this.recordingStartTime) / 1000;
        
        const newEffect: ZoomEffect = {
            startTime: currentTime + (effect.startTime || 0),
            endTime: currentTime + (effect.endTime || 3),
            startZoom: effect.startZoom || 1.0,
            endZoom: effect.endZoom || 1.0,
            centerX: effect.centerX || 0.5,
            centerY: effect.centerY || 0.5,
            targetSelector: effect.targetSelector
        };
        
        if (effect.sustainDuration) {
            newEffect.sustainDuration = effect.sustainDuration;
            newEffect.sustainZoom = effect.sustainZoom || effect.endZoom || 1.5;
            
            const zoomTransitionTime = newEffect.endTime - newEffect.startTime;
            newEffect.endTime = newEffect.startTime + zoomTransitionTime + newEffect.sustainDuration;
        }
        
        this.zoomEffects.push(newEffect);
    }

    isCurrentlyRecording(): boolean {
        return this.isRecording;
    }

    stopRecording(): void {
        if (this.mediaRecorder && this.isRecording) {
            this.recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
            
            this.mediaRecorder.stop();
            
            const stream = this.mediaRecorder.stream;
            stream.getTracks().forEach(track => track.stop());
            
            if (this.originalStream) {
                this.originalStream.getTracks().forEach(track => track.stop());
            }
        }
    }

    private async handleRecordingComplete(recordedBlob: Blob): Promise<void> {
        try {
            if (this.removeSegment.start !== undefined && this.removeSegment.end !== undefined) {
                this.messageCallback(
                    "Processing", 
                    "Processing video...", 
                    "info"
                );
                
                try {
                    const editedBlob = await this.removeSegmentFromVideo(recordedBlob);
                    
                    const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.webm`;
                    
                    this.saveRecordingWithNativeDialog(editedBlob, defaultFilename);
                } catch (processingError) {
                    console.error("Error removing segment:", processingError);
                    this.messageCallback("Error", "Failed to remove segment. Saving original recording.", "error");
                    
                    const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.webm`;
                    
                    this.saveRecordingWithNativeDialog(recordedBlob, defaultFilename);
                }
            } else {
                
                const defaultFilename = `gradio-screen-recording-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.webm`;
                
                this.saveRecordingWithNativeDialog(recordedBlob, defaultFilename);
            }
        } catch (error) {
            console.error("Error handling recording completion:", error);
            this.messageCallback("Error", "Failed to process recording. Please try again.", "error");
        }
    }

    private async removeSegmentFromVideo(recordedBlob: Blob): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            try {
                const videoElement = document.createElement('video');
                videoElement.src = URL.createObjectURL(recordedBlob);
                videoElement.muted = true;
                
                videoElement.onloadedmetadata = async () => {
                    try {
                        const start = Math.max(0, this.removeSegment.start || 0);
                        const end = Math.min(this.removeSegment.end || videoElement.duration, videoElement.duration);
                        
                        if (start >= end || start >= videoElement.duration || end <= 0) {
                            URL.revokeObjectURL(videoElement.src);
                            resolve(recordedBlob);
                            return;
                        }
                        
                        const canvas = document.createElement('canvas');
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            throw new Error("Could not get canvas context");
                        }
                        
                        const stream = canvas.captureStream(30);
                        
                        const mediaRecorder = new MediaRecorder(stream, {
                            mimeType: 'video/webm;codecs=vp9',
                            videoBitsPerSecond: 5000000
                        });
                        
                        const chunks: BlobPart[] = [];
                        mediaRecorder.ondataavailable = (e) => {
                            if (e.data.size > 0) {
                                chunks.push(e.data);
                            }
                        };
                        
                        const finalBlobPromise = new Promise<Blob>((resolveRecording) => {
                            mediaRecorder.onstop = () => {
                                const finalBlob = new Blob(chunks, { type: 'video/webm' });
                                resolveRecording(finalBlob);
                            };
                        });
                        
                        mediaRecorder.start(100);
                        
                        
                        if (start > 0) {                            
                            videoElement.currentTime = 0;
                            
                            await new Promise<void>(resolve => {
                                videoElement.onseeked = () => resolve();
                            });
                            
                            while (videoElement.currentTime < start) {
                                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                                
                                const currentTime = videoElement.currentTime;
                                videoElement.currentTime = Math.min(currentTime + 1/30, start); // ~30fps
                                
                                await new Promise<void>(resolve => {
                                    videoElement.onseeked = () => resolve();
                                });
                            }
                        }
                        
                        if (end < videoElement.duration) {                            
                            videoElement.currentTime = end;
                            
                            await new Promise<void>(resolve => {
                                videoElement.onseeked = () => resolve();
                            });
                            
                            while (videoElement.currentTime < videoElement.duration) {
                                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                                const currentTime = videoElement.currentTime;
                                videoElement.currentTime = Math.min(currentTime + 1/30, videoElement.duration); // ~30fps
                                
                                await new Promise<void>(resolve => {
                                    videoElement.onseeked = () => resolve();
                                });
                            }
                        }
                        
                        mediaRecorder.stop();
                        
                        const editedBlob = await finalBlobPromise;
                        
                        URL.revokeObjectURL(videoElement.src);
                        
                        resolve(editedBlob);
                    } catch (error) {
                        console.error("Error processing video:", error);
                        URL.revokeObjectURL(videoElement.src);
                        reject(error);
                    }
                };
                
                videoElement.onerror = () => {
                    URL.revokeObjectURL(videoElement.src);
                    reject(new Error("Failed to load video for editing"));
                };
            } catch (error) {
                reject(error);
            }
        });
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

    private saveRecordingWithNativeDialog(blob: Blob, suggestedName: string): void {
        
        if ('showSaveFilePicker' in window) {
            this.saveWithFileSystemAccessAPI(blob, suggestedName);
        } else {
            this.saveWithDownloadAttribute(blob, suggestedName);
        }
    }

    private async saveWithFileSystemAccessAPI(blob: Blob, suggestedName: string): Promise<void> {
        try {
            
            // @ts-ignore
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{
                    description: 'WebM Video',
                    accept: { 'video/webm': ['.webm'] }
                }]
            });
            
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            this.messageCallback("Recording Downloaded", "Your recording has been downloaded.", "success");
        } catch (error) {
            console.error("Error saving with File System Access API:", error);
            
            if (error.name !== 'AbortError') {
                console.error("Error saving file:", error);
                this.saveWithDownloadAttribute(blob, suggestedName);
            } else {
                this.messageCallback("Save Cancelled", "Recording save was cancelled.", "info");
            }
        }
    }

    private saveWithDownloadAttribute(blob: Blob, suggestedName: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = suggestedName;
        
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.messageCallback("Recording Ready", "Your recording is being saved.", "success");
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
        screenStream.forEach(track => track.stop());
        
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // Make sure to clean up the event listener when needed
    destroy(): void {
        window.removeEventListener('scroll', this.handleScroll.bind(this));
        
        if (this.isRecording) {
            this.stopRecording();
        }
        
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

export default ScreenRecorder;
