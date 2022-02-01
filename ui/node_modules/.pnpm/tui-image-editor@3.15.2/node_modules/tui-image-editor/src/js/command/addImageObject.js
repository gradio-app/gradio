/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Add an image object
 */
import commandFactory from '@/factory/command';
import { commandNames } from '@/consts';

const command = {
  name: commandNames.ADD_IMAGE_OBJECT,

  /**
   * Add an image object
   * @param {Graphics} graphics - Graphics instance
   * @param {string} imgUrl - Image url to make object
   * @returns {Promise}
   */
  execute(graphics, imgUrl) {
    return graphics.addImageObject(imgUrl).then((objectProps) => {
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
