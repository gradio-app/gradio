/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Set object properties
 */
import snippet from 'tui-code-snippet';
import commandFactory from '@/factory/command';
import { commandNames, rejectMessages } from '@/consts';

const command = {
  name: commandNames.SET_OBJECT_PROPERTIES,

  /**
   * Set object properties
   * @param {Graphics} graphics - Graphics instance
   * @param {number} id - object id
   * @param {Object} props - properties
   *     @param {string} [props.fill] Color
   *     @param {string} [props.fontFamily] Font type for text
   *     @param {number} [props.fontSize] Size
   *     @param {string} [props.fontStyle] Type of inclination (normal / italic)
   *     @param {string} [props.fontWeight] Type of thicker or thinner looking (normal / bold)
   *     @param {string} [props.textAlign] Type of text align (left / center / right)
   *     @param {string} [props.textDecoration] Type of line (underline / line-through / overline)
   * @returns {Promise}
   */
  execute(graphics, id, props) {
    const targetObj = graphics.getObject(id);

    if (!targetObj) {
      return Promise.reject(rejectMessages.noObject);
    }

    this.undoData.props = {};
    snippet.forEachOwnProperties(props, (value, key) => {
      this.undoData.props[key] = targetObj[key];
    });

    graphics.setObjectProperties(id, props);

    return Promise.resolve();
  },

  /**
   * @param {Graphics} graphics - Graphics instance
   * @param {number} id - object id
   * @returns {Promise}
   */
  undo(graphics, id) {
    const { props } = this.undoData;

    graphics.setObjectProperties(id, props);

    return Promise.resolve();
  },
};

commandFactory.register(command);

export default command;
