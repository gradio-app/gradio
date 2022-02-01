'use strict'

module.exports = function (tasks, initial) {
  if (!Array.isArray(tasks)) {
    return Promise.reject(new TypeError('promise.series only accepts an array of functions'))
  }
  return tasks.reduce((current, next) => {
    return current.then(next)
  }, Promise.resolve(initial))
}
