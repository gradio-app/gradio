/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Shape resize helper
 */
import { fabric } from 'fabric';
import { forEach, map, extend } from 'tui-code-snippet';
import resizeHelper from '@/helper/shapeResizeHelper';
import { capitalizeString, flipObject, setCustomProperty, getCustomProperty } from '@/util';

const FILTER_OPTION_MAP = {
  pixelate: 'blocksize',
  blur: 'blur',
};
const POSITION_DIMENSION_MAP = {
  x: 'width',
  y: 'height',
};

const FILTER_NAME_VALUE_MAP = flipObject(FILTER_OPTION_MAP);

/**
 * Cached canvas image element for fill image
 * @type {boolean}
 * @private
 */
let cachedCanvasImageElement = null;

/**
 * Get background image of fill
 * @param {fabric.Object} shapeObj - Shape object
 * @returns {fabric.Image}
 * @private
 */
export function getFillImageFromShape(shapeObj) {
  const { patternSourceCanvas } = getCustomProperty(shapeObj, 'patternSourceCanvas');
  const [fillImage] = patternSourceCanvas.getObjects();

  return fillImage;
}

/**
 * Reset the image position in the filter type fill area.
 * @param {fabric.Object} shapeObj - Shape object
 * @private
 */
export function rePositionFilterTypeFillImage(shapeObj) {
  const { angle, flipX, flipY } = shapeObj;
  const fillImage = getFillImageFromShape(shapeObj);
  const rotatedShapeCornerDimension = getRotatedDimension(shapeObj);
  const { right, bottom } = rotatedShapeCornerDimension;
  let { width, height } = rotatedShapeCornerDimension;
  const diffLeft = (width - shapeObj.width) / 2;
  const diffTop = (height - shapeObj.height) / 2;
  const cropX = shapeObj.left - shapeObj.width / 2 - diffLeft;
  const cropY = shapeObj.top - shapeObj.height / 2 - diffTop;
  let left = width / 2 - diffLeft;
  let top = height / 2 - diffTop;
  const fillImageMaxSize = Math.max(width, height) + Math.max(diffLeft, diffTop);

  [left, top, width, height] = calculateFillImageDimensionOutsideCanvas({
    shapeObj,
    left,
    top,
    width,
    height,
    cropX,
    cropY,
    flipX,
    flipY,
    right,
    bottom,
  });

  fillImage.set({
    angle: flipX === flipY ? -angle : angle,
    left,
    top,
    width,
    height,
    cropX,
    cropY,
    flipX,
    flipY,
  });

  setCustomProperty(fillImage, { fillImageMaxSize });
}

/**
 * Make filter option from fabric image
 * @param {fabric.Image} imageObject - fabric image object
 * @returns {object}
 */
export function makeFilterOptionFromFabricImage(imageObject) {
  return map(imageObject.filters, (filter) => {
    const [key] = Object.keys(filter);

    return {
      [FILTER_NAME_VALUE_MAP[key]]: filter[key],
    };
  });
}

/**
 * Calculate fill image position and size for out of Canvas
 * @param {Object} options - options for position dimension calculate
 *   @param {fabric.Object} shapeObj - shape object
 *   @param {number} left - original left position
 *   @param {number} top - original top position
 *   @param {number} width - image width
 *   @param {number} height - image height
 *   @param {number} cropX - image cropX
 *   @param {number} cropY - image cropY
 *   @param {boolean} flipX - shape flipX
 *   @param {boolean} flipY - shape flipY
 * @returns {Object}
 */
function calculateFillImageDimensionOutsideCanvas({
  shapeObj,
  left,
  top,
  width,
  height,
  cropX,
  cropY,
  flipX,
  flipY,
  right,
  bottom,
}) {
  const overflowAreaPositionFixer = (type, outDistance, imageLeft, imageTop) =>
    calculateDistanceOverflowPart({
      type,
      outDistance,
      shapeObj,
      flipX,
      flipY,
      left: imageLeft,
      top: imageTop,
    });
  const [originalWidth, originalHeight] = [width, height];

  [left, top, width, height] = calculateDimensionLeftTopEdge(overflowAreaPositionFixer, {
    left,
    top,
    width,
    height,
    cropX,
    cropY,
  });

  [left, top, width, height] = calculateDimensionRightBottomEdge(overflowAreaPositionFixer, {
    left,
    top,
    insideCanvasRealImageWidth: width,
    insideCanvasRealImageHeight: height,
    right,
    bottom,
    cropX,
    cropY,
    originalWidth,
    originalHeight,
  });

  return [left, top, width, height];
}

/**
 * Calculate fill image position and size for for right bottom edge
 * @param {Function} overflowAreaPositionFixer - position fixer
 * @param {Object} options - options for position dimension calculate
 *   @param {fabric.Object} shapeObj - shape object
 *   @param {number} left - original left position
 *   @param {number} top - original top position
 *   @param {number} width - image width
 *   @param {number} height - image height
 *   @param {number} right - image right
 *   @param {number} bottom - image bottom
 *   @param {number} cropX - image cropX
 *   @param {number} cropY - image cropY
 *   @param {boolean} originalWidth - image original width
 *   @param {boolean} originalHeight - image original height
 * @returns {Object}
 */
function calculateDimensionRightBottomEdge(
  overflowAreaPositionFixer,
  {
    left,
    top,
    insideCanvasRealImageWidth,
    insideCanvasRealImageHeight,
    right,
    bottom,
    cropX,
    cropY,
    originalWidth,
    originalHeight,
  }
) {
  let [width, height] = [insideCanvasRealImageWidth, insideCanvasRealImageHeight];
  const { width: canvasWidth, height: canvasHeight } = cachedCanvasImageElement;

  if (right > canvasWidth && cropX > 0) {
    width = originalWidth - Math.abs(right - canvasWidth);
  }
  if (bottom > canvasHeight && cropY > 0) {
    height = originalHeight - Math.abs(bottom - canvasHeight);
  }

  const diff = {
    x: (insideCanvasRealImageWidth - width) / 2,
    y: (insideCanvasRealImageHeight - height) / 2,
  };

  forEach(['x', 'y'], (type) => {
    const cropDistance2 = diff[type];
    if (cropDistance2 > 0) {
      [left, top] = overflowAreaPositionFixer(type, cropDistance2, left, top);
    }
  });

  return [left, top, width, height];
}

/**
 * Calculate fill image position and size for for left top
 * @param {Function} overflowAreaPositionFixer - position fixer
 * @param {Object} options - options for position dimension calculate
 *   @param {fabric.Object} shapeObj - shape object
 *   @param {number} left - original left position
 *   @param {number} top - original top position
 *   @param {number} width - image width
 *   @param {number} height - image height
 *   @param {number} cropX - image cropX
 *   @param {number} cropY - image cropY
 * @returns {Object}
 */
function calculateDimensionLeftTopEdge(
  overflowAreaPositionFixer,
  { left, top, width, height, cropX, cropY }
) {
  const dimension = {
    width,
    height,
  };

  forEach(['x', 'y'], (type) => {
    const cropDistance = type === 'x' ? cropX : cropY;
    const compareSize = dimension[POSITION_DIMENSION_MAP[type]];
    const standardSize = cachedCanvasImageElement[POSITION_DIMENSION_MAP[type]];

    if (compareSize > standardSize) {
      const outDistance = (compareSize - standardSize) / 2;

      dimension[POSITION_DIMENSION_MAP[type]] = standardSize;
      [left, top] = overflowAreaPositionFixer(type, outDistance, left, top);
    }
    if (cropDistance < 0) {
      [left, top] = overflowAreaPositionFixer(type, cropDistance, left, top);
    }
  });

  return [left, top, dimension.width, dimension.height];
}

/**
 * Make fill property of dynamic pattern type
 * @param {fabric.Image} canvasImage - canvas background image
 * @param {Array} filterOption - filter option
 * @param {fabric.StaticCanvas} patternSourceCanvas - fabric static canvas
 * @returns {Object}
 */
export function makeFillPatternForFilter(canvasImage, filterOption, patternSourceCanvas) {
  const copiedCanvasElement = getCachedCanvasImageElement(canvasImage);
  const fillImage = makeFillImage(copiedCanvasElement, canvasImage.angle, filterOption);
  patternSourceCanvas.add(fillImage);

  const fabricProperty = {
    fill: new fabric.Pattern({
      source: patternSourceCanvas.getElement(),
      repeat: 'no-repeat',
    }),
  };

  setCustomProperty(fabricProperty, { patternSourceCanvas });

  return fabricProperty;
}

/**
 * Reset fill pattern canvas
 * @param {fabric.StaticCanvas} patternSourceCanvas - fabric static canvas
 */
export function resetFillPatternCanvas(patternSourceCanvas) {
  const [innerImage] = patternSourceCanvas.getObjects();
  let { fillImageMaxSize } = getCustomProperty(innerImage, 'fillImageMaxSize');
  fillImageMaxSize = Math.max(1, fillImageMaxSize);

  patternSourceCanvas.setDimensions({
    width: fillImageMaxSize,
    height: fillImageMaxSize,
  });
  patternSourceCanvas.renderAll();
}

/**
 * Remake filter pattern image source
 * @param {fabric.Object} shapeObj - Shape object
 * @param {fabric.Image} canvasImage - canvas background image
 */
export function reMakePatternImageSource(shapeObj, canvasImage) {
  const { patternSourceCanvas } = getCustomProperty(shapeObj, 'patternSourceCanvas');
  const [fillImage] = patternSourceCanvas.getObjects();
  const filterOption = makeFilterOptionFromFabricImage(fillImage);

  patternSourceCanvas.remove(fillImage);

  const copiedCanvasElement = getCachedCanvasImageElement(canvasImage, true);
  const newFillImage = makeFillImage(copiedCanvasElement, canvasImage.angle, filterOption);

  patternSourceCanvas.add(newFillImage);
}

/**
 * Calculate a point line outside the canvas.
 * @param {fabric.Image} canvasImage - canvas background image
 * @param {boolean} reset - default is false
 * @returns {HTMLImageElement}
 */
export function getCachedCanvasImageElement(canvasImage, reset = false) {
  if (!cachedCanvasImageElement || reset) {
    cachedCanvasImageElement = canvasImage.toCanvasElement();
  }

  return cachedCanvasImageElement;
}

/**
 * Calculate fill image position for out of Canvas
 * @param {string} type - 'x' or 'y'
 * @param {fabric.Object} shapeObj - shape object
 * @param {number} outDistance - distance away
 * @param {number} left - original left position
 * @param {number} top - original top position
 * @returns {Array}
 */
function calculateDistanceOverflowPart({ type, shapeObj, outDistance, left, top, flipX, flipY }) {
  const shapePointNavigation = getShapeEdgePoint(shapeObj);
  const shapeNeighborPointNavigation = [
    [1, 2],
    [0, 3],
    [0, 3],
    [1, 2],
  ];
  const linePointsOutsideCanvas = calculateLinePointsOutsideCanvas(
    type,
    shapePointNavigation,
    shapeNeighborPointNavigation
  );
  const reatAngles = calculateLineAngleOfOutsideCanvas(
    type,
    shapePointNavigation,
    linePointsOutsideCanvas
  );
  const { startPointIndex } = linePointsOutsideCanvas;
  const diffPosition = getReversePositionForFlip({
    outDistance,
    startPointIndex,
    flipX,
    flipY,
    reatAngles,
  });

  return [left + diffPosition.left, top + diffPosition.top];
}

/**
 * Calculate fill image position for out of Canvas
 * @param {number} outDistance - distance away
 * @param {boolean} flipX - flip x statux
 * @param {boolean} flipY - flip y statux
 * @param {Array} reatAngles - Line angle of the rectangle vertex.
 * @returns {Object} diffPosition
 */
function getReversePositionForFlip({ outDistance, startPointIndex, flipX, flipY, reatAngles }) {
  const rotationChangePoint1 = outDistance * Math.cos((reatAngles[0] * Math.PI) / 180);
  const rotationChangePoint2 = outDistance * Math.cos((reatAngles[1] * Math.PI) / 180);
  const isForward = startPointIndex === 2 || startPointIndex === 3;
  const diffPosition = {
    top: isForward ? rotationChangePoint1 : rotationChangePoint2,
    left: isForward ? rotationChangePoint2 : rotationChangePoint1,
  };

  if (isReverseLeftPositionForFlip(startPointIndex, flipX, flipY)) {
    diffPosition.left = diffPosition.left * -1;
  }
  if (isReverseTopPositionForFlip(startPointIndex, flipX, flipY)) {
    diffPosition.top = diffPosition.top * -1;
  }

  return diffPosition;
}

/**
 * Calculate a point line outside the canvas.
 * @param {string} type - 'x' or 'y'
 * @param {Array} shapePointNavigation - shape edge positions
 *   @param {Object} shapePointNavigation.lefttop - left top position
 *   @param {Object} shapePointNavigation.righttop - right top position
 *   @param {Object} shapePointNavigation.leftbottom - lefttop position
 *   @param {Object} shapePointNavigation.rightbottom - rightbottom position
 * @param {Array} shapeNeighborPointNavigation - Array to find adjacent edges.
 * @returns {Object}
 */
function calculateLinePointsOutsideCanvas(
  type,
  shapePointNavigation,
  shapeNeighborPointNavigation
) {
  let minimumPoint = 0;
  let minimumPointIndex = 0;
  forEach(shapePointNavigation, (point, index) => {
    if (point[type] < minimumPoint) {
      minimumPoint = point[type];
      minimumPointIndex = index;
    }
  });

  const [endPointIndex1, endPointIndex2] = shapeNeighborPointNavigation[minimumPointIndex];

  return {
    startPointIndex: minimumPointIndex,
    endPointIndex1,
    endPointIndex2,
  };
}

/**
 * Calculate a point line outside the canvas.
 * @param {string} type - 'x' or 'y'
 * @param {Array} shapePointNavigation - shape edge positions
 *   @param {object} shapePointNavigation.lefttop - left top position
 *   @param {object} shapePointNavigation.righttop - right top position
 *   @param {object} shapePointNavigation.leftbottom - lefttop position
 *   @param {object} shapePointNavigation.rightbottom - rightbottom position
 * @param {Object} linePointsOfOneVertexIndex - Line point of one vertex
 *   @param {Object} linePointsOfOneVertexIndex.startPoint - start point index
 *   @param {Object} linePointsOfOneVertexIndex.endPointIndex1 - end point index
 *   @param {Object} linePointsOfOneVertexIndex.endPointIndex2 - end point index
 * @returns {Object}
 */
function calculateLineAngleOfOutsideCanvas(type, shapePointNavigation, linePointsOfOneVertexIndex) {
  const { startPointIndex, endPointIndex1, endPointIndex2 } = linePointsOfOneVertexIndex;
  const horizontalVerticalAngle = type === 'x' ? 180 : 270;

  return map([endPointIndex1, endPointIndex2], (pointIndex) => {
    const startPoint = shapePointNavigation[startPointIndex];
    const endPoint = shapePointNavigation[pointIndex];
    const diffY = startPoint.y - endPoint.y;
    const diffX = startPoint.x - endPoint.x;

    return (Math.atan2(diffY, diffX) * 180) / Math.PI - horizontalVerticalAngle;
  });
}

/* eslint-disable complexity */
/**
 * Calculate a point line outside the canvas for horizontal.
 * @param {number} startPointIndex - start point index
 * @param {boolean} flipX - flip x statux
 * @param {boolean} flipY - flip y statux
 * @returns {boolean} flipY - flip y statux
 */
function isReverseLeftPositionForFlip(startPointIndex, flipX, flipY) {
  return (
    (((!flipX && flipY) || (!flipX && !flipY)) && startPointIndex === 0) ||
    (((flipX && flipY) || (flipX && !flipY)) && startPointIndex === 1) ||
    (((!flipX && !flipY) || (!flipX && flipY)) && startPointIndex === 2) ||
    (((flipX && !flipY) || (flipX && flipY)) && startPointIndex === 3)
  );
}
/* eslint-enable complexity */

/* eslint-disable complexity */
/**
 * Calculate a point line outside the canvas for vertical.
 * @param {number} startPointIndex - start point index
 * @param {boolean} flipX - flip x statux
 * @param {boolean} flipY - flip y statux
 * @returns {boolean} flipY - flip y statux
 */
function isReverseTopPositionForFlip(startPointIndex, flipX, flipY) {
  return (
    (((flipX && !flipY) || (!flipX && !flipY)) && startPointIndex === 0) ||
    (((!flipX && !flipY) || (flipX && !flipY)) && startPointIndex === 1) ||
    (((flipX && flipY) || (!flipX && flipY)) && startPointIndex === 2) ||
    (((!flipX && flipY) || (flipX && flipY)) && startPointIndex === 3)
  );
}
/* eslint-enable complexity */

/**
 * Shape edge points
 * @param {fabric.Object} shapeObj - Selected shape object on canvas
 * @returns {Array} shapeEdgePoint - shape edge positions
 */
function getShapeEdgePoint(shapeObj) {
  return [
    shapeObj.getPointByOrigin('left', 'top'),
    shapeObj.getPointByOrigin('right', 'top'),
    shapeObj.getPointByOrigin('left', 'bottom'),
    shapeObj.getPointByOrigin('right', 'bottom'),
  ];
}

/**
 * Rotated shape dimension
 * @param {fabric.Object} shapeObj - Shape object
 * @returns {Object} Rotated shape dimension
 */
function getRotatedDimension(shapeObj) {
  const [{ x: ax, y: ay }, { x: bx, y: by }, { x: cx, y: cy }, { x: dx, y: dy }] =
    getShapeEdgePoint(shapeObj);

  const left = Math.min(ax, bx, cx, dx);
  const top = Math.min(ay, by, cy, dy);
  const right = Math.max(ax, bx, cx, dx);
  const bottom = Math.max(ay, by, cy, dy);

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

/**
 * Make fill image
 * @param {HTMLImageElement} copiedCanvasElement - html image element
 * @param {number} currentCanvasImageAngle - current canvas angle
 * @param {Array} filterOption - filter option
 * @returns {fabric.Image}
 * @private
 */
function makeFillImage(copiedCanvasElement, currentCanvasImageAngle, filterOption) {
  const fillImage = new fabric.Image(copiedCanvasElement);

  forEach(extend({}, ...filterOption), (value, key) => {
    const fabricFilterClassName = capitalizeString(key);
    const filter = new fabric.Image.filters[fabricFilterClassName]({
      [FILTER_OPTION_MAP[key]]: value,
    });
    fillImage.filters.push(filter);
  });
  fillImage.applyFilters();

  setCustomProperty(fillImage, {
    originalAngle: currentCanvasImageAngle,
    fillImageMaxSize: Math.max(fillImage.width, fillImage.height),
  });
  resizeHelper.adjustOriginToCenter(fillImage);

  return fillImage;
}
