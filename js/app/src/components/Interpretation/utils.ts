export const getSaliencyColor = (value: number): string => {
	var color: [number, number, number] | null = null;
	if (value < 0) {
		color = [52, 152, 219];
	} else {
		color = [231, 76, 60];
	}
	return colorToString(interpolate(Math.abs(value), [255, 255, 255], color));
};

const interpolate = (
	val: number,
	rgb1: [number, number, number],
	rgb2: [number, number, number]
): [number, number, number] => {
	if (val > 1) {
		val = 1;
	}
	val = Math.sqrt(val);
	var rgb: [number, number, number] = [0, 0, 0];
	var i;
	for (i = 0; i < 3; i++) {
		rgb[i] = Math.round(rgb1[i] * (1.0 - val) + rgb2[i] * val);
	}
	return rgb;
};

const colorToString = (rgb: [number, number, number]): string => {
	return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
};

export const getObjectFitSize = (
	contains: boolean /* true = contain, false = cover */,
	containerWidth: number,
	containerHeight: number,
	width: number,
	height: number
) => {
	var doRatio = width / height;
	var cRatio = containerWidth / containerHeight;
	var targetWidth = 0;
	var targetHeight = 0;
	var test = contains ? doRatio > cRatio : doRatio < cRatio;

	if (test) {
		targetWidth = containerWidth;
		targetHeight = targetWidth / doRatio;
	} else {
		targetHeight = containerHeight;
		targetWidth = targetHeight * doRatio;
	}

	return {
		width: targetWidth,
		height: targetHeight,
		x: (containerWidth - targetWidth) / 2,
		y: (containerHeight - targetHeight) / 2
	};
};
