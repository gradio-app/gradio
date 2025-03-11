// Screen recording functionality

export interface ZoomEffect {
    startTime: number;
    endTime: number;
    startZoom: number;
    endZoom: number;
    centerX: number;
    centerY: number;
}

class ScreenRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: BlobPart[] = [];
    private isRecording = false;
    private messageCallback: (title: string, message: string, type: string) => void;

    constructor(messageCallback: (title: string, message: string, type: string) => void) {
        this.messageCallback = messageCallback;
    }

    async startRecording(): Promise<void> {
        if (this.isRecording) {
            this.stopRecording();
            return;
        }

        try {
            // Change the page title temporarily to make it easier to identify
            const originalTitle = document.title;
            document.title = "RECORD THIS: Gradio Interface";
            
            // Show instructions before starting capture
            this.messageCallback(
                "Recording Instructions", 
                "When prompted, please select the tab titled 'RECORD THIS: Gradio Interface' to record only the Gradio interface.", 
                "info"
            );
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Give user time to read
            
            const stream = await navigator.mediaDevices.getDisplayMedia({
                selfBrowserSurface: 'include',
                video: {
                    cursor: "always"
                },
                audio: true
            });

            // Restore original title
            document.title = originalTitle;

            // Create a new MediaRecorder instance
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            this.isRecording = true;

            // Event handler when data is available
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            // Event handler when recording stops
            this.mediaRecorder.onstop = async () => {
                this.isRecording = false;
                
                // Create a blob from the recorded chunks
                const rawBlob = new Blob(this.recordedChunks, {
                    type: "video/webm"
                });
                
                // Process the video before downloading
                const processedBlob = await this.processRecording(rawBlob);
                
                // Create a URL for the processed blob
                const url = URL.createObjectURL(processedBlob);
                
                // Create a download link
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `gradio-recording-${new Date().toISOString()}.webm`;
                
                // Add to the DOM, trigger click, and remove
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            // Start recording
            this.mediaRecorder.start();
            
            // Add a visual indicator that recording is in progress
            this.messageCallback("Recording", "Screen recording in progress. Click the record button again to stop.", "info");
            
        } catch (error) {
            console.error("Error starting screen recording:", error);
            this.messageCallback("Error", "Failed to start screen recording. Please ensure you've granted the necessary permissions.", "error");
            
            // Restore original title in case of error
            document.title = originalTitle;
        }
    }

    stopRecording(): void {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
    }

    async processRecording(blob: Blob): Promise<Blob> {
        // Show processing message
        this.messageCallback("Processing", "Processing your recording with zoom effects...", "info");
        
        try {
            // Create a video element to work with the recording
            const videoElement = document.createElement('video');
            videoElement.src = URL.createObjectURL(blob);
            
            // Wait for video metadata to load
            await new Promise<void>((resolve) => {
                videoElement.onloadedmetadata = () => resolve();
            });
            
            // Create a canvas for processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions to match video
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            
            // Define zoom effect parameters
            const zoomEffects: ZoomEffect[] = [
                // Format: [startTime, endTime, startZoom, endZoom, centerX, centerY]
                {startTime: 3, endTime: 6, startZoom: 1.0, endZoom: 1.5, centerX: 0.5, centerY: 0.5},
                {startTime: 10, endTime: 12, startZoom: 1.0, endZoom: 1.8, centerX: 0.3, centerY: 0.7},
                {startTime: 15, endTime: 18, startZoom: 1.8, endZoom: 1.0, centerX: 0.3, centerY: 0.7}
            ];
            
            // Create a MediaStream from the canvas
            const processedStream = canvas.captureStream(30); // 30 FPS
            
            // Add audio if available
            try {
                const audioTracks = videoElement.captureStream().getAudioTracks();
                audioTracks.forEach(track => {
                    processedStream.addTrack(track);
                });
            } catch (e) {
                console.warn("Could not add audio to recording:", e);
            }
            
            // Create MediaRecorder for processed output
            const processedRecorder = new MediaRecorder(processedStream, { mimeType: 'video/webm' });
            
            const processedChunks: BlobPart[] = [];
            processedRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    processedChunks.push(e.data);
                }
            };
            
            // Create a promise that resolves when processing is complete
            const processingComplete = new Promise<Blob>((resolve) => {
                processedRecorder.onstop = () => {
                    const processedBlob = new Blob(processedChunks, { type: 'video/webm' });
                    resolve(processedBlob);
                };
            });
            
            // Start the processed recorder
            processedRecorder.start();
            
            // Play the original video and process each frame
            videoElement.onplay = () => {
                let animationFrameId: number;
                
                function processFrame() {
                    if (videoElement.paused || videoElement.ended) {
                        processedRecorder.stop();
                        return;
                    }
                    
                    const currentTime = videoElement.currentTime;
                    
                    // Clear canvas
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Default drawing (no zoom)
                    let applyZoom = false;
                    let zoomLevel = 1.0;
                    let centerX = 0.5;
                    let centerY = 0.5;
                    
                    // Check if we're in a zoom effect period
                    for (const effect of zoomEffects) {
                        if (currentTime >= effect.startTime && currentTime <= effect.endTime) {
                            applyZoom = true;
                            
                            // Calculate current zoom level (linear interpolation)
                            const progress = (currentTime - effect.startTime) / (effect.endTime - effect.startTime);
                            zoomLevel = effect.startZoom + progress * (effect.endZoom - effect.startZoom);
                            centerX = effect.centerX;
                            centerY = effect.centerY;
                            break;
                        }
                    }
                    
                    if (applyZoom && ctx) {
                        // Apply zoom effect
                        const sourceWidth = canvas.width / zoomLevel;
                        const sourceHeight = canvas.height / zoomLevel;
                        const sourceX = canvas.width * centerX - sourceWidth / 2;
                        const sourceY = canvas.height * centerY - sourceHeight / 2;
                        
                        // Draw zoomed frame
                        ctx.drawImage(
                            videoElement,
                            sourceX, sourceY, sourceWidth, sourceHeight,
                            0, 0, canvas.width, canvas.height
                        );
                    } else {
                        // Draw normal frame
                        ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    }
                    
                    // Add watermark
                    if (ctx) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.font = '20px Arial';
                        ctx.fillText('Made with Gradio', 20, canvas.height - 20);
                    }
                    
                    // Schedule the next frame
                    animationFrameId = requestAnimationFrame(processFrame);
                }
                
                processFrame();
            };
            
            // Start playing the video (this triggers the processing)
            videoElement.play();
            
            // Wait for processing to complete
            const result = await processingComplete;
            
            // Clean up
            URL.revokeObjectURL(videoElement.src);
            
            return result;
            
        } catch (error) {
            console.error("Error processing recording:", error);
            this.messageCallback("Error", "Failed to process recording. Downloading original instead.", "error");
            return blob; // Return the original blob if processing fails
        }
    }
}

export default ScreenRecorder; 