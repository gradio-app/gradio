/**
 * @fileoverview collections of some technic methods.
 * @author NHN.
 *         FE Development Lab <dl_javascript.nhn.com>
 */

'use strict';

var tricks = {};
var aps = Array.prototype.slice;

/**
 * Creates a debounced function that delays invoking fn until after delay milliseconds has elapsed
 * since the last time the debouced function was invoked.
 * @param {function} fn The function to debounce.
 * @param {number} [delay=0] The number of milliseconds to delay
 * @memberof tui.util
 * @returns {function} debounced function.
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * function someMethodToInvokeDebounced() {}
 *
 * var debounced = util.debounce(someMethodToInvokeDebounced, 300);
 *
 * // invoke repeatedly
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();
 * debounced();    // last invoke of debounced()
 *
 * // invoke someMethodToInvokeDebounced() after 300 milliseconds.
 */
function debounce(fn, delay) {
    var timer, args;

    /* istanbul ignore next */
    delay = delay || 0;

    function debounced() { // eslint-disable-line require-jsdoc
        args = aps.call(arguments);

        window.clearTimeout(timer);
        timer = window.setTimeout(function() {
            fn.apply(null, args);
        }, delay);
    }

    return debounced;
}

/**
 * return timestamp
 * @memberof tui.util
 * @returns {number} The number of milliseconds from Jan. 1970 00:00:00 (GMT)
 */
function timestamp() {
    return Number(new Date());
}

/**
 * Creates a throttled function that only invokes fn at most once per every interval milliseconds.
 *
 * You can use this throttle short time repeatedly invoking functions. (e.g MouseMove, Resize ...)
 *
 * if you need reuse throttled method. you must remove slugs (e.g. flag variable) related with throttling.
 * @param {function} fn function to throttle
 * @param {number} [interval=0] the number of milliseconds to throttle invocations to.
 * @memberof tui.util
 * @returns {function} throttled function
 * @example
 * //-- #1. Get Module --//
 * var util = require('tui-code-snippet'); // node, commonjs
 * var util = tui.util; // distribution file
 *
 * //-- #2. Use property --//
 * function someMethodToInvokeThrottled() {}
 *
 * var throttled = util.throttle(someMethodToInvokeThrottled, 300);
 *
 * // invoke repeatedly
 * throttled();    // invoke (leading)
 * throttled();
 * throttled();    // invoke (near 300 milliseconds)
 * throttled();
 * throttled();
 * throttled();    // invoke (near 600 milliseconds)
 * // ...
 * // invoke (trailing)
 *
 * // if you need reuse throttled method. then invoke reset()
 * throttled.reset();
 */
function throttle(fn, interval) {
    var base;
    var isLeading = true;
    var tick = function(_args) {
        fn.apply(null, _args);
        base = null;
    };
    var debounced, stamp, args;

    /* istanbul ignore next */
    interval = interval || 0;

    debounced = tricks.debounce(tick, interval);

    function throttled() { // eslint-disable-line require-jsdoc
        args = aps.call(arguments);

        if (isLeading) {
            tick(args);
            isLeading = false;

            return;
        }

        stamp = tricks.timestamp();

        base = base || stamp;

        // pass array directly because `debounce()`, `tick()` are already use
        // `apply()` method to invoke developer's `fn` handler.
        //
        // also, this `debounced` line invoked every time for implements
        // `trailing` features.
        debounced(args);

        if ((stamp - base) >= interval) {
            tick(args);
        }
    }

    function reset() { // eslint-disable-line require-jsdoc
        isLeading = true;
        base = null;
    }

    throttled.reset = reset;

    return throttled;
}

tricks.timestamp = timestamp;
tricks.debounce = debounce;
tricks.throttle = throttle;

module.exports = tricks;
