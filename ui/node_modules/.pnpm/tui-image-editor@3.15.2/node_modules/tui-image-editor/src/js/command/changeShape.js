/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview change a shape
 */
import snippet from 'tui-code-snippet';
import commandFactory from '@/factory/command';
import { componentNames, rejectMessages, commandNames } from '@/consts';

const { SHAPE } = componentNames;

/**
 * Cached data for undo
 * @type {Object}
 */
let cachedUndoDataForSilent = null;

/**
 * Make undoData
 * @param {object} options - shape options
 * @param {Component} targetObj - shape component
 * @returns {object} - undo data
 */
function makeUndoData(options, targetObj) {
  const undoData = {
    object: targetObj,
    options: {},
  };

  snippet.forEachOwnProperties(options, (value, key) => {
    undoData.options[key] = targetObj[key];
  });

  return undoData;
}

const command = {
  name: commandNames.CHANGE_SHAPE,

  /**
   * Change a shape
   * @param {Graphics} graphics - Graphics instance
   * @param {number} id - object id
   * @param {Object} options - Shape options
   *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
   *      @param {string} [options.stroke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   *      @param {number} [options.left] - Shape x position
   *      @param {number} [options.top] - Shape y position
   *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise}
   */
  execute(graphics, id, options, isSilent) {
    const shapeComp = graphics.getComponent(SHAPE);
    const targetObj = graphics.getObject(id);

    if (!targetObj) {
      return Promise.reject(rejectMessages.noObject);
    }

    if (!this.isRedo) {
      const undoData = makeUndoData(options, targetObj);

      cachedUndoDataForSilent = this.setUndoData(undoData, cachedUndoDataForSilent, isSilent);
    }

    return shapeComp.change(targetObj, options);
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @returns {Promise}
   */
  undo(graphics) {
    const shapeComp = graphics.getComponent(SHAPE);
    const { object: shape, options } = this.undoData;

    return shapeComp.change(shape, options);
  },
};

commandFactory.register(command);

export default command;
