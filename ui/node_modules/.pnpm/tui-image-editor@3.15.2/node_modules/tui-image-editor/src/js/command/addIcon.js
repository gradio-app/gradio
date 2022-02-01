/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Add an icon
 */
import commandFactory from '@/factory/command';
import { componentNames, commandNames } from '@/consts';

const { ICON } = componentNames;

const command = {
  name: commandNames.ADD_ICON,

  /**
   * Add an icon
   * @param {Graphics} graphics - Graphics instance
   * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
   * @param {Object} options - Icon options
   *      @param {string} [options.fill] - Icon foreground color
   *      @param {string} [options.left] - Icon x position
   *      @param {string} [options.top] - Icon y position
   * @returns {Promise}
   */
  execute(graphics, type, options) {
    const iconComp = graphics.getComponent(ICON);

    return iconComp.add(type, options).then((objectProps) => {
      this.undoData.object = graphics.getObject(objectProps.id);

      return objectProps;
    });
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @returns {Promise}
   */
  undo(graphics) {
    graphics.remove(this.undoData.object);

    return Promise.resolve();
  },
};

commandFactory.register(command);

export default command;
