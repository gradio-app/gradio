class Options {
  constructor () {
    this.https = false;
    this.host = null;
    this.port = 35729;

    this.snipver = null;
    this.ext = null;
    this.extver = null;

    this.mindelay = 1000;
    this.maxdelay = 60000;
    this.handshake_timeout = 5000;

    const pluginOrder = [];

    Object.defineProperty(this, 'pluginOrder', {
      get () { return pluginOrder; },
      set (v) { pluginOrder.push.apply(pluginOrder, v.split(/[,;]/)); }
    });
  }

  set (name, value) {
    if (typeof value === 'undefined') {
      return;
    }

    if (!isNaN(+value)) {
      value = +value;
    }

    this[name] = value;
  }
}

Options.extract = function (document) {
  for (const element of Array.from(document.getElementsByTagName('script'))) {
    // eslint-disable-next-line no-var
    var m;
    // eslint-disable-next-line no-var
    var mm;
    const src = element.src;
    const srcAttr = element.getAttribute('src');
    const lrUrlRegexp = /^([^:]+:\/\/([^/:]+)(?::(\d+))?\/|\/\/|\/)?([^/].*\/)?z?livereload\.js(?:\?(.*))?$/;
    //                   ^proto:// ^host       ^port     ^//  ^/   ^folder
    const lrUrlRegexpAttr = /^(?:(?:([^:/]+)?:?)\/{0,2})([^:]+)(?::(\d+))?/;
    //                              ^proto             ^host/folder ^port

    if ((m = src.match(lrUrlRegexp)) && (mm = srcAttr.match(lrUrlRegexpAttr))) {
      const [, , host, port, , params] = m;
      const [, , , portFromAttr] = mm;
      const options = new Options();

      options.https = element.src.indexOf('https') === 0;

      options.host = host;
      options.port = port
        ? parseInt(port, 10)
        : portFromAttr
          ? parseInt(portFromAttr, 10)
          : options.port;

      if (params) {
        for (const pair of params.split('&')) {
          // eslint-disable-next-line no-var
          var keyAndValue;

          if ((keyAndValue = pair.split('=')).length > 1) {
            options.set(keyAndValue[0].replace(/-/g, '_'), keyAndValue.slice(1).join('='));
          }
        }
      }

      return options;
    }
  }

  return null;
};

exports.Options = Options;
