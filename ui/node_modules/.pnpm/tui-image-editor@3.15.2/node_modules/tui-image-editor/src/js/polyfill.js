/* eslint-disable */

// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;

    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.2.20171210
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ('document' in self) {
  // Full polyfill for browsers with no classList support
  // Including IE < Edge missing SVGElement.classList
  if (
    !('classList' in document.createElement('_')) ||
    (document.createElementNS &&
      !('classList' in document.createElementNS('http://www.w3.org/2000/svg', 'g')))
  ) {
    (function (view) {
      'use strict';

      if (!('Element' in view)) return;

      var classListProp = 'classList',
        protoProp = 'prototype',
        elemCtrProto = view.Element[protoProp],
        objCtr = Object,
        strTrim =
          String[protoProp].trim ||
          function () {
            return this.replace(/^\s+|\s+$/g, '');
          },
        arrIndexOf =
          Array[protoProp].indexOf ||
          function (item) {
            var i = 0,
              len = this.length;
            for (; i < len; i++) {
              if (i in this && this[i] === item) {
                return i;
              }
            }
            return -1;
          },
        // Vendors: please allow content code to instantiate DOMExceptions
        DOMEx = function (type, message) {
          this.name = type;
          this.code = DOMException[type];
          this.message = message;
        },
        checkTokenAndGetIndex = function (classList, token) {
          if (token === '') {
            throw new DOMEx('SYNTAX_ERR', 'The token must not be empty.');
          }
          if (/\s/.test(token)) {
            throw new DOMEx(
              'INVALID_CHARACTER_ERR',
              'The token must not contain space characters.'
            );
          }
          return arrIndexOf.call(classList, token);
        },
        ClassList = function (elem) {
          var trimmedClasses = strTrim.call(elem.getAttribute('class') || ''),
            classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
            i = 0,
            len = classes.length;
          for (; i < len; i++) {
            this.push(classes[i]);
          }
          this._updateClassName = function () {
            elem.setAttribute('class', this.toString());
          };
        },
        classListProto = (ClassList[protoProp] = []),
        classListGetter = function () {
          return new ClassList(this);
        };
      // Most DOMException implementations don't allow calling DOMException's toString()
      // on non-DOMExceptions. Error's toString() is sufficient here.
      DOMEx[protoProp] = Error[protoProp];
      classListProto.item = function (i) {
        return this[i] || null;
      };
      classListProto.contains = function (token) {
        return ~checkTokenAndGetIndex(this, token + '');
      };
      classListProto.add = function () {
        var tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false;
        do {
          token = tokens[i] + '';
          if (!~checkTokenAndGetIndex(this, token)) {
            this.push(token);
            updated = true;
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.remove = function () {
        var tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false,
          index;
        do {
          token = tokens[i] + '';
          index = checkTokenAndGetIndex(this, token);
          while (~index) {
            this.splice(index, 1);
            updated = true;
            index = checkTokenAndGetIndex(this, token);
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.toggle = function (token, force) {
        var result = this.contains(token),
          method = result ? force !== true && 'remove' : force !== false && 'add';
        if (method) {
          this[method](token);
        }

        if (force === true || force === false) {
          return force;
        } else {
          return !result;
        }
      };
      classListProto.replace = function (token, replacement_token) {
        var index = checkTokenAndGetIndex(token + '');
        if (~index) {
          this.splice(index, 1, replacement_token);
          this._updateClassName();
        }
      };
      classListProto.toString = function () {
        return this.join(' ');
      };

      if (objCtr.defineProperty) {
        var classListPropDesc = {
          get: classListGetter,
          enumerable: true,
          configurable: true,
        };
        try {
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) {
          // IE 8 doesn't support enumerable:true
          // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
          // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
          if (ex.number === undefined || ex.number === -0x7ff5ec54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
          }
        }
      } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
      }
    })(self);
  }

  // There is full or partial native classList support, so just check if we need
  // to normalize the add/remove and toggle APIs.

  (function () {
    'use strict';

    var testElement = document.createElement('_');

    testElement.classList.add('c1', 'c2');

    // Polyfill for IE 10/11 and Firefox <26, where classList.add and
    // classList.remove exist but support only one argument at a time.
    if (!testElement.classList.contains('c2')) {
      var createMethod = function (method) {
        var original = DOMTokenList.prototype[method];

        DOMTokenList.prototype[method] = function (token) {
          var i,
            len = arguments.length;

          for (i = 0; i < len; i++) {
            token = arguments[i];
            original.call(this, token);
          }
        };
      };
      createMethod('add');
      createMethod('remove');
    }

    testElement.classList.toggle('c3', false);

    // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
    // support the second argument.
    if (testElement.classList.contains('c3')) {
      var _toggle = DOMTokenList.prototype.toggle;

      DOMTokenList.prototype.toggle = function (token, force) {
        if (1 in arguments && !this.contains(token) === !force) {
          return force;
        } else {
          return _toggle.call(this, token);
        }
      };
    }

    // replace() polyfill
    if (!('replace' in document.createElement('_').classList)) {
      DOMTokenList.prototype.replace = function (token, replacement_token) {
        var tokens = this.toString().split(' '),
          index = tokens.indexOf(token + '');
        if (~index) {
          tokens = tokens.slice(index);
          this.remove.apply(this, tokens);
          this.add(replacement_token);
          this.add.apply(this, tokens.slice(1));
        }
      };
    }

    testElement = null;
  })();
}

/*!
 * @copyright Copyright (c) 2017 IcoMoon.io
 * @license   Licensed under MIT license
 *            See https://github.com/Keyamoon/svgxuse
 * @version   1.2.6
 */
/*jslint browser: true */
/*global XDomainRequest, MutationObserver, window */
(function () {
  'use strict';
  if (typeof window !== 'undefined' && window.addEventListener) {
    var cache = Object.create(null); // holds xhr objects to prevent multiple requests
    var checkUseElems;
    var tid; // timeout id
    var debouncedCheck = function () {
      clearTimeout(tid);
      tid = setTimeout(checkUseElems, 100);
    };
    var unobserveChanges = function () {
      return;
    };
    var observeChanges = function () {
      var observer;
      window.addEventListener('resize', debouncedCheck, false);
      window.addEventListener('orientationchange', debouncedCheck, false);
      if (window.MutationObserver) {
        observer = new MutationObserver(debouncedCheck);
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        unobserveChanges = function () {
          try {
            observer.disconnect();
            window.removeEventListener('resize', debouncedCheck, false);
            window.removeEventListener('orientationchange', debouncedCheck, false);
          } catch (ignore) {}
        };
      } else {
        document.documentElement.addEventListener('DOMSubtreeModified', debouncedCheck, false);
        unobserveChanges = function () {
          document.documentElement.removeEventListener('DOMSubtreeModified', debouncedCheck, false);
          window.removeEventListener('resize', debouncedCheck, false);
          window.removeEventListener('orientationchange', debouncedCheck, false);
        };
      }
    };
    var createRequest = function (url) {
      // In IE 9, cross origin requests can only be sent using XDomainRequest.
      // XDomainRequest would fail if CORS headers are not set.
      // Therefore, XDomainRequest should only be used with cross origin requests.
      function getOrigin(loc) {
        var a;
        if (loc.protocol !== undefined) {
          a = loc;
        } else {
          a = document.createElement('a');
          a.href = loc;
        }
        return a.protocol.replace(/:/g, '') + a.host;
      }
      var Request;
      var origin;
      var origin2;
      if (window.XMLHttpRequest) {
        Request = new XMLHttpRequest();
        origin = getOrigin(location);
        origin2 = getOrigin(url);
        if (Request.withCredentials === undefined && origin2 !== '' && origin2 !== origin) {
          Request = XDomainRequest || undefined;
        } else {
          Request = XMLHttpRequest;
        }
      }
      return Request;
    };
    var xlinkNS = 'http://www.w3.org/1999/xlink';
    checkUseElems = function () {
      var base;
      var bcr;
      var fallback = ''; // optional fallback URL in case no base path to SVG file was given and no symbol definition was found.
      var hash;
      var href;
      var i;
      var inProgressCount = 0;
      var isHidden;
      var Request;
      var url;
      var uses;
      var xhr;
      function observeIfDone() {
        // If done with making changes, start watching for chagnes in DOM again
        inProgressCount -= 1;
        if (inProgressCount === 0) {
          // if all xhrs were resolved
          unobserveChanges(); // make sure to remove old handlers
          observeChanges(); // watch for changes to DOM
        }
      }
      function attrUpdateFunc(spec) {
        return function () {
          if (cache[spec.base] !== true) {
            spec.useEl.setAttributeNS(xlinkNS, 'xlink:href', '#' + spec.hash);
            if (spec.useEl.hasAttribute('href')) {
              spec.useEl.setAttribute('href', '#' + spec.hash);
            }
          }
        };
      }
      function onloadFunc(xhr) {
        return function () {
          var body = document.body;
          var x = document.createElement('x');
          var svg;
          xhr.onload = null;
          x.innerHTML = xhr.responseText;
          svg = x.getElementsByTagName('svg')[0];
          if (svg) {
            svg.setAttribute('aria-hidden', 'true');
            svg.style.position = 'absolute';
            svg.style.width = 0;
            svg.style.height = 0;
            svg.style.overflow = 'hidden';
            body.insertBefore(svg, body.firstChild);
          }
          observeIfDone();
        };
      }
      function onErrorTimeout(xhr) {
        return function () {
          xhr.onerror = null;
          xhr.ontimeout = null;
          observeIfDone();
        };
      }
      unobserveChanges(); // stop watching for changes to DOM
      // find all use elements
      uses = document.getElementsByTagName('use');
      for (i = 0; i < uses.length; i += 1) {
        try {
          bcr = uses[i].getBoundingClientRect();
        } catch (ignore) {
          // failed to get bounding rectangle of the use element
          bcr = false;
        }
        href =
          uses[i].getAttribute('href') ||
          uses[i].getAttributeNS(xlinkNS, 'href') ||
          uses[i].getAttribute('xlink:href');
        if (href && href.split) {
          url = href.split('#');
        } else {
          url = ['', ''];
        }
        base = url[0];
        hash = url[1];
        isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;
        if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
          // the use element is empty
          // if there is a reference to an external SVG, try to fetch it
          // use the optional fallback URL if there is no reference to an external SVG
          if (fallback && !base.length && hash && !document.getElementById(hash)) {
            base = fallback;
          }
          if (uses[i].hasAttribute('href')) {
            uses[i].setAttributeNS(xlinkNS, 'xlink:href', href);
          }
          if (base.length) {
            // schedule updating xlink:href
            xhr = cache[base];
            if (xhr !== true) {
              // true signifies that prepending the SVG was not required
              setTimeout(
                attrUpdateFunc({
                  useEl: uses[i],
                  base: base,
                  hash: hash,
                }),
                0
              );
            }
            if (xhr === undefined) {
              Request = createRequest(base);
              if (Request !== undefined) {
                xhr = new Request();
                cache[base] = xhr;
                xhr.onload = onloadFunc(xhr);
                xhr.onerror = onErrorTimeout(xhr);
                xhr.ontimeout = onErrorTimeout(xhr);
                xhr.open('GET', base);
                xhr.send();
                inProgressCount += 1;
              }
            }
          }
        } else {
          if (!isHidden) {
            if (cache[base] === undefined) {
              // remember this URL if the use element was not empty and no request was sent
              cache[base] = true;
            } else if (cache[base].onload) {
              // if it turns out that prepending the SVG is not necessary,
              // abort the in-progress xhr.
              cache[base].abort();
              delete cache[base].onload;
              cache[base] = true;
            }
          } else if (base.length && cache[base]) {
            setTimeout(
              attrUpdateFunc({
                useEl: uses[i],
                base: base,
                hash: hash,
              }),
              0
            );
          }
        }
      }
      uses = '';
      inProgressCount += 1;
      observeIfDone();
    };
    var winLoad;
    winLoad = function () {
      window.removeEventListener('load', winLoad, false); // to prevent memory leaks
      tid = setTimeout(checkUseElems, 0);
    };
    if (document.readyState !== 'complete') {
      // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
      window.addEventListener('load', winLoad, false);
    } else {
      // No need to add a listener if the document is already loaded, initialize immediately.
      winLoad();
    }
  }
})();
