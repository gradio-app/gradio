/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Add a text object
 */
import commandFactory from '@/factory/command';
import { componentNames, commandNames, rejectMessages } from '@/consts';
import {
  setCachedUndoDataForDimension,
  makeSelectionUndoData,
  makeSelectionUndoDatum,
} from '@/helper/selectionModifyHelper';

const { TEXT } = componentNames;

const command = {
  name: commandNames.ADD_TEXT,

  /**
   * Add a text object
   * @param {Graphics} graphics - Graphics instance
   * @param {string} text - Initial input text
   * @param {Object} [options] Options for text styles
   *     @param {Object} [options.styles] Initial styles
   *         @param {string} [options.styles.fill] Color
   *         @param {string} [options.styles.fontFamily] Font type for text
   *         @param {number} [options.styles.fontSize] Size
   *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
   *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
   *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
   *         @param {string} [options.styles.textDecoration] Type of line (underline / line-through / overline)
   *     @param {{x: number, y: number}} [options.position] - Initial position
   * @returns {Promise}
   */
  execute(graphics, text, options) {
    const textComp = graphics.getComponent(TEXT);

    if (this.undoData.object) {
      const undoObject = this.undoData.object;

      return new Promise((resolve, reject) => {
        if (!graphics.contains(undoObject)) {
          graphics.add(undoObject);
          resolve(undoObject);
        } else {
          reject(rejectMessages.redo);
        }
      });
    }

    return textComp.add(text, options).then((objectProps) => {
      const { id } = objectProps;
      const textObject = graphics.getObject(id);

      this.undoData.object = textObject;

      setCachedUndoDataForDimension(
        makeSelectionUndoData(textObject, () => makeSelectionUndoDatum(id, textObject, false))
      );

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
