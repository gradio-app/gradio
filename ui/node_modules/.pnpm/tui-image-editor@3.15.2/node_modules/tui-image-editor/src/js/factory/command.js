/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Command factory
 */
import Command from '@/interface/command';

const commands = {};

/**
 * Create a command
 * @param {string} name - Command name
 * @param {...*} args - Arguments for creating command
 * @returns {Command}
 * @ignore
 */
function create(name, ...args) {
  const actions = commands[name];
  if (actions) {
    return new Command(actions, args);
  }

  return null;
}

/**
 * Register a command with name as a key
 * @param {Object} command - {name:{string}, execute: {function}, undo: {function}}
 * @param {string} command.name - command name
 * @param {function} command.execute - executable function
 * @param {function} command.undo - undo function
 * @ignore
 */
function register(command) {
  commands[command.name] = command;
}

export default {
  create,
  register,
};
