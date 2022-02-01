/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Invoker - invoke commands
 */
import { isString, CustomEvents } from 'tui-code-snippet';
import commandFactory from '@/factory/command';
import { isFunction } from '@/util';
import { eventNames, rejectMessages } from '@/consts';

/**
 * Invoker
 * @class
 * @ignore
 */
class Invoker {
  constructor() {
    /**
     * Undo stack
     * @type {Array.<Command>}
     * @private
     */
    this._undoStack = [];

    /**
     * Redo stack
     * @type {Array.<Command>}
     * @private
     */
    this._redoStack = [];

    /**
     * Lock-flag for executing command
     * @type {boolean}
     * @private
     */
    this._isLocked = false;

    this._isSilent = false;
  }

  /**
   * Invoke command execution
   * @param {Command} command - Command
   * @param {boolean} [isRedo=false] - check if command is redo
   * @returns {Promise}
   * @private
   */
  _invokeExecution(command, isRedo = false) {
    this.lock();

    let { args } = command;
    if (!args) {
      args = [];
    }

    return command
      .execute(...args)
      .then((value) => {
        if (!this._isSilent) {
          this.pushUndoStack(command);

          this.fire(isRedo ? eventNames.AFTER_REDO : eventNames.EXECUTE_COMMAND, command);
        }
        this.unlock();
        if (isFunction(command.executeCallback)) {
          command.executeCallback(value);
        }

        return value;
      })
      ['catch']((message) => {
        this.unlock();

        return Promise.reject(message);
      });
  }

  /**
   * Invoke command undo
   * @param {Command} command - Command
   * @returns {Promise}
   * @private
   */
  _invokeUndo(command) {
    this.lock();

    let { args } = command;
    if (!args) {
      args = [];
    }

    return command
      .undo(...args)
      .then((value) => {
        this.pushRedoStack(command);
        this.fire(eventNames.AFTER_UNDO, command);
        this.unlock();
        if (isFunction(command.undoCallback)) {
          command.undoCallback(value);
        }

        return value;
      })
      ['catch']((message) => {
        this.unlock();

        return Promise.reject(message);
      });
  }

  /**
   * fire REDO_STACK_CHANGED event
   * @private
   */
  _fireRedoStackChanged() {
    this.fire(eventNames.REDO_STACK_CHANGED, this._redoStack.length);
  }

  /**
   * fire UNDO_STACK_CHANGED event
   * @private
   */
  _fireUndoStackChanged() {
    this.fire(eventNames.UNDO_STACK_CHANGED, this._undoStack.length);
  }

  /**
   * Lock this invoker
   */
  lock() {
    this._isLocked = true;
  }

  /**
   * Unlock this invoker
   */
  unlock() {
    this._isLocked = false;
  }

  executeSilent(...args) {
    this._isSilent = true;

    return this.execute(...args, this._isSilent).then(() => {
      this._isSilent = false;
    });
  }

  /**
   * Invoke command
   * Store the command to the undoStack
   * Clear the redoStack
   * @param {String} commandName - Command name
   * @param {...*} args - Arguments for creating command
   * @returns {Promise}
   */
  execute(...args) {
    if (this._isLocked) {
      return Promise.reject(rejectMessages.isLock);
    }

    let [command] = args;
    if (isString(command)) {
      command = commandFactory.create(...args);
    }

    return this._invokeExecution(command).then((value) => {
      this.clearRedoStack();

      return value;
    });
  }

  /**
   * Undo command
   * @returns {Promise}
   */
  undo() {
    let command = this._undoStack.pop();
    let promise;
    let message = '';

    if (command && this._isLocked) {
      this.pushUndoStack(command, true);
      command = null;
    }
    if (command) {
      if (this.isEmptyUndoStack()) {
        this._fireUndoStackChanged();
      }
      promise = this._invokeUndo(command);
    } else {
      message = rejectMessages.undo;
      if (this._isLocked) {
        message = `${message} Because ${rejectMessages.isLock}`;
      }
      promise = Promise.reject(message);
    }

    return promise;
  }

  /**
   * Redo command
   * @returns {Promise}
   */
  redo() {
    let command = this._redoStack.pop();
    let promise;
    let message = '';

    if (command && this._isLocked) {
      this.pushRedoStack(command, true);
      command = null;
    }
    if (command) {
      if (this.isEmptyRedoStack()) {
        this._fireRedoStackChanged();
      }
      promise = this._invokeExecution(command, true);
    } else {
      message = rejectMessages.redo;
      if (this._isLocked) {
        message = `${message} Because ${rejectMessages.isLock}`;
      }
      promise = Promise.reject(message);
    }

    return promise;
  }

  /**
   * Push undo stack
   * @param {Command} command - command
   * @param {boolean} [isSilent] - Fire event or not
   */
  pushUndoStack(command, isSilent) {
    this._undoStack.push(command);
    if (!isSilent) {
      this._fireUndoStackChanged();
    }
  }

  /**
   * Push redo stack
   * @param {Command} command - command
   * @param {boolean} [isSilent] - Fire event or not
   */
  pushRedoStack(command, isSilent) {
    this._redoStack.push(command);
    if (!isSilent) {
      this._fireRedoStackChanged();
    }
  }

  /**
   * Return whether the redoStack is empty
   * @returns {boolean}
   */
  isEmptyRedoStack() {
    return this._redoStack.length === 0;
  }

  /**
   * Return whether the undoStack is empty
   * @returns {boolean}
   */
  isEmptyUndoStack() {
    return this._undoStack.length === 0;
  }

  /**
   * Clear undoStack
   */
  clearUndoStack() {
    if (!this.isEmptyUndoStack()) {
      this._undoStack = [];
      this._fireUndoStackChanged();
    }
  }

  /**
   * Clear redoStack
   */
  clearRedoStack() {
    if (!this.isEmptyRedoStack()) {
      this._redoStack = [];
      this._fireRedoStackChanged();
    }
  }
}

CustomEvents.mixin(Invoker);

export default Invoker;
