<script lang="ts">
	import { onMount, tick } from "svelte";
	import { spring, type Spring } from "svelte/motion";

	export class ZoomableImage {
		container: HTMLDivElement;
		image: HTMLImageElement;
		scale: number;
		offsetX: number;
		offsetY: number;
		isDragging: boolean;
		lastX: number;
		lastY: number;
		initial_left_padding: number;
		initial_top_padding: number;
		initial_width: number;
		initial_height: number;
		subscribers: ((offsetX: number, offsetY: number, scale: number) => void)[];
		constructor(container: HTMLDivElement, image: HTMLImageElement) {
			this.container = container;
			this.image = image;

			// Initial state
			this.scale = 1;
			this.offsetX = 0;
			this.offsetY = 0;
			this.isDragging = false;
			this.lastX = 0;
			this.lastY = 0;
			this.initial_left_padding = 0;
			this.initial_top_padding = 0;
			this.initial_width = 0;
			this.initial_height = 0;
			this.subscribers = [];

			// Bind methods
			this.handleWheel = this.handleWheel.bind(this);
			this.handleMouseDown = this.handleMouseDown.bind(this);
			this.handleMouseMove = this.handleMouseMove.bind(this);
			this.handleMouseUp = this.handleMouseUp.bind(this);
			this.handleImageLoad = this.handleImageLoad.bind(this);

			// Add image load handler
			this.image.addEventListener("load", this.handleImageLoad);

			// Add image to container
			this.container.appendChild(this.image);

			// Add event listeners
			this.container.addEventListener("wheel", this.handleWheel);
			this.container.addEventListener("mousedown", this.handleMouseDown);
			document.addEventListener("mousemove", this.handleMouseMove);
			document.addEventListener("mouseup", this.handleMouseUp);
		}

		handleImageLoad(): void {
			// Calculate initial dimensions
			const containerRect = this.container.getBoundingClientRect();
			const imageAspect = this.image.naturalWidth / this.image.naturalHeight;
			const containerAspect = containerRect.width / containerRect.height;

			if (imageAspect > containerAspect) {
				this.image.style.width = "100%";
				this.image.style.height = "auto";
			} else {
				this.image.style.width = "auto";
				this.image.style.height = "100%";
			}

			// Store initial image position and size
			const imageRect = this.image.getBoundingClientRect();
			this.initial_left_padding = imageRect.left - containerRect.left;
			this.initial_top_padding = imageRect.top - containerRect.top;
			this.initial_width = imageRect.width;
			this.initial_height = imageRect.height;

			// Center the image
			this.updateTransform();
		}

		async handleWheel(e: WheelEvent): Promise<void> {
			e.preventDefault();
			await tick();

			const containerRect = this.container.getBoundingClientRect();
			const imageRect = this.image.getBoundingClientRect(); // Get initial bounds

			console.log("handleWheel START", {
				cursor: { x: e.clientX, y: e.clientY },
				containerRect,
				initialImageRect: imageRect,
				initialState: { x: this.offsetX, y: this.offsetY, scale: this.scale },
			});

			// Don't zoom if cursor is not over the image
			if (
				e.clientX < imageRect.left ||
				e.clientX > imageRect.right ||
				e.clientY < imageRect.top ||
				e.clientY > imageRect.bottom
			) {
				return;
			}

			// Calculate zoom factor
			const zoomFactor = 1.05;
			const oldScale = this.scale;
			const newScale =
				-Math.sign(e.deltaY) > 0
					? Math.min(15, oldScale * zoomFactor) // Zoom in
					: Math.max(1, oldScale / zoomFactor); // Zoom out

			if (newScale === oldScale) return;

			// Calculate the scaling factor between old and new scales
			const scalingFactor = newScale / oldScale;

			// Get cursor position in container coordinates
			const cursorX = e.clientX - containerRect.left;
			const cursorY = e.clientY - containerRect.top;

			// Get image current visual top-left in container coordinates
			const imgX = imageRect.left - containerRect.left;
			const imgY = imageRect.top - containerRect.top;

			// Calculate the new offset based on keeping the cursor point fixed
			const calculatedNewOffsetX =
				this.offsetX + (cursorX - imgX) * (1 - scalingFactor);
			const calculatedNewOffsetY =
				this.offsetY + (cursorY - imgY) * (1 - scalingFactor);

			console.log("handleWheel CALC", {
				oldScale,
				newScale,
				scalingFactor,
				cursorX,
				cursorY,
				imgX,
				imgY,
				calculatedNewOffsetX,
				calculatedNewOffsetY,
			});

			// Update scale and offsets
			this.scale = newScale;
			this.offsetX = calculatedNewOffsetX;
			this.offsetY = calculatedNewOffsetY;

			console.log("handleWheel PRE-CONSTRAIN", {
				state: { x: this.offsetX, y: this.offsetY, scale: this.scale },
			});

			// Apply transform *before* constraining to get correct bounds
			this.updateTransform(); // Apply before constrain

			this.constrainToBounds();
			this.updateTransform(); // Apply again after constraining
		}

		handleMouseDown(e: MouseEvent): void {
			e.preventDefault();
			if (this.scale === 1) return;
			this.isDragging = true;
			this.lastX = e.clientX;
			this.lastY = e.clientY;
			this.container.style.cursor = "grabbing";
		}

		handleMouseMove(e: MouseEvent): void {
			e.preventDefault();
			if (!this.isDragging) return;

			const deltaX = e.clientX - this.lastX;
			const deltaY = e.clientY - this.lastY;

			this.offsetX += deltaX;
			this.offsetY += deltaY;

			this.lastX = e.clientX;
			this.lastY = e.clientY;

			this.constrainToBounds();
			this.updateTransform();
		}

		handleMouseUp(): void {
			this.isDragging = false;
			this.container.style.cursor = "grab";
		}

		constrainToBounds(): void {
			const containerRect = this.container.getBoundingClientRect();
			const imageRect = this.image.getBoundingClientRect(); // Get potentially updated bounds

			console.log("constrainToBounds START", {
				containerRect,
				imageRect,
				inputState: { x: this.offsetX, y: this.offsetY, scale: this.scale },
			});

			const imgActualWidth = imageRect.width;
			const imgActualHeight = imageRect.height;

			// Current edges relative to container origin
			const leftEdgeX = imageRect.left - containerRect.left;
			const rightEdgeX = leftEdgeX + imgActualWidth; // Use width from rect
			const topEdgeY = imageRect.top - containerRect.top;
			const bottomEdgeY = topEdgeY + imgActualHeight; // Use height from rect

			let constraintCalcOffsetX = this.offsetX; // Start with current offset
			let constraintCalcOffsetY = this.offsetY; // Start with current offset

			// Horizontal Constraints
			if (imgActualWidth > containerRect.width) {
				// Image wider than container: prevent edges from coming inside container
				if (leftEdgeX > 0) {
					// Left edge is inside container's left boundary, shift image left
					constraintCalcOffsetX = this.offsetX - leftEdgeX;
				} else if (rightEdgeX < containerRect.width) {
					// Right edge is inside container's right boundary, shift image right
					constraintCalcOffsetX =
						this.offsetX + (containerRect.width - rightEdgeX);
				}
			} /* else {
				// Image narrower than container: prevent edges from going outside container
				if (leftEdgeX < 0) {
					// Left edge is outside container's left boundary, shift image right
					constraintCalcOffsetX = this.offsetX - leftEdgeX;
				} else if (rightEdgeX > containerRect.width) {
					// Right edge is outside container's right boundary, shift image left
					constraintCalcOffsetX = this.offsetX - (rightEdgeX - containerRect.width);
				}
			} */

			// Vertical Constraints
			if (imgActualHeight > containerRect.height) {
				// Image taller than container: prevent edges from coming inside container
				if (topEdgeY > 0) {
					// Top edge is inside container's top boundary, shift image up
					constraintCalcOffsetY = this.offsetY - topEdgeY;
				} else if (bottomEdgeY < containerRect.height) {
					// Bottom edge is inside container's bottom boundary, shift image down
					constraintCalcOffsetY =
						this.offsetY + (containerRect.height - bottomEdgeY);
				}
			} else {
				// Image shorter than container: prevent edges from going outside container
				if (topEdgeY < 0) {
					// Top edge is outside container's top boundary, shift image down
					constraintCalcOffsetY = this.offsetY - topEdgeY;
				} else if (bottomEdgeY > containerRect.height) {
					// Bottom edge is outside container's bottom boundary, shift image up
					constraintCalcOffsetY =
						this.offsetY - (bottomEdgeY - containerRect.height);
				}
			}

			console.log("constrainToBounds CALC", {
				edges: {
					left: leftEdgeX,
					right: rightEdgeX,
					top: topEdgeY,
					bottom: bottomEdgeY,
				},
				calculatedOffsets: {
					x: constraintCalcOffsetX,
					y: constraintCalcOffsetY,
				},
			});

			// Only update offsets if they changed significantly
			const threshold = 0.1;
			let appliedOffsetX = this.offsetX;
			let appliedOffsetY = this.offsetY;
			if (Math.abs(this.offsetX - constraintCalcOffsetX) > threshold)
				appliedOffsetX = constraintCalcOffsetX;
			if (Math.abs(this.offsetY - constraintCalcOffsetY) > threshold)
				appliedOffsetY = constraintCalcOffsetY;

			this.offsetX = appliedOffsetX;
			this.offsetY = appliedOffsetY;

			console.log("constrainToBounds END", {
				finalState: { x: this.offsetX, y: this.offsetY },
			});
		}

		updateTransform(): void {
			console.log("updateTransform APPLY", {
				state: { x: this.offsetX, y: this.offsetY, scale: this.scale },
			});
			this.notify(this.offsetX, this.offsetY, this.scale);
			this.image.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
		}

		destroy(): void {
			this.container.removeEventListener("wheel", this.handleWheel);
			this.container.removeEventListener("mousedown", this.handleMouseDown);
			document.removeEventListener("mousemove", this.handleMouseMove);
			document.removeEventListener("mouseup", this.handleMouseUp);
			this.image.removeEventListener("load", this.handleImageLoad);
		}

		subscribe(
			cb: (offsetX: number, offsetY: number, scale: number) => void,
		): void {
			this.subscribers.push(cb);
		}

		unsubscribe(
			cb: (offsetX: number, offsetY: number, scale: number) => void,
		): void {
			this.subscribers = this.subscribers.filter(
				(subscriber) => subscriber !== cb,
			);
		}

		notify(offsetX: number, offsetY: number, scale: number): void {
			this.subscribers.forEach((subscriber) =>
				subscriber(offsetX, offsetY, scale),
			);
		}
	}

	let container_el: HTMLDivElement;
	let image_el: HTMLImageElement;
	let transform: Spring<{ x: number; y: number; z: number }> = spring(
		{ x: 0, y: 0, z: 1 },
		{
			stiffness: 0.2,
			damping: 0.6,
		},
	);

	onMount(() => {
		const zoomable_image = new ZoomableImage(container_el, image_el);
		zoomable_image.subscribe((offsetX, offsetY, scale) => {
			// transform.set({ x: offsetX, y: offsetY, z: scale }, { hard: true });
			image_el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
		});
	});
</script>

<div class="container" bind:this={container_el}>
	<img
		src="https://picsum.photos/2400/1800"
		alt="Random"
		bind:this={image_el}
		style:transform="translate({$transform.x}px, {$transform.y}px) scale({$transform.z})"
	/>
</div>

<style>
	.container {
		border: 2px solid #646cff;
		overflow: hidden;
		position: relative;
		width: 100%;
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f0f0;
	}

	img {
		position: absolute;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		/* transform-origin: center; */
		cursor: zoom-in;
	}
</style>
