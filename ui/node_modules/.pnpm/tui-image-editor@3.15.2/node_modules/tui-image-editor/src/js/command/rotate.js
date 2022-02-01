/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Rotate an image
 */
import commandFactory from '@/factory/command';
import { componentNames, commandNames } from '@/consts';

const { ROTATION } = componentNames;

/**
 * Cached data for undo
 * @type {Object}
 */
let cachedUndoDataForSilent = null;

/**
 * Make undo data
 * @param {Component} rotationComp - rotation component
 * @returns {object} - undodata
 */
function makeUndoData(rotationComp) {
  return {
    angle: rotationComp.getCurrentAngle(),
  };
}

const command = {
  name: commandNames.ROTATE_IMAGE,

  /**
   * Rotate an image
   * @param {Graphics} graphics - Graphics instance
   * @param {string} type - 'rotate' or 'setAngle'
   * @param {number} angle - angle value (degree)
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise}
   */
  execute(graphics, type, angle, isSilent) {
    const rotationComp = graphics.getComponent(ROTATION);

    if (!this.isRedo) {
      const undoData = makeUndoData(rotationComp);

      cachedUndoDataForSilent = this.setUndoData(undoData, cachedUndoDataForSilent, isSilent);
    }

    return rotationComp[type](angle);
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @returns {Promise}
   */
  undo(graphics) {
    const rotationComp = graphics.getComponent(ROTATION);
    const [, type, angle] = this.args;

    if (type === 'setAngle') {
      return rotationComp[type](this.undoData.angle);
    }

    return rotationComp.rotate(-angle);
  },
};

commandFactory.register(command);

export default command;
