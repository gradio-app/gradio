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
	subscribers: (({
		x,
		y,
		scale
	}: {
		x: number;
		y: number;
		scale: number;
	}) => void)[];
	handleImageLoad: () => void;
	real_image_size: {
		top: number;
		left: number;
		width: number;
		height: number;
	} = { top: 0, left: 0, width: 0, height: 0 };

	last_touch_distance: number;

	constructor(container: HTMLDivElement, image: HTMLImageElement) {
		this.container = container;
		this.image = image;

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
		this.last_touch_distance = 0;

		this.handleWheel = this.handleWheel.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		this.handleImageLoad = this.init.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.handleTouchEnd = this.handleTouchEnd.bind(this);

		this.image.addEventListener("load", this.handleImageLoad);

		this.container.addEventListener("wheel", this.handleWheel);
		this.container.addEventListener("mousedown", this.handleMouseDown);
		document.addEventListener("mousemove", this.handleMouseMove);
		document.addEventListener("mouseup", this.handleMouseUp);

		this.container.addEventListener("touchstart", this.handleTouchStart);
		document.addEventListener("touchmove", this.handleTouchMove);
		document.addEventListener("touchend", this.handleTouchEnd);

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === this.container) {
					this.handleResize();
					this.get_image_size(this.image);
				}
			}
		});
		observer.observe(this.container);
	}

	handleResize(): void {
		this.init();
	}

	init(): void {
		const containerRect = this.container.getBoundingClientRect();

		const imageRect = this.image.getBoundingClientRect();
		this.initial_left_padding = imageRect.left - containerRect.left;
		this.initial_top_padding = imageRect.top - containerRect.top;
		this.initial_width = imageRect.width;
		this.initial_height = imageRect.height;

		this.reset_zoom();

		this.updateTransform();
	}

	reset_zoom(): void {
		this.scale = 1;
		this.offsetX = 0;
		this.offsetY = 0;
		this.updateTransform();
	}

	handleMouseDown(e: MouseEvent): void {
		const imageRect = this.image.getBoundingClientRect();

		if (
			e.clientX >= imageRect.left &&
			e.clientX <= imageRect.right &&
			e.clientY >= imageRect.top &&
			e.clientY <= imageRect.bottom
		) {
			e.preventDefault();
			if (this.scale === 1) return;
			this.isDragging = true;
			this.lastX = e.clientX;
			this.lastY = e.clientY;
			this.image.style.cursor = "grabbing";
		}
	}

	handleMouseMove(e: MouseEvent): void {
		if (!this.isDragging) return;

		const deltaX = e.clientX - this.lastX;
		const deltaY = e.clientY - this.lastY;

		this.offsetX += deltaX;
		this.offsetY += deltaY;

		this.lastX = e.clientX;
		this.lastY = e.clientY;

		this.updateTransform();

		this.updateTransform();
	}

	handleMouseUp(): void {
		if (this.isDragging) {
			this.constrain_to_bounds(true);
			this.updateTransform();
			this.isDragging = false;
			this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
		}
	}

	async handleWheel(e: WheelEvent): Promise<void> {
		e.preventDefault();

		const containerRect = this.container.getBoundingClientRect();
		const imageRect = this.image.getBoundingClientRect();

		if (
			e.clientX < imageRect.left ||
			e.clientX > imageRect.right ||
			e.clientY < imageRect.top ||
			e.clientY > imageRect.bottom
		) {
			return;
		}

		const zoomFactor = 1.05;
		const oldScale = this.scale;
		const newScale =
			-Math.sign(e.deltaY) > 0
				? Math.min(15, oldScale * zoomFactor) // in
				: Math.max(1, oldScale / zoomFactor); // out

		if (newScale === oldScale) return;

		const cursorX = e.clientX - containerRect.left - this.initial_left_padding;
		const cursorY = e.clientY - containerRect.top - this.initial_top_padding;

		this.scale = newScale;
		this.offsetX = this.compute_new_offset({
			cursor_position: cursorX,
			current_offset: this.offsetX,
			new_scale: newScale,
			old_scale: oldScale
		});
		this.offsetY = this.compute_new_offset({
			cursor_position: cursorY,
			current_offset: this.offsetY,
			new_scale: newScale,
			old_scale: oldScale
		});

		this.updateTransform(); // apply before constraints

		this.constrain_to_bounds();
		this.updateTransform(); // apply again after constraints

		this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
	}

	// compute_offset_for_positions({ position: number, scale: number }) {
	// 	return position - (scale / this.scale) * (position - this.offset);
	// }

	compute_new_position({
		position,
		scale,
		anchor_position
	}: {
		position: number;
		scale: number;
		anchor_position: number;
	}): number {
		return position - (position - anchor_position) * (scale / this.scale);
	}

	compute_new_offset({
		cursor_position,
		current_offset,
		new_scale,
		old_scale
	}: {
		cursor_position: number;
		current_offset: number;
		new_scale: number;
		old_scale: number;
	}): number {
		return (
			cursor_position -
			(new_scale / old_scale) * (cursor_position - current_offset)
		);
	}

	constrain_to_bounds(pan = false): void {
		if (this.scale === 1) {
			this.offsetX = 0;
			this.offsetY = 0;
			return;
		}
		const onscreen = {
			top: this.real_image_size.top * this.scale + this.offsetY,
			left: this.real_image_size.left * this.scale + this.offsetX,
			width: this.real_image_size.width * this.scale,
			height: this.real_image_size.height * this.scale,

			bottom:
				this.real_image_size.top * this.scale +
				this.offsetY +
				this.real_image_size.height * this.scale,
			right:
				this.real_image_size.left * this.scale +
				this.offsetX +
				this.real_image_size.width * this.scale
		};

		const real_image_size_right =
			this.real_image_size.left + this.real_image_size.width;
		const real_image_size_bottom =
			this.real_image_size.top + this.real_image_size.height;

		if (pan) {
			if (onscreen.top > this.real_image_size.top) {
				this.offsetY = this.calculate_position(
					this.real_image_size.top,
					0,
					"y"
				);
			} else if (onscreen.bottom < real_image_size_bottom) {
				this.offsetY = this.calculate_position(real_image_size_bottom, 1, "y");
			}

			if (onscreen.left > this.real_image_size.left) {
				this.offsetX = this.calculate_position(
					this.real_image_size.left,
					0,
					"x"
				);
			} else if (onscreen.right < real_image_size_right) {
				this.offsetX = this.calculate_position(real_image_size_right, 1, "x");
			}
		}
	}

	updateTransform(): void {
		this.notify({ x: this.offsetX, y: this.offsetY, scale: this.scale });
	}

	destroy(): void {
		this.container.removeEventListener("wheel", this.handleWheel);
		this.container.removeEventListener("mousedown", this.handleMouseDown);
		document.removeEventListener("mousemove", this.handleMouseMove);
		document.removeEventListener("mouseup", this.handleMouseUp);
		this.container.removeEventListener("touchstart", this.handleTouchStart);
		document.removeEventListener("touchmove", this.handleTouchMove);
		document.removeEventListener("touchend", this.handleTouchEnd);
		this.image.removeEventListener("load", this.handleImageLoad);
	}

	subscribe(
		cb: ({ x, y, scale }: { x: number; y: number; scale: number }) => void
	): void {
		this.subscribers.push(cb);
	}

	unsubscribe(
		cb: ({ x, y, scale }: { x: number; y: number; scale: number }) => void
	): void {
		this.subscribers = this.subscribers.filter(
			(subscriber) => subscriber !== cb
		);
	}

	notify({ x, y, scale }: { x: number; y: number; scale: number }): void {
		this.subscribers.forEach((subscriber) => subscriber({ x, y, scale }));
	}

	handleTouchStart(e: TouchEvent): void {
		e.preventDefault();
		const imageRect = this.image.getBoundingClientRect();
		const touch = e.touches[0];

		if (
			touch.clientX >= imageRect.left &&
			touch.clientX <= imageRect.right &&
			touch.clientY >= imageRect.top &&
			touch.clientY <= imageRect.bottom
		) {
			if (e.touches.length === 1 && this.scale > 1) {
				// one finger == prepare pan
				this.isDragging = true;
				this.lastX = touch.clientX;
				this.lastY = touch.clientY;
			} else if (e.touches.length === 2) {
				// two fingers == prepare pinch zoom
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				this.last_touch_distance = Math.hypot(
					touch2.clientX - touch1.clientX,
					touch2.clientY - touch1.clientY
				);
			}
		}
	}

	get_image_size(img: HTMLImageElement | null): void {
		if (!img) return;
		const container = img.parentElement?.getBoundingClientRect();

		if (!container) return;

		const naturalAspect = img.naturalWidth / img.naturalHeight;
		const containerAspect = container.width / container.height;
		let displayedWidth, displayedHeight;

		if (naturalAspect > containerAspect) {
			displayedWidth = container.width;
			displayedHeight = container.width / naturalAspect;
		} else {
			displayedHeight = container.height;
			displayedWidth = container.height * naturalAspect;
		}

		const offsetX = (container.width - displayedWidth) / 2;
		const offsetY = (container.height - displayedHeight) / 2;

		this.real_image_size = {
			top: offsetY,
			left: offsetX,
			width: displayedWidth,
			height: displayedHeight
		};
	}

	handleTouchMove(e: TouchEvent): void {
		if (e.touches.length === 1 && this.isDragging) {
			// one finger == pan
			e.preventDefault();
			const touch = e.touches[0];

			const deltaX = touch.clientX - this.lastX;
			const deltaY = touch.clientY - this.lastY;

			this.offsetX += deltaX;
			this.offsetY += deltaY;

			this.lastX = touch.clientX;
			this.lastY = touch.clientY;

			this.updateTransform();
		} else if (e.touches.length === 2) {
			// two fingers == pinch zoom
			e.preventDefault();

			const touch1 = e.touches[0];
			const touch2 = e.touches[1];

			const current_distance = Math.hypot(
				touch2.clientX - touch1.clientX,
				touch2.clientY - touch1.clientY
			);

			if (this.last_touch_distance === 0) {
				this.last_touch_distance = current_distance;
				return;
			}

			const zoomFactor = current_distance / this.last_touch_distance;

			const oldScale = this.scale;
			const newScale = Math.min(15, Math.max(1, oldScale * zoomFactor));

			if (newScale === oldScale) {
				this.last_touch_distance = current_distance;
				return;
			}

			// midpoint of touches relative to image
			const containerRect = this.container.getBoundingClientRect();
			const midX =
				(touch1.clientX + touch2.clientX) / 2 -
				containerRect.left -
				this.initial_left_padding;
			const midY =
				(touch1.clientY + touch2.clientY) / 2 -
				containerRect.top -
				this.initial_top_padding;

			this.scale = newScale;
			this.offsetX = this.compute_new_offset({
				cursor_position: midX,
				current_offset: this.offsetX,
				new_scale: newScale,
				old_scale: oldScale
			});
			this.offsetY = this.compute_new_offset({
				cursor_position: midY,
				current_offset: this.offsetY,
				new_scale: newScale,
				old_scale: oldScale
			});

			this.updateTransform();
			this.constrain_to_bounds();
			this.updateTransform();

			this.last_touch_distance = current_distance;

			this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
		}
	}

	handleTouchEnd(e: TouchEvent): void {
		if (this.isDragging) {
			this.constrain_to_bounds(true);
			this.updateTransform();
			this.isDragging = false;
		}

		if (e.touches.length === 0) {
			this.last_touch_distance = 0;
		}
	}

	calculate_position(
		screen_coord: number,
		image_anchor: number,
		axis: "x" | "y"
	): number {
		const containerRect = this.container.getBoundingClientRect();

		// Calculate X offset if requested
		if (axis === "x") {
			const relative_screen_x = screen_coord;
			const anchor_x =
				this.real_image_size.left + image_anchor * this.real_image_size.width;
			return relative_screen_x - anchor_x * this.scale;
		}

		// Calculate Y offset if requested
		if (axis === "y") {
			const relative_screen_y = screen_coord;
			const anchor_y =
				this.real_image_size.top + image_anchor * this.real_image_size.height;
			return relative_screen_y - anchor_y * this.scale;
		}

		return 0;
	}
}
