/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Shape resize helper
 */
const DIVISOR = {
  rect: 1,
  circle: 2,
  triangle: 1,
};
const DIMENSION_KEYS = {
  rect: {
    w: 'width',
    h: 'height',
  },
  circle: {
    w: 'rx',
    h: 'ry',
  },
  triangle: {
    w: 'width',
    h: 'height',
  },
};

/**
 * Set the start point value to the shape object
 * @param {fabric.Object} shape - Shape object
 * @ignore
 */
function setStartPoint(shape) {
  const { originX, originY } = shape;
  const originKey = originX.substring(0, 1) + originY.substring(0, 1);

  shape.startPoint = shape.origins[originKey];
}

/**
 * Get the positions of ratated origin by the pointer value
 * @param {{x: number, y: number}} origin - Origin value
 * @param {{x: number, y: number}} pointer - Pointer value
 * @param {number} angle - Rotating angle
 * @returns {Object} Postions of origin
 * @ignore
 */
function getPositionsOfRotatedOrigin(origin, pointer, angle) {
  const sx = origin.x;
  const sy = origin.y;
  const px = pointer.x;
  const py = pointer.y;
  const r = (angle * Math.PI) / 180;
  const rx = (px - sx) * Math.cos(r) - (py - sy) * Math.sin(r) + sx;
  const ry = (px - sx) * Math.sin(r) + (py - sy) * Math.cos(r) + sy;

  return {
    originX: sx > rx ? 'right' : 'left',
    originY: sy > ry ? 'bottom' : 'top',
  };
}

/**
 * Whether the shape has the center origin or not
 * @param {fabric.Object} shape - Shape object
 * @returns {boolean} State
 * @ignore
 */
function hasCenterOrigin(shape) {
  return shape.originX === 'center' && shape.originY === 'center';
}

/**
 * Adjust the origin of shape by the start point
 * @param {{x: number, y: number}} pointer - Pointer value
 * @param {fabric.Object} shape - Shape object
 * @ignore
 */
function adjustOriginByStartPoint(pointer, shape) {
  const centerPoint = shape.getPointByOrigin('center', 'center');
  const angle = -shape.angle;
  const originPositions = getPositionsOfRotatedOrigin(centerPoint, pointer, angle);
  const { originX, originY } = originPositions;
  const origin = shape.getPointByOrigin(originX, originY);
  const left = shape.left - (centerPoint.x - origin.x);
  const top = shape.top - (centerPoint.y - origin.y);

  shape.set({
    originX,
    originY,
    left,
    top,
  });

  shape.setCoords();
}

/**
 * Adjust the origin of shape by the moving pointer value
 * @param {{x: number, y: number}} pointer - Pointer value
 * @param {fabric.Object} shape - Shape object
 * @ignore
 */
function adjustOriginByMovingPointer(pointer, shape) {
  const origin = shape.startPoint;
  const angle = -shape.angle;
  const originPositions = getPositionsOfRotatedOrigin(origin, pointer, angle);
  const { originX, originY } = originPositions;

  shape.setPositionByOrigin(origin, originX, originY);
  shape.setCoords();
}

/**
 * Adjust the dimension of shape on firing scaling event
 * @param {fabric.Object} shape - Shape object
 * @ignore
 */
function adjustDimensionOnScaling(shape) {
  const { type, scaleX, scaleY } = shape;
  const dimensionKeys = DIMENSION_KEYS[type];
  let width = shape[dimensionKeys.w] * scaleX;
  let height = shape[dimensionKeys.h] * scaleY;

  if (shape.isRegular) {
    const maxScale = Math.max(scaleX, scaleY);

    width = shape[dimensionKeys.w] * maxScale;
    height = shape[dimensionKeys.h] * maxScale;
  }

  const options = {
    hasControls: false,
    hasBorders: false,
    scaleX: 1,
    scaleY: 1,
  };

  options[dimensionKeys.w] = width;
  options[dimensionKeys.h] = height;

  shape.set(options);
}

/**
 * Adjust the dimension of shape on firing mouse move event
 * @param {{x: number, y: number}} pointer - Pointer value
 * @param {fabric.Object} shape - Shape object
 * @ignore
 */
function adjustDimensionOnMouseMove(pointer, shape) {
  const { type, strokeWidth, startPoint: origin } = shape;
  const divisor = DIVISOR[type];
  const dimensionKeys = DIMENSION_KEYS[type];
  const isTriangle = !!(shape.type === 'triangle');
  const options = {};
  let width = Math.abs(origin.x - pointer.x) / divisor;
  let height = Math.abs(origin.y - pointer.y) / divisor;

  if (width > strokeWidth) {
    width -= strokeWidth / divisor;
  }

  if (height > strokeWidth) {
    height -= strokeWidth / divisor;
  }

  if (shape.isRegular) {
    width = height = Math.max(width, height);

    if (isTriangle) {
      height = (Math.sqrt(3) / 2) * width;
    }
  }

  options[dimensionKeys.w] = width;
  options[dimensionKeys.h] = height;

  shape.set(options);
}

module.exports = {
  /**
   * Set each origin value to shape
   * @param {fabric.Object} shape - Shape object
   */
  setOrigins(shape) {
    const leftTopPoint = shape.getPointByOrigin('left', 'top');
    const rightTopPoint = shape.getPointByOrigin('right', 'top');
    const rightBottomPoint = shape.getPointByOrigin('right', 'bottom');
    const leftBottomPoint = shape.getPointByOrigin('left', 'bottom');

    shape.origins = {
      lt: leftTopPoint,
      rt: rightTopPoint,
      rb: rightBottomPoint,
      lb: leftBottomPoint,
    };
  },

  /**
   * Resize the shape
   * @param {fabric.Object} shape - Shape object
   * @param {{x: number, y: number}} pointer - Mouse pointer values on canvas
   * @param {boolean} isScaling - Whether the resizing action is scaling or not
   */
  resize(shape, pointer, isScaling) {
    if (hasCenterOrigin(shape)) {
      adjustOriginByStartPoint(pointer, shape);
      setStartPoint(shape);
    }

    if (isScaling) {
      adjustDimensionOnScaling(shape, pointer);
    } else {
      adjustDimensionOnMouseMove(pointer, shape);
    }

    adjustOriginByMovingPointer(pointer, shape);
  },

  /**
   * Adjust the origin position of shape to center
   * @param {fabric.Object} shape - Shape object
   */
  adjustOriginToCenter(shape) {
    const centerPoint = shape.getPointByOrigin('center', 'center');
    const { originX, originY } = shape;
    const origin = shape.getPointByOrigin(originX, originY);
    const left = shape.left + (centerPoint.x - origin.x);
    const top = shape.top + (centerPoint.y - origin.y);

    shape.set({
      hasControls: true,
      hasBorders: true,
      originX: 'center',
      originY: 'center',
      left,
      top,
    });

    shape.setCoords(); // For left, top properties
  },
};
