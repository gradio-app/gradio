/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Command interface
 */
import snippet from 'tui-code-snippet';
import errorMessage from '@/factory/errorMessage';

const createMessage = errorMessage.create;
const errorTypes = errorMessage.types;

/**
 * Command class
 * @class
 * @param {{name:function, execute: function, undo: function,
 *          executeCallback: function, undoCallback: function}} actions - Command actions
 * @param {Array} args - passing arguments on execute, undo
 * @ignore
 */
class Command {
  constructor(actions, args) {
    /**
     * command name
     * @type {string}
     */
    this.name = actions.name;

    /**
     * arguments
     * @type {Array}
     */
    this.args = args;

    /**
     * Execute function
     * @type {function}
     */
    this.execute = actions.execute;

    /**
     * Undo function
     * @type {function}
     */
    this.undo = actions.undo;

    /**
     * executeCallback
     * @type {function}
     */
    this.executeCallback = actions.executeCallback || null;

    /**
     * undoCallback
     * @type {function}
     */
    this.undoCallback = actions.undoCallback || null;

    /**
     * data for undo
     * @type {Object}
     */
    this.undoData = {};
  }

  /**
   * Execute action
   * @param {Object.<string, Component>} compMap - Components injection
   * @abstract
   */
  execute() {
    throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'execute'));
  }

  /**
   * Undo action
   * @param {Object.<string, Component>} compMap - Components injection
   * @abstract
   */
  undo() {
    throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'undo'));
  }

  /**
   * command for redo if undoData exists
   * @returns {boolean} isRedo
   */
  get isRedo() {
    return Object.keys(this.undoData).length > 0;
  }

  /**
   * Set undoData action
   * @param {Object} undoData - maked undo data
   * @param {Object} cachedUndoDataForSilent - cached undo data
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Object} cachedUndoDataForSilent
   */
  setUndoData(undoData, cachedUndoDataForSilent, isSilent) {
    if (cachedUndoDataForSilent) {
      undoData = cachedUndoDataForSilent;
    }

    if (!isSilent) {
      snippet.extend(this.undoData, undoData);
      cachedUndoDataForSilent = null;
    } else if (!cachedUndoDataForSilent) {
      cachedUndoDataForSilent = undoData;
    }

    return cachedUndoDataForSilent;
  }

  /**
   * Attach execute callabck
   * @param {function} callback - Callback after execution
   * @returns {Command} this
   */
  setExecuteCallback(callback) {
    this.executeCallback = callback;

    return this;
  }

  /**
   * Attach undo callback
   * @param {function} callback - Callback after undo
   * @returns {Command} this
   */
  setUndoCallback(callback) {
    this.undoCallback = callback;

    return this;
  }
}

export default Command;
