/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Remove a filter from an image
 */
import commandFactory from '@/factory/command';
import { componentNames, commandNames } from '@/consts';

const { FILTER } = componentNames;

const command = {
  name: commandNames.REMOVE_FILTER,

  /**
   * Remove a filter from an image
   * @param {Graphics} graphics - Graphics instance
   * @param {string} type - Filter type
   * @returns {Promise}
   */
  execute(graphics, type) {
    const filterComp = graphics.getComponent(FILTER);

    this.undoData.options = filterComp.getOptions(type);

    return filterComp.remove(type);
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @param {string} type - Filter type
   * @returns {Promise}
   */
  undo(graphics, type) {
    const filterComp = graphics.getComponent(FILTER);
    const { options } = this.undoData;

    return filterComp.add(type, options);
  },
};

commandFactory.register(command);

export default command;
