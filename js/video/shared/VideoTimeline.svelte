<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	export let videoElement: HTMLVideoElement;
	export let trimmedDuration: number | null;
	export let dragStart: number;
	export let dragEnd: number;

	let thumbnails: string[] = [];
	let numberOfThumbnails = 10;
	let intervalId: number | NodeJS.Timer;
	let videoDuration: number;

	let leftHandlePosition = 0;
	let rightHandlePosition = 99;

	let dragging: string | null = null;

	const startDragging = (side: string | null): void => {
		dragging = side;
	};

	const stopDragging = (): void => {
		dragging = null;
	};

	const drag = (event: { clientX: number }, distance?: number): void => {
		if (dragging) {
			const timeline = document.getElementById("timeline");

			if (!timeline) return;

			const rect = timeline.getBoundingClientRect();
			let newPercentage = ((event.clientX - rect.left) / rect.width) * 100;

			if (distance) {
				// Move handle based on arrow key press
				newPercentage =
					dragging === "left"
						? leftHandlePosition + distance
						: rightHandlePosition + distance;
			} else {
				// Move handle based on mouse drag
				newPercentage = ((event.clientX - rect.left) / rect.width) * 100;
			}

			newPercentage = Math.max(0, Math.min(newPercentage, 100)); // Keep within 0 and 100

			if (dragging === "left") {
				leftHandlePosition = Math.min(newPercentage, rightHandlePosition);

				// Calculate the new time and set it for the videoElement
				const newTimeLeft = (leftHandlePosition / 100) * videoDuration;
				videoElement.currentTime = newTimeLeft;

				dragStart = newTimeLeft;
			} else if (dragging === "right") {
				rightHandlePosition = Math.max(newPercentage, leftHandlePosition);

				const newTimeRight = (rightHandlePosition / 100) * videoDuration;
				videoElement.currentTime = newTimeRight;

				dragEnd = newTimeRight;
			}

			const startTime = (leftHandlePosition / 100) * videoDuration;
			const endTime = (rightHandlePosition / 100) * videoDuration;
			trimmedDuration = endTime - startTime;

			// Trigger Svelte to update the DOM by assigning the value to itself
			leftHandlePosition = leftHandlePosition;
			rightHandlePosition = rightHandlePosition;
		}
	};

	const moveHandle = (e: KeyboardEvent): void => {
		if (dragging) {
			// Calculate the movement distance as a percentage of the video duration
			const distance = (1 / videoDuration) * 100;

			if (e.key === "ArrowLeft") {
				drag({ clientX: 0 }, -distance);
			} else if (e.key === "ArrowRight") {
				drag({ clientX: 0 }, distance);
			}
		}
	};

	const generateThumbnail = (): void => {
		// Create canvas
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;

		// Draw a frame on the canvas
		ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

		// Convert canvas to data URL
		const thumbnail: string = canvas.toDataURL("image/jpeg", 0.7);
		thumbnails = [...thumbnails, thumbnail];
	};

	onMount(() => {
		const loadMetadata = (): void => {
			videoDuration = videoElement.duration;

			const interval = videoDuration / numberOfThumbnails;
			let captures = 0;

			const onSeeked = (): void => {
				generateThumbnail();
				captures++;

				if (captures < numberOfThumbnails) {
					videoElement.currentTime += interval;
				} else {
					videoElement.removeEventListener("seeked", onSeeked);
				}
			};

			videoElement.addEventListener("seeked", onSeeked);
			videoElement.currentTime = 0;
		};

		if (videoElement.readyState >= 1) {
			loadMetadata();
		} else {
			videoElement.addEventListener("loadedmetadata", loadMetadata);
		}
	});

	onDestroy(() => {
		window.removeEventListener("mousemove", drag);
		window.removeEventListener("mouseup", stopDragging);
		window.removeEventListener("keydown", moveHandle);

		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	onMount(() => {
		window.addEventListener("mousemove", drag);
		window.addEventListener("mouseup", stopDragging);
		window.addEventListener("keydown", moveHandle);
	});
</script>

<div class="container">
	{#if thumbnails.length === numberOfThumbnails}
		<div id="timeline" class="thumbnail-wrapper">
			<button
				class="handle left"
				on:mousedown={() => startDragging("left")}
				on:blur={stopDragging}
				on:keydown={(e) => {
					if (e.key === "ArrowLeft") {
						startDragging("left");
					}
				}}
				style="left: {leftHandlePosition}%;"
			/>

			<div
				class="opaque-layer"
				style="left: {leftHandlePosition}%; right: {100 - rightHandlePosition}%"
			/>

			{#each thumbnails as thumbnail, i (thumbnail)}
				<img src={thumbnail} alt={`frame-${i}`} draggable="false" />
			{/each}
			<button
				class="handle right"
				on:mousedown={() => startDragging("right")}
				on:blur={stopDragging}
				on:keydown={(e) => {
					if (e.key === "ArrowRight") {
						startDragging("right");
					}
				}}
				style="left: {rightHandlePosition}%;"
			/>
		</div>
	{:else}
		<p>Generating thumbnails...</p>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: var(--spacing-lg) var(--spacing-lg) 0 var(--spacing-lg);
		border: 2px solid var(--color-accent);
	}

	#timeline {
		display: flex;
		height: var(--size-10);
		flex: 1;
		position: relative;
	}

	img {
		flex: 1 1 auto;
		min-width: 0;
		object-fit: cover;
		height: var(--size-8);
		border: 1px solid var(--block-border-color);
		user-select: none;
		z-index: 1;
	}

	.handle {
		width: 5px;
		background-color: var(--color-accent);
		cursor: ew-resize;
		height: var(--size-8);
		z-index: 3;

		position: absolute;
	}

	.opaque-layer {
		background-color: rgba(230, 103, 40, 0.25);
		height: var(--size-8);
		position: absolute;
		z-index: 2;
	}
</style>
