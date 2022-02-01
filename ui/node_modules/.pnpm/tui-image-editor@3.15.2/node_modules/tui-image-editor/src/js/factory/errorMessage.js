/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Error-message factory
 */
import snippet from 'tui-code-snippet';
import { keyMirror } from '@/util';

const types = keyMirror('UN_IMPLEMENTATION', 'NO_COMPONENT_NAME');
const messages = {
  UN_IMPLEMENTATION: 'Should implement a method: ',
  NO_COMPONENT_NAME: 'Should set a component name',
};
const map = {
  UN_IMPLEMENTATION(methodName) {
    return messages.UN_IMPLEMENTATION + methodName;
  },
  NO_COMPONENT_NAME() {
    return messages.NO_COMPONENT_NAME;
  },
};

export default {
  types: snippet.extend({}, types),

  create(type, ...args) {
    type = type.toLowerCase();
    const func = map[type];

    return func(...args);
  },
};
