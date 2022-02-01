"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disposables = disposables;
exports.shared = void 0;

function disposables() {
  let disposables = [];
  let api = {
    add(cb) {
      disposables.push(cb);
      return () => {
        let idx = disposables.indexOf(cb);
        if (idx !== -1) disposables.splice(idx, 1);
      };
    },

    dispose() {
      disposables.splice(0).forEach(dispose => dispose());
    }

  };
  return api;
} // A shared disposables collection


let shared = disposables();
exports.shared = shared;