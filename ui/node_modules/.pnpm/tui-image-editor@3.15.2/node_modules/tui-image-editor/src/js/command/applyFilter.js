/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Apply a filter into an image
 */
import snippet from 'tui-code-snippet';
import commandFactory from '@/factory/command';
import { componentNames, rejectMessages, commandNames } from '@/consts';

const { FILTER } = componentNames;

/**
 * Cached data for undo
 * @type {Object}
 */
let cachedUndoDataForSilent = null;

/**
 * Make undoData
 * @param {string} type - Filter type
 * @param {Object} prevfilterOption - prev Filter options
 * @param {Object} options - Filter options
 * @returns {object} - undo data
 */
function makeUndoData(type, prevfilterOption, options) {
  const undoData = {};

  if (type === 'mask') {
    undoData.object = options.mask;
  }

  undoData.options = prevfilterOption;

  return undoData;
}

const command = {
  name: commandNames.APPLY_FILTER,

  /**
   * Apply a filter into an image
   * @param {Graphics} graphics - Graphics instance
   * @param {string} type - Filter type
   * @param {Object} options - Filter options
   *  @param {number} options.maskObjId - masking image object id
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise}
   */
  execute(graphics, type, options, isSilent) {
    const filterComp = graphics.getComponent(FILTER);

    if (type === 'mask') {
      const maskObj = graphics.getObject(options.maskObjId);

      if (!(maskObj && maskObj.isType('image'))) {
        return Promise.reject(rejectMessages.invalidParameters);
      }

      snippet.extend(options, { mask: maskObj });
      graphics.remove(options.mask);
    }
    if (!this.isRedo) {
      const prevfilterOption = filterComp.getOptions(type);
      const undoData = makeUndoData(type, prevfilterOption, options);

      cachedUndoDataForSilent = this.setUndoData(undoData, cachedUndoDataForSilent, isSilent);
    }

    return filterComp.add(type, options);
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @param {string} type - Filter type
   * @returns {Promise}
   */
  undo(graphics, type) {
    const filterComp = graphics.getComponent(FILTER);

    if (type === 'mask') {
      const mask = this.undoData.object;
      graphics.add(mask);
      graphics.setActiveObject(mask);

      return filterComp.remove(type);
    }

    // options changed case
    if (this.undoData.options) {
      return filterComp.add(type, this.undoData.options);
    }

    // filter added case
    return filterComp.remove(type);
  },
};

commandFactory.register(command);

export default command;
