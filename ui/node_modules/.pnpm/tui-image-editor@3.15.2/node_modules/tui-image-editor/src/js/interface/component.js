/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Component interface
 */

/**
 * Component interface
 * @class
 * @param {string} name - component name
 * @param {Graphics} graphics - Graphics instance
 * @ignore
 */
class Component {
  constructor(name, graphics) {
    /**
     * Component name
     * @type {string}
     */
    this.name = name;

    /**
     * Graphics instance
     * @type {Graphics}
     */
    this.graphics = graphics;
  }

  /**
   * Fire Graphics event
   * @returns {Object} return value
   */
  fire(...args) {
    const context = this.graphics;

    return this.graphics.fire.apply(context, args);
  }

  /**
   * Save image(background) of canvas
   * @param {string} name - Name of image
   * @param {fabric.Image} oImage - Fabric image instance
   */
  setCanvasImage(name, oImage) {
    this.graphics.setCanvasImage(name, oImage);
  }

  /**
   * Returns canvas element of fabric.Canvas[[lower-canvas]]
   * @returns {HTMLCanvasElement}
   */
  getCanvasElement() {
    return this.graphics.getCanvasElement();
  }

  /**
   * Get fabric.Canvas instance
   * @returns {fabric.Canvas}
   */
  getCanvas() {
    return this.graphics.getCanvas();
  }

  /**
   * Get canvasImage (fabric.Image instance)
   * @returns {fabric.Image}
   */
  getCanvasImage() {
    return this.graphics.getCanvasImage();
  }

  /**
   * Get image name
   * @returns {string}
   */
  getImageName() {
    return this.graphics.getImageName();
  }

  /**
   * Get image editor
   * @returns {ImageEditor}
   */
  getEditor() {
    return this.graphics.getEditor();
  }

  /**
   * Return component name
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Set image properties
   * @param {Object} setting - Image properties
   * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
   */
  setImageProperties(setting, withRendering) {
    this.graphics.setImageProperties(setting, withRendering);
  }

  /**
   * Set canvas dimension - css only
   * @param {Object} dimension - Canvas css dimension
   */
  setCanvasCssDimension(dimension) {
    this.graphics.setCanvasCssDimension(dimension);
  }

  /**
   * Set canvas dimension - css only
   * @param {Object} dimension - Canvas backstore dimension
   */
  setCanvasBackstoreDimension(dimension) {
    this.graphics.setCanvasBackstoreDimension(dimension);
  }

  /**
   * Adjust canvas dimension with scaling image
   */
  adjustCanvasDimension() {
    this.graphics.adjustCanvasDimension();
  }

  adjustCanvasDimensionBase() {
    this.graphics.adjustCanvasDimensionBase();
  }
}

export default Component;
